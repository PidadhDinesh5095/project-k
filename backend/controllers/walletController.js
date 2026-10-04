import crypto from 'crypto';
import pool from '../db/pool.js';
import razorpay from '../config/razorpay.js';
import walletService from '../utils/walletService.js';
import __cjsModule10 from '../kafka/producer.js';
const { publish } = __cjsModule10;
import topics from '../kafka/topics.js';
import __cjsModule11 from '../utils/pushNotificationService.js';
const { sendNotification } = __cjsModule11;
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';

// GET /wallet
const getWallet = asyncHandler(async (req, res) => {
  const balance = await walletService.getBalance(req.user.id);
  return ApiResponse.success(res, { balance });
});

// POST /wallet/topup — creates a Razorpay order; the wallet is NOT credited yet.
const initiateTopup = asyncHandler(async (req, res) => {
  const { amount } = req.body;
  const razorpayOrder = await razorpay.orders.create({
    amount: Math.round(amount * 100),
    currency: 'INR',
    receipt: `topup_${req.user.id}_${Date.now()}`,
  });
  return ApiResponse.success(res, { razorpayOrder, keyId: process.env.RAZORPAY_KEY_ID }, 201);
});

// POST /wallet/topup/verify
// Verify the Razorpay signature server-side before crediting anything — never
// trust the client's word that a payment succeeded.
const verifyTopup = asyncHandler(async (req, res) => {
  const { razorpayOrderId, razorpayPaymentId, razorpaySignature, amount } = req.body;

  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest('hex');

  if (expectedSignature !== razorpaySignature) {
    return res.status(400).json({ success: false, message: 'Payment verification failed' });
  }

  const txn = await walletService.credit(req.user.id, amount, 'TOPUP', razorpayPaymentId);

  await publish(topics.WALLET_TOPUP_SUCCESS, {
    userId: req.user.id,
    amount,
    balanceAfter: txn.balance_after,
  });
  await sendNotification(req.user.id, {
    type: 'WALLET_TOPUP',
    title: 'Wallet Topped Up',
    body: `₹${amount} added. New balance: ₹${txn.balance_after}`,
    referenceId: txn.id,
  });

  return ApiResponse.success(res, txn, 200, 'Wallet topped up');
});

// GET /wallet/transactions
const getTransactions = asyncHandler(async (req, res) => {
  const { limit = 50, offset = 0 } = req.query;
  const { rows } = await pool.query(
    'SELECT * FROM wallet_transactions WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3',
    [req.user.id, limit, offset]
  );
  return ApiResponse.success(res, rows);
});

export default { getWallet, initiateTopup, verifyTopup, getTransactions };
