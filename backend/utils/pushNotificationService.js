import admin from '../config/firebase.js';
import pool from '../db/pool.js';

// Writes the in-app notification record AND sends the FCM push in one call —
// controllers call this single function rather than doing both separately,
// so the two can never drift out of sync (e.g. a push sent with no matching
// row in the notifications list, or vice versa).
async function sendNotification(userId, { type, title, body, referenceId }) {
  const { rows } = await pool.query(
    `INSERT INTO notifications (user_id, type, title, body, reference_id)
     VALUES ($1,$2,$3,$4,$5) RETURNING *`,
    [userId, type, title, body, referenceId || null]
  );

  const { rows: userRows } = await pool.query('SELECT device_tokens FROM users WHERE id = $1', [userId]);
  const tokens = userRows[0]?.device_tokens || [];
  if (tokens.length === 0 || !admin.apps.length) return rows[0]; // FCM not configured or no device registered — skip silently

  try {
    await admin.messaging().sendEachForMulticast({
      tokens,
      notification: { title, body },
      data: { type, referenceId: referenceId || '' },
    });
  } catch (err) {
    // A failed push should never fail the underlying action (order placed, etc.)
    // that triggered it — log and move on.
    console.error('[push] failed to send FCM notification', err);
  }

  return rows[0];
}

export default { sendNotification };
