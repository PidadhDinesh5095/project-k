import express from 'express';
const router = express.Router();
import product from '../controllers/productController.js';
import __cjsModule581 from '../middleware/auth.middleware.js';
const { requireAuth } = __cjsModule581;

router.use(requireAuth);
router.get('/search', product.searchProducts); // before /:id so "search" isn't treated as an id
router.get('/categories', product.listCategoryTypes);
router.get('/', product.listProducts);
router.get('/:id', product.getProductById);

export default router;
