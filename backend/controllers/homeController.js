import pool from '../db/pool.js';
import { redisClient } from '../config/redis.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';

const CACHE_TTL_SECONDS = 60 * 60;

// GET /home/banners
const getBanners = asyncHandler(async (req, res) => {
  try {
    const cached = await redisClient.get('home:banners');
    if (cached !== null) return ApiResponse.success(res, cached);
  } catch (error) {
    console.error('[home] banner cache read failed:', error.message);
  }

  const { rows: banners } = await pool.query(
    `SELECT id, image_url, link_url, display_order
     FROM home_banners
     ORDER BY COALESCE(display_order, 0) ASC, created_at DESC`
  );

  try {
    await redisClient.set('home:banners', banners, { ex: CACHE_TTL_SECONDS });
  } catch (error) {
    console.error('[home] banner cache write failed:', error.message);
  }

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
