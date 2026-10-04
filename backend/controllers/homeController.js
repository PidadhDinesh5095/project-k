import pool from '../db/pool.js';
import { redisClient } from '../config/redis.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';

const CACHE_TTL_SECONDS = 300;

// GET /home/banners
// Kept in an env/config value for now since there's no admin panel in scope yet;
// swap for a `banners` table the moment these need to be editable without a deploy.
const getBanners = asyncHandler(async (req, res) => {
  const cached = await redisClient.get('home:banners');
  if (cached) return ApiResponse.success(res, cached);

  const banners = JSON.parse(process.env.HOME_BANNERS_JSON || '[]');
  await redisClient.set('home:banners', banners, { ex: CACHE_TTL_SECONDS });
  return ApiResponse.success(res, banners);
});

// GET /home/popular-products
const getPopularProducts = asyncHandler(async (req, res) => {
  const cached = await redisClient.get('home:popular-products');
  if (cached) return ApiResponse.success(res, cached);

  const { rows } = await pool.query(
    `SELECT id, name, images, price, mrp, quantity_label, slug FROM products
     WHERE active = true ORDER BY created_at DESC LIMIT 10`
  );
  await redisClient.set('home:popular-products', rows, { ex: CACHE_TTL_SECONDS });
  return ApiResponse.success(res, rows);
});

export default { getBanners, getPopularProducts };
