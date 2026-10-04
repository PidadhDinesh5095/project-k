import express from 'express';
const router = express.Router();
import payment from '../controllers/paymentController.js';
import validate from '../middleware/validate.middleware.js';
import schemas from '../utils/validation.js';
import __cjsModule580 from '../middleware/auth.middleware.js';
const { requireAuth } = __cjsModule580;

router.use(requireAuth);
router.post('/', validate(schemas.addPaymentMethod), payment.addPaymentMethod);
router.get('/', payment.listPaymentMethods);
router.delete('/:id', payment.deletePaymentMethod);

export default router;
