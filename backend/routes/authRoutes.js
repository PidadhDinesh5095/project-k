import express from 'express';
const router = express.Router();
import auth from '../controllers/authController.js';
import validate from '../middleware/validate.middleware.js';
import schemas from '../utils/validation.js';
import __cjsModule575 from '../middleware/auth.middleware.js';
const { requireAuth } = __cjsModule575;
import __cjsModule576 from '../middleware/rateLimiter.middleware.js';
const { otpSendLimiter, otpVerifyLimiter } = __cjsModule576;

router.post('/otp/send', otpSendLimiter, validate(schemas.sendOtp), auth.sendOtp);
router.post('/otp/verify', otpVerifyLimiter, validate(schemas.verifyOtp), auth.verifyOtp);
router.post('/refresh', validate(schemas.refresh), auth.refresh);
router.post('/logout', requireAuth, auth.logout);

export default router;
