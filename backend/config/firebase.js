import admin from 'firebase-admin';

// Service account JSON provided as a base64 env var so it's safe to store in
// normal .env / secret-manager tooling rather than shipping a raw JSON file.
if (!admin.apps.length) {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64
    ? Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_BASE64, 'base64').toString('utf-8')
    : '{}';
  const serviceAccount = JSON.parse(raw);
  if (serviceAccount.project_id) {
    admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
  } else {
    console.warn('[firebase] FIREBASE_SERVICE_ACCOUNT_BASE64 not set — push notifications disabled');
  }
}

export default admin;
