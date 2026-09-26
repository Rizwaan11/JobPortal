import { createClient } from "redis";
import { logger } from "./logger.js";
import { getRedisClientOptions } from "./redis-connection.js";

export const redis = createClient(getRedisClientOptions());

redis.on("error", (error) => {
  logger.error({ err: error }, "Redis client error");
});

export const connectRedis = async () => {
  if (redis.isOpen) return;

  await redis.connect();

  logger.info("Redis connected");
};
