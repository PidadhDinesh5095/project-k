import pool from '../db/pool.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';

// POST /payment-methods — stores only the Razorpay-issued token reference,
// never raw card/UPI details. Actual charging always happens through Razorpay
// using this token, not anything stored here directly.
const addPaymentMethod = asyncHandler(async (req, res) => {
  const { type, razorpayTokenId, displayLabel, isDefault } = req.body;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { rows } = await client.query(
      `INSERT INTO payment_methods (user_id, type, razorpay_token_id, display_label, is_default)
       VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [req.user.id, type, razorpayTokenId, displayLabel, !!isDefault]
    );
    if (isDefault) {
      await client.query('UPDATE payment_methods SET is_default = false WHERE user_id = $1 AND id != $2', [
        req.user.id, rows[0].id,
      ]);
    }
    await client.query('COMMIT');
    return ApiResponse.success(res, rows[0], 201, 'Payment method saved');
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
});

// GET /payment-methods
const listPaymentMethods = asyncHandler(async (req, res) => {
  const { rows } = await pool.query(
    'SELECT * FROM payment_methods WHERE user_id = $1 ORDER BY is_default DESC, created_at DESC',
    [req.user.id]
  );
  return ApiResponse.success(res, rows);
});

// DELETE /payment-methods/:id
const deletePaymentMethod = asyncHandler(async (req, res) => {
  await pool.query('DELETE FROM payment_methods WHERE id = $1 AND user_id = $2', [req.params.id, req.user.id]);
  return ApiResponse.success(res, null, 200, 'Payment method removed');
});

export default { addPaymentMethod, listPaymentMethods, deletePaymentMethod };
