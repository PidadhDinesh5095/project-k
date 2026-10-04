import pool from '../db/pool.js';

// Balance is always derived from the ledger, never stored as a bare column on
// users — this is the only correct way to read it.
async function getBalance(userId, client = pool) {
  const { rows } = await client.query(
    `SELECT COALESCE(SUM(amount), 0) AS balance FROM wallet_transactions
     WHERE user_id = $1 AND status = 'SUCCESS'`,
    [userId]
  );
  return Number(rows[0].balance);
}

async function _writeEntry(client, userId, amount, type, referenceId) {
  // Advisory lock, scoped to this transaction, keyed on the user — serializes
  // concurrent credit/debit calls for the SAME user so two simultaneous requests
  // can never both read the same stale balance. This only works because it's
  // taken and released within one real BEGIN/COMMIT block (see credit()/debit()
  // below) — an advisory lock taken on a connection that autocommits after a
  // single statement provides no protection at all.
  await client.query('SELECT pg_advisory_xact_lock(hashtext($1))', [userId]);
  const currentBalance = await getBalance(userId, client);

  if (amount < 0 && currentBalance < -amount) {
    const err = new Error('INSUFFICIENT_BALANCE');
    err.statusCode = 402;
    err.shortfall = Number((-amount - currentBalance).toFixed(2));
    throw err;
  }

  const newBalance = Number((currentBalance + amount).toFixed(2));
  const { rows } = await client.query(
    `INSERT INTO wallet_transactions (user_id, type, amount, balance_after, reference_id, status)
     VALUES ($1, $2, $3, $4, $5, 'SUCCESS') RETURNING *`,
    [userId, type, amount, newBalance, referenceId]
  );
  return rows[0];
}

// If the caller passes an existing client (already inside its own BEGIN/COMMIT,
// e.g. orderController placing an order alongside other writes), we use it
// directly and let the caller manage commit/rollback. If not, we open and
// manage our own transaction here so the lock is always real.
async function credit(userId, amount, type, referenceId, existingClient = null) {
  if (existingClient) return _writeEntry(existingClient, userId, amount, type, referenceId);

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await _writeEntry(client, userId, amount, type, referenceId);
    await client.query('COMMIT');
    return result;
  } catch (e) {
    await client.query('ROLLBACK').catch(() => {});
    throw e;
  } finally {
    client.release();
  }
}

async function debit(userId, amount, type, referenceId, existingClient = null) {
  if (existingClient) return _writeEntry(existingClient, userId, -amount, type, referenceId);

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await _writeEntry(client, userId, -amount, type, referenceId);
    await client.query('COMMIT');
    return result;
  } catch (e) {
    await client.query('ROLLBACK').catch(() => {});
    throw e;
  } finally {
    client.release();
  }
}

export default { getBalance, credit, debit };
