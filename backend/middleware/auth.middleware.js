import __cjsModule17 from '../utils/tokenService.js';
const { verifyAccessToken } = __cjsModule17;
import pool from '../db/pool.js';
import asyncHandler from '../utils/asyncHandler.js';

const requireAuth = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ success: false, message: 'Missing access token' });

  let payload;
  try {
    payload = verifyAccessToken(token);
  } catch {
    return res.status(401).json({ success: false, message: 'Invalid or expired access token' });
  }

  const { rows } = await pool.query('SELECT * FROM users WHERE id = $1 AND active = true', [payload.sub]);
  if (rows.length === 0) return res.status(401).json({ success: false, message: 'User not found' });

  req.user = rows[0];
  next();
});

export default { requireAuth };
