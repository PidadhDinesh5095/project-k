import pool from '../db/pool.js';
import { redisClient } from '../config/redis.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';

const PRODUCT_CACHE_TTL_SECONDS = 60 * 60;
const PRODUCT_SEARCH_CACHE_TTL_SECONDS = 30 * 60;
const CATEGORY_TYPES_CACHE_TTL_SECONDS = 60 * 60;

// GET /products/categories
const listCategoryTypes = asyncHandler(async (_req, res) => {
  const cacheKey = 'products:categories:v1';
  const cached = await redisClient.get(cacheKey);
  if (cached) {
    console.info(`[cache] HIT ${cacheKey}`);
    return ApiResponse.success(res, cached);
  }

  const { rows } = await pool.query(
    'SELECT id, type, image_url FROM category_types ORDER BY id'
  );
  await redisClient.set(cacheKey, rows, { ex: CATEGORY_TYPES_CACHE_TTL_SECONDS });
  return ApiResponse.success(res, rows);
});

// GET /products?category=CURD|PANEER|GHEE|BUTTER|MILK|NON_DAIRY
const listProducts = asyncHandler(async (req, res) => {
  const { category } = req.query;
  const cacheKey = `products:list:v2:${category || 'all'}`;
  const cached = await redisClient.get(cacheKey);
  if (cached) {
    console.info(`[cache] HIT ${cacheKey}`);
    return ApiResponse.success(res, cached);
  }

  const { rows } = category
    ? await pool.query(
      'SELECT id, main_img_nobg, name, quantity_label, category, tags, price, mrp FROM products WHERE active = true AND category = $1 ORDER BY name',
      [category]
    )
    : await pool.query(
      'SELECT id, main_img_nobg, name, quantity_label, category, tags, price, mrp FROM products WHERE active = true ORDER BY name'
    );

  await redisClient.set(cacheKey, rows, { ex: PRODUCT_CACHE_TTL_SECONDS });
  return ApiResponse.success(res, rows);
});

// GET /products/search?q=
const searchProducts = asyncHandler(async (req, res) => {
  const { q } = req.query;
  const cacheKey = `products:search:v1:${encodeURIComponent(String(q ?? ''))}`;
  const cached = await redisClient.get(cacheKey);
  if (cached) {
    console.info(`[cache] HIT ${cacheKey}`);
    return ApiResponse.success(res, cached);
  }

  const { rows } = await pool.query(
    `SELECT * FROM products
     WHERE active = true AND (name ILIKE $1 OR $2 = ANY(tags))
     LIMIT 20`,
    [`%${q}%`, q]
  );
  await redisClient.set(cacheKey, rows, { ex: PRODUCT_SEARCH_CACHE_TTL_SECONDS });
  return ApiResponse.success(res, rows);
});

// GET /products/:id
const getProductById = asyncHandler(async (req, res) => {
  const cacheKey = `products:detail:v2:${req.params.id}`;
  const cached = await redisClient.get(cacheKey);
  if (cached) {
    console.info(`[cache] HIT ${cacheKey}`);
    return ApiResponse.success(res, cached);
  }

  const { rows } = await pool.query('SELECT * FROM products WHERE id = $1 AND active = true', [req.params.id]);
  if (rows.length === 0) return res.status(404).json({ success: false, message: 'Product not found' });

  await redisClient.set(cacheKey, rows[0], { ex: PRODUCT_CACHE_TTL_SECONDS });
  return ApiResponse.success(res, rows[0]);
});

export default { listCategoryTypes, listProducts, searchProducts, getProductById };
