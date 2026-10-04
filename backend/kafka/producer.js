import kafka from './client.js';
const producer = kafka.producer();

let connected = false;
async function ensureConnected() {
  if (!connected) {
    await producer.connect();
    connected = true;
  }
}

// publish() is deliberately fire-and-forget from the caller's perspective — a
// controller calls this and moves on; Kafka + the consumer handle the actual
// email/notification work asynchronously so the API response isn't held up
// waiting on Resend or FCM.
async function publish(topic, message) {
  await ensureConnected();
  await producer.send({
    topic,
    messages: [{ value: JSON.stringify(message) }],
  });
}

export default { publish };
