import { createClient } from "redis";
import { config } from "./config.js";
import { logger } from "./logger.js";

export const redis = createClient({
  url: config.REDIS_URL,
});

redis.on("error", (error) => {
  logger.error({ err: error }, "Redis client error");
});

export const connectRedis = async () => {
  if (redis.isOpen) return;

  await redis.connect();

  logger.info("Redis connected");
};
