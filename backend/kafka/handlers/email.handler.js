// import resend from '../../config/email.js';
import pool from '../../db/pool.js';

async function handleOrderConfirmed(message) {
  const { userId, orderId, productName, totalAmount, deliveryDate } = message;
  const { rows } = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
  const user = rows[0];
  if (!user?.email) return; // email is optional on the profile — skip silently if not set

  await resend.emails.send({
    from: 'orders@dineshfarms.app',
    to: user.email,
    subject: `Order Confirmed — ${orderId}`,
    html: `<p>Hi ${user.first_name || 'there'},</p>
           <p>Your order for <b>${productName}</b> is confirmed, scheduled for ${new Date(deliveryDate).toDateString()}.</p>
           <p>Total: ₹${totalAmount}</p>
           <p>Order ID: ${orderId}</p>`,
  });
}

async function handleSubscriptionCreated(message) {
  const { userId, productName, frequency } = message;
  const { rows } = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
  const user = rows[0];
  if (!user?.email) return;

  await resend.emails.send({
    from: 'orders@dineshfarms.app',
    to: user.email,
    subject: `Subscription Confirmed — ${productName}`,
    html: `<p>Hi ${user.first_name || 'there'},</p>
           <p>Your <b>${frequency}</b> subscription for ${productName} is now active.</p>`,
  });
}

async function handleWalletTopupSuccess(message) {
  const { userId, amount, balanceAfter } = message;
  const { rows } = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
  const user = rows[0];
  if (!user?.email) return;

  await resend.emails.send({
    from: 'wallet@dineshfarms.app',
    to: user.email,
    subject: `Wallet Top-up Successful — ₹${amount}`,
    html: `<p>₹${amount} was added to your wallet. New balance: ₹${balanceAfter}.</p>`,
  });
}

export default { handleOrderConfirmed, handleSubscriptionCreated, handleWalletTopupSuccess };
