// import resend from '../../config/email.js';
import pool from '../../db/pool.js';

// Generates a simple HTML invoice and emails it — swap in a PDF renderer here
// later if a downloadable PDF invoice becomes a requirement.
async function handleInvoiceGenerate(message) {
  const { orderId } = message;
  const { rows } = await pool.query(
    `SELECT o.*, p.name AS product_name, u.email FROM orders o
     JOIN products p ON p.id = o.product_id
     JOIN users u ON u.id = o.user_id
     WHERE o.order_id = $1`,
    [orderId]
  );
  const order = rows[0];
  if (!order?.email) return;

  await resend.emails.send({
    from: 'billing@dineshfarms.app',
    to: order.email,
    subject: `Invoice — ${orderId}`,
    html: `<h3>Invoice for ${orderId}</h3>
           <p>${order.product_name} x ${order.quantity}</p>
           <p>Total: ₹${order.total_amount}</p>`,
  });
}

export default { handleInvoiceGenerate };
