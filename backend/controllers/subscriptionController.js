import pool from '../db/pool.js';
import __cjsModule7 from '../utils/subscriptionOrderGenerator.js';
const { computeOccurrences, materializeOrders } = __cjsModule7;
import __cjsModule8 from '../kafka/producer.js';
const { publish } = __cjsModule8;
import topics from '../kafka/topics.js';
import __cjsModule9 from '../utils/pushNotificationService.js';
const { sendNotification } = __cjsModule9;
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';

const GENERATION_WINDOW_DAYS = 30;

const createSubscription = asyncHandler(async (req, res) => {
  const {
    frequency, productId, addressId, startDate, endDate,
    dailyQuantity, dailySlot, alternateConfig, customConfig,
  } = req.body;

  const { rows: productRows } = await pool.query('SELECT * FROM products WHERE id = $1', [productId]);
  const product = productRows[0];
  if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

  const client = await pool.connect();
  let subscription;
  let generatedOrders;
  try {
    await client.query('BEGIN');

    const { rows } = await client.query(
      `INSERT INTO subscriptions
        (user_id, product_id, address_id, frequency, daily_quantity, daily_slot,
         alternate_config, custom_config, start_date, end_date)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
      [
        req.user.id, productId, addressId, frequency,
        frequency === 'DAILY' ? dailyQuantity : null,
        frequency === 'DAILY' ? (dailySlot || 'MORNING') : null,
        frequency === 'ALTERNATE' ? JSON.stringify(alternateConfig) : null,
        frequency === 'CUSTOM' ? JSON.stringify(customConfig) : null,
        startDate, endDate || null,
      ]
    );
    subscription = rows[0];

    const today = new Date();
    const windowEnd = new Date(today);
    windowEnd.setDate(windowEnd.getDate() + GENERATION_WINDOW_DAYS);
    const occurrences = computeOccurrences(subscription, subscription.start_date, windowEnd);
    generatedOrders = await materializeOrders(client, subscription, product, occurrences);

    await client.query('COMMIT');
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }

  await publish(topics.SUBSCRIPTION_CREATED, {
    userId: req.user.id,
    productName: product.name,
    frequency,
  });
  await sendNotification(req.user.id, {
    type: 'SUBSCRIPTION_CREATED',
    title: 'Subscription Active',
    body: `Your ${frequency.toLowerCase()} subscription for ${product.name} is now active. ${generatedOrders.length} deliveries scheduled over the next ${GENERATION_WINDOW_DAYS} days.`,
    referenceId: subscription.id,
  });

  return ApiResponse.success(
    res,
    { subscription, generatedOrdersCount: generatedOrders.length },
    201,
    'Subscription created'
  );
});

const listSubscriptions = asyncHandler(async (req, res) => {
  const { rows } = await pool.query(
    `SELECT s.*, p.name AS product_name, p.images, p.quantity_label, p.price
     FROM subscriptions s JOIN products p ON p.id = s.product_id
     WHERE s.user_id = $1 AND s.status = 'ACTIVE' ORDER BY s.created_at DESC`,
    [req.user.id]
  );
  return ApiResponse.success(res, rows);
});

const getSubscriptionById = asyncHandler(async (req, res) => {
  const { rows } = await pool.query(
    `SELECT s.*, row_to_json(p) AS product FROM subscriptions s
     JOIN products p ON p.id = s.product_id
     WHERE s.id = $1 AND s.user_id = $2`,
    [req.params.id, req.user.id]
  );
  if (rows.length === 0) return res.status(404).json({ success: false, message: 'Subscription not found' });
  return ApiResponse.success(res, rows[0]);
});

// Records the pause AND cancels any already-materialized orders that fall
// inside the paused range — without this second step, orders generated at
// subscription creation (up to 30 days ahead) would still get delivered
// during a pause the customer explicitly asked for.
const pauseSubscription = asyncHandler(async (req, res) => {
  const { startDate, endDate, reason } = req.body;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const { rows } = await client.query(
      `UPDATE subscriptions SET paused_ranges = paused_ranges || $1::jsonb
       WHERE id = $2 AND user_id = $3 RETURNING *`,
      [JSON.stringify([{ startDate, endDate, reason }]), req.params.id, req.user.id]
    );
    if (rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ success: false, message: 'Subscription not found' });
    }

    const { rowCount } = await client.query(
      `UPDATE orders SET status = 'CANCELLED'
       WHERE subscription_id = $1 AND status = 'SCHEDULED'
         AND delivery_date BETWEEN $2 AND $3`,
      [req.params.id, startDate, endDate]
    );

    await client.query('COMMIT');
    return ApiResponse.success(
      res, { subscription: rows[0], cancelledOrdersCount: rowCount },
      200, 'Subscription paused for the selected range'
    );
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
});

// Same reasoning as pause: cancels any already-materialized order on exactly
// those dates, for every slot this subscription uses.
const skipDates = asyncHandler(async (req, res) => {
  const { dates } = req.body;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const { rows } = await client.query(
      `UPDATE subscriptions
       SET skipped_dates = ARRAY(SELECT DISTINCT unnest(skipped_dates || $1::date[]))
       WHERE id = $2 AND user_id = $3 RETURNING *`,
      [dates, req.params.id, req.user.id]
    );
    if (rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ success: false, message: 'Subscription not found' });
    }

    const { rowCount } = await client.query(
      `UPDATE orders SET status = 'CANCELLED'
       WHERE subscription_id = $1 AND status = 'SCHEDULED' AND delivery_date = ANY($2::date[])`,
      [req.params.id, dates]
    );

    await client.query('COMMIT');
    return ApiResponse.success(res, { subscription: rows[0], cancelledOrdersCount: rowCount }, 200, 'Dates skipped');
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
});

// Cancels the subscription AND every future SCHEDULED order it generated.
// Past/delivered orders are deliberately left untouched — cancelling a
// subscription never rewrites history.
const cancelSubscription = asyncHandler(async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const { rows } = await client.query(
      `UPDATE subscriptions SET status = 'CANCELLED' WHERE id = $1 AND user_id = $2 RETURNING *`,
      [req.params.id, req.user.id]
    );
    if (rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ success: false, message: 'Subscription not found' });
    }

    const { rowCount } = await client.query(
      `UPDATE orders SET status = 'CANCELLED'
       WHERE subscription_id = $1 AND status = 'SCHEDULED' AND delivery_date >= CURRENT_DATE`,
      [req.params.id]
    );

    await client.query('COMMIT');
    return ApiResponse.success(res, { subscription: rows[0], cancelledOrdersCount: rowCount }, 200, 'Subscription cancelled');
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
});

export default {
  createSubscription, listSubscriptions, getSubscriptionById,
  pauseSubscription, skipDates, cancelSubscription,
};