import __cjsModule12 from 'pg';

const { Pool } = __cjsModule12;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
  keepAlive: true
});

pool.on('connect', (client) => {
  client.on('error', (err) => {
    console.error('[db] PostgreSQL client error:', err);
  });

  console.log('[db] PostgreSQL client connected');
});

pool.on('error', (err) => {
  console.error('[db] PostgreSQL pool error:', err);
});

const connectDb = async () => {
  try {
    await pool.query('SELECT 1');
    console.log('[db]✅connected to Postgres');
  } catch (err) {
    console.error('[db]❌ failed to connect to Postgres:', err);
    throw err;
  }
};

export { connectDb, pool as default };