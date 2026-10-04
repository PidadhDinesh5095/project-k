
import pool from '../db/pool.js';

function getProductAbbreviation(productSlug) {
  return productSlug
    .split('-')
    .map(word => word.charAt(0).toUpperCase())
    .join('')
    .slice(0, 2);
}

function formatDate(date) {
  const d = new Date(date);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}${mm}${dd}`;
}

async function generateOrderId(productSlug, deliveryDate) {
  const abbreviation = getProductAbbreviation(productSlug);
  const dateStr = formatDate(deliveryDate);
  const counterKey = `${abbreviation}${dateStr}`;

  const { rows } = await pool.query(
    `INSERT INTO order_counters (counter_key, seq) VALUES ($1, 1)
     ON CONFLICT (counter_key) DO UPDATE SET seq = order_counters.seq + 1
     RETURNING seq`,
    [counterKey]
  );

  const seqStr = String(rows[0].seq).padStart(3, '0');

  return `DF-${abbreviation}${dateStr}-${seqStr}`;
}

export default { generateOrderId };

