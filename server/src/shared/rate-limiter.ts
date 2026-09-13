import { rateLimit } from "express-rate-limit";
import { RedisStore } from "rate-limit-redis";
import { config } from "./config.js";
import { redis } from "./redis.js";

const rateLimitMessage = {
  error: {
    code: "RATE_LIMITED",
    message: "Too many requests",
  },
};

const createRedisStore = (prefix: string) =>
  new RedisStore({
    sendCommand: (...args: string[]) => redis.sendCommand(args),
    prefix,
  });

export const globalLimiter = rateLimit({
  windowMs: config.RATE_LIMIT_WINDOW_MS,
  limit: config.RATE_LIMIT_MAX,
  message: rateLimitMessage,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  store: createRedisStore("rl:global:"),
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  message: rateLimitMessage,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  store: createRedisStore("rl:auth:"),
});
