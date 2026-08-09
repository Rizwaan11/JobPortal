import { createClient } from "redis";
import { config } from "./config.js";

export const redis = createClient({
  url: config.REDIS_URL,
});

redis.on("error", (error) => {
  console.error("Redis Client Error:", error);
});

export const connectRedis = async () => {
  await redis.connect();

  console.log("Redis connected");
};