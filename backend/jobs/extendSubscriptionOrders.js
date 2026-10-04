import pool from '../db/pool.js';
import __cjsModule13 from '../utils/subscriptionOrderGenerator.js';
const { computeOccurrences, materializeOrders } = __cjsModule13;

const GENERATION_WINDOW_DAYS = 30; // must match subscriptionController's initial window

// Runs nightly. Subscription creation only materializes the first 30 days of
// orders — without this job, a long-running subscription's calendar would
// silently run dry a month after it was created, with no error anywhere to
// signal it. This re-computes each active subscription's occurrences out to
// "today + 30 days" every night, so the window keeps rolling forward.
//
// Safe to re-run any time: the partial unique index on
// (subscription_id, delivery_date, slot) plus ON CONFLICT DO NOTHING inside
// materializeOrders() means a date that already has an order is simply skipped,
// never duplicated.
async function extendSubscriptionOrders() {
  const { rows: subscriptions } = await pool.query(
    `SELECT s.*, p.slug AS product_slug, p.price AS product_price, p.id AS product_id
     FROM subscriptions s JOIN products p ON p.id = s.product_id
     WHERE s.status = 'ACTIVE' AND (s.end_date IS NULL OR s.end_date >= CURRENT_DATE)`
  );

  let totalCreated = 0;
  for (const subscription of subscriptions) {
    const product = {
      id: subscription.product_id,
      slug: subscription.product_slug,
      price: subscription.product_price,
    };
    const windowEnd = new Date();
    windowEnd.setDate(windowEnd.getDate() + GENERATION_WINDOW_DAYS);

    const occurrences = computeOccurrences(subscription, new Date(), windowEnd);
    const created = await materializeOrders(pool, subscription, product, occurrences);
    totalCreated += created.length;
  }

  console.log(
    `[extendSubscriptionOrders] ${subscriptions.length} active subscriptions checked, ${totalCreated} new orders created`
  );
  return totalCreated;
}

export default extendSubscriptionOrders;