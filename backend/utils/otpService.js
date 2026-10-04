import axios from 'axios';
import crypto from 'crypto';
import pool from '../db/pool.js';
import { redisClient } from '../config/redis.js';

const OTP_TTL_SECONDS = 5 * 60;
const MAX_VERIFY_ATTEMPTS = 5;

function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function hashOtp(otp, phone) {
  return crypto.createHash('sha256').update(`${otp}:${phone}:${process.env.OTP_SALT}`).digest('hex');
}

// MSG91's REST OTP API — India-focused delivery rates and pricing, called
// directly via axios so no extra SDK dependency is needed.
async function sendViaMsg91(phone, otp) {
  if (process.env.NODE_ENV === 'development' && process.env.OTP_DEBUG_MODE === 'true') {
    console.log(`[otp:debug] ${phone} -> ${otp}`); // never log real OTPs in production
    return;
  }
  await axios.post(
    'https://control.msg91.com/api/v5/otp',
    { mobile: phone, otp, template_id: process.env.MSG91_TEMPLATE_ID },
    { headers: { authkey: process.env.MSG91_AUTH_KEY } }
  );
}

async function requestOtp(phone) {
  const otp = generateOtp();
  const otpHash = hashOtp(otp, phone);
  const expiresAt = new Date(Date.now() + OTP_TTL_SECONDS * 1000);

  await pool.query('DELETE FROM otp_verifications WHERE phone = $1', [phone]); // invalidate any earlier pending OTP
  await pool.query(
    'INSERT INTO otp_verifications (phone, otp_hash, expires_at) VALUES ($1, $2, $3)',
    [phone, otpHash, expiresAt]
  );

  await sendViaMsg91(phone, otp);
  return { expiresInSeconds: OTP_TTL_SECONDS };
}

async function verifyOtp(phone, otp) {
  const { rows } = await pool.query(
    'SELECT * FROM otp_verifications WHERE phone = $1 ORDER BY created_at DESC LIMIT 1',
    [phone]
  );
  const record = rows[0];

  if (!record || new Date(record.expires_at) < new Date()) {
    const err = new Error('No OTP request found for this number, or it has expired.');
    err.statusCode = 400;
    throw err;
  }
  if (record.verified) {
    const err = new Error('This OTP has already been used.');
    err.statusCode = 400;
    throw err;
  }
  if (record.attempts >= MAX_VERIFY_ATTEMPTS) {
    const err = new Error('Too many incorrect attempts. Please request a new OTP.');
    err.statusCode = 429;
    throw err;
  }

  const candidateHash = hashOtp(otp, phone);
  if (candidateHash !== record.otp_hash) {
    await pool.query('UPDATE otp_verifications SET attempts = attempts + 1 WHERE id = $1', [record.id]);
    const err = new Error('Incorrect OTP.');
    err.statusCode = 400;
    throw err;
  }

  await pool.query('UPDATE otp_verifications SET verified = true WHERE id = $1', [record.id]);
  return true;
}

// Rate limiting lives in Redis (Upstash) rather than Postgres purely for speed —
// checked on every /auth/otp/send call before we even touch MSG91 or the DB.
async function checkOtpSendRateLimit(phone) {
  const key = `otp:send:${phone}`;
  const count = await redisClient.incr(key);

  if (count === 1) {
    await redisClient.expire(key, 15 * 60);
  }

  const MAX_SENDS_PER_15_MINUTES = 3;

  if (count > MAX_SENDS_PER_15_MINUTES) {
    const err = new Error(
      "Too many OTP requests for this number. Please try again later after 15 minutes."
    );
    err.statusCode = 429;
    throw err;
  }
}

// Postgres has no built-in TTL index like Mongo — call this periodically
// (a cron job or on a schedule in server.js) to clean up expired OTP rows.
async function cleanupExpiredOtps() {
  await pool.query('DELETE FROM otp_verifications WHERE expires_at < now()');
}

export default { requestOtp, verifyOtp, checkOtpSendRateLimit, cleanupExpiredOtps };
