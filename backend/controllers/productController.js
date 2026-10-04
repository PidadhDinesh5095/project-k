import pool from '../db/pool.js';
import { redisClient } from '../config/redis.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';

// GET /products?category=CURD|PANEER|GHEE|BUTTER|MILK|NON_DAIRY
const listProducts = asyncHandler(async (req, res) => {
  const { category } = req.query;
  const cacheKey = `products:list:${category || 'all'}`;
  const cached = await redisClient.get(cacheKey);
  if (cached) return ApiResponse.success(res, cached);

  const { rows } = category
    ? await pool.query('SELECT * FROM products WHERE active = true AND category = $1 ORDER BY name', [category])
    : await pool.query('SELECT * FROM products WHERE active = true ORDER BY name');

  await redisClient.set(cacheKey, rows, { ex: 300 });
  return ApiResponse.success(res, rows);
});

// GET /products/search?q=
const searchProducts = asyncHandler(async (req, res) => {
  const { q } = req.query;
  const { rows } = await pool.query(
    `SELECT * FROM products
     WHERE active = true AND (name ILIKE $1 OR $2 = ANY(tags))
     LIMIT 20`,
    [`%${q}%`, q]
  );
  return ApiResponse.success(res, rows);
});

// GET /products/:id
const getProductById = asyncHandler(async (req, res) => {
  const cacheKey = `products:detail:${req.params.id}`;
  const cached = await redisClient.get(cacheKey);
  if (cached) return ApiResponse.success(res, cached);

  const { rows } = await pool.query('SELECT * FROM products WHERE id = $1', [req.params.id]);
  if (rows.length === 0) return res.status(404).json({ success: false, message: 'Product not found' });

  await redisClient.set(cacheKey, rows[0], { ex: 300 });
  return ApiResponse.success(res, rows[0]);
});

export default { listProducts, searchProducts, getProductById };
