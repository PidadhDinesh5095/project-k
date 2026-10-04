import express from 'express';
const router = express.Router();
import order from '../controllers/orderController.js';
import validate from '../middleware/validate.middleware.js';
import schemas from '../utils/validation.js';
import __cjsModule579 from '../middleware/auth.middleware.js';
const { requireAuth } = __cjsModule579;

router.use(requireAuth);
router.post('/', validate(schemas.createOrder), order.createOrder);
router.get('/', order.listOrders);
router.get('/:id', order.getOrderById);
router.get('/:id/invoice', order.getInvoice);
router.patch('/:id/cancel', order.cancelOrder);

export default router;
