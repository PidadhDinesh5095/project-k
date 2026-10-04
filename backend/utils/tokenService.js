import jwt from 'jsonwebtoken';
import crypto from 'crypto';

const ACCESS_TOKEN_TTL = '15m';
const REFRESH_TOKEN_TTL = '30d';

function signAccessToken(userId) {
  return jwt.sign({ sub: userId, type: 'access' }, process.env.JWT_SECRET, { expiresIn: ACCESS_TOKEN_TTL });
}

function signRefreshToken(userId) {
  return jwt.sign({ sub: userId, type: 'refresh' }, process.env.JWT_REFRESH_SECRET, { expiresIn: REFRESH_TOKEN_TTL });
}

function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

function verifyAccessToken(token) {
  return jwt.verify(token, process.env.JWT_SECRET);
}

function verifyRefreshToken(token) {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
}

export default { signAccessToken, signRefreshToken, hashToken, verifyAccessToken, verifyRefreshToken };
