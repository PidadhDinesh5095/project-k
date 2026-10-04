import rateLimit from 'express-rate-limit';

// General API rate limit — generous, just a backstop against abuse.
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
});

// OTP send is the sensitive one — this is the FIRST line of defense (per-IP);
// the second, per-phone-number line lives in utils/otpService.checkOtpSendRateLimit
// via Upstash Redis, since an attacker can rotate IPs but not phone numbers as easily.
const otpSendLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, message: 'Too many OTP requests from this device. Please wait and try again.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const otpVerifyLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { success: false, message: 'Too many verification attempts. Please wait and try again.' },
  standardHeaders: true,
  legacyHeaders: false,
});

export default { generalLimiter, otpSendLimiter, otpVerifyLimiter };
