import pool from '../db/pool.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';

// POST /profile/complete — first name + last name required, email/DOB optional
const completeProfile = asyncHandler(async (req, res) => {
  const { firstName, lastName, email, dob } = req.body;
  const { rows } = await pool.query(
    `UPDATE users SET first_name = $1, last_name = $2, email = COALESCE($3, email),
            dob = COALESCE($4, dob), profile_completed = true, updated_at = now()
     WHERE id = $5 RETURNING *`,
    [firstName, lastName, email || null, dob || null, req.user.id]
  );
  return ApiResponse.success(res, rows[0], 200, 'Profile completed');
});

// GET /profile/me
const getMe = asyncHandler(async (req, res) => {
  return ApiResponse.success(res, req.user);
});

// PATCH /profile/me
const updateProfile = asyncHandler(async (req, res) => {
  const { firstName, lastName, email, dob } = req.body;
  const { rows } = await pool.query(
    `UPDATE users SET
       first_name = COALESCE($1, first_name),
       last_name  = COALESCE($2, last_name),
       email      = COALESCE($3, email),
       dob        = COALESCE($4, dob),
       updated_at = now()
     WHERE id = $5 RETURNING *`,
    [firstName, lastName, email, dob, req.user.id]
  );
  return ApiResponse.success(res, rows[0], 200, 'Profile updated');
});

export default { completeProfile, getMe, updateProfile };
