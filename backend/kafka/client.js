import __cjsModule14 from 'kafkajs';
const { Kafka } = __cjsModule14;

const kafka = new Kafka({
  clientId: 'fresh-pure-api',
  brokers: (process.env.KAFKA_BROKERS || 'localhost:9092').split(','),
});

export default kafka;
