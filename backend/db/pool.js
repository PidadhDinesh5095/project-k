import __cjsModule12 from 'pg';
const { Pool } = __cjsModule12;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
});

pool.on('error', (err) => {
  console.error('[db] unexpected error on idle Postgres client', err);
  process.exit(1);
});
const connectDb = async () => {
  try {
    await pool.connect();
    console.log('[db]✅connected to Postgres');
  } catch (err) {
    console.error('[db] failed to connect to Postgres', err);
    process.exit(1);
  }
}


export { connectDb ,pool as default };