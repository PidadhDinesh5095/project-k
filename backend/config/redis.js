import { Redis } from '@upstash/redis';
import dotenv from 'dotenv';
dotenv.config();

// Upstash's REST-based client — plain HTTPS under the hood, works from any
// environment without a persistent socket, which is why it fits a Node/Express
// server just as well as a serverless function.
export const redisClient = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

export const connectRedis = async () => {
  try {
    await redisClient.ping();
    console.log('[redis]✅Upstash Redis connected');
  } catch (err) {
    console.error('[redis]❌ Upstash Redis error:', err.message);
  }
};

export default { redisClient, connectRedis };
