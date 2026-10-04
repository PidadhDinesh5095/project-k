import kafka from './client.js';
import topics from './topics.js';
import __cjsModule15 from './handlers/email.handler.js';
const { handleOrderConfirmed, handleSubscriptionCreated, handleWalletTopupSuccess } = __cjsModule15;
import __cjsModule16 from './handlers/invoice.handler.js';
const { handleInvoiceGenerate } = __cjsModule16;

const consumer = kafka.consumer({ groupId: 'fresh-pure-api-consumers' });

const TOPIC_HANDLERS = {
  [topics.ORDER_CONFIRMED]: handleOrderConfirmed,
  [topics.SUBSCRIPTION_CREATED]: handleSubscriptionCreated,
  [topics.WALLET_TOPUP_SUCCESS]: handleWalletTopupSuccess,
  [topics.INVOICE_GENERATE]: handleInvoiceGenerate,
};

async function startConsumer() {
  await consumer.connect();
  await consumer.subscribe({ topics: Object.keys(TOPIC_HANDLERS), fromBeginning: false });

  await consumer.run({
    eachMessage: async ({ topic, message }) => {
      const handler = TOPIC_HANDLERS[topic];
      if (!handler) return;
      try {
        const payload = JSON.parse(message.value.toString());
        await handler(payload);
      } catch (err) {
        // A failed email/invoice send should never crash the consumer or silently
        // vanish — log it clearly; a production setup would push this to a
        // dead-letter topic for retry instead of just logging.
        console.error(`[kafka] handler failed for topic ${topic}`, err);
      }
    },
  });

  console.log('[kafka] consumer running');
}

export default startConsumer;
