import express from 'express';
const router = express.Router();
import home from '../controllers/homeController.js';
import __cjsModule577 from '../middleware/auth.middleware.js';
const { requireAuth } = __cjsModule577;

router.use(requireAuth);
router.get('/banners', home.getBanners);
router.get('/popular-products', home.getPopularProducts);

export default router;
