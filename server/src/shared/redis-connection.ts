import { config } from "./config.js";

const redisUrl = new URL(config.REDIS_URL);
const usesTls = redisUrl.protocol === "rediss:";

export function getRedisClientOptions() {
  return {
    url: config.REDIS_URL,
    ...(usesTls
      ? {
          socket: {
            tls: true as const,
            servername: redisUrl.hostname,
          },
        }
      : {}),
  };
}

export function getBullMQConnection() {
  const database = redisUrl.pathname.length > 1
    ? Number.parseInt(redisUrl.pathname.slice(1), 10)
    : 0;

  return {
    host: redisUrl.hostname,
    port: redisUrl.port ? Number.parseInt(redisUrl.port, 10) : 6379,
    username: redisUrl.username
      ? decodeURIComponent(redisUrl.username)
      : undefined,
    password: redisUrl.password
      ? decodeURIComponent(redisUrl.password)
      : undefined,
    db: Number.isNaN(database) ? 0 : database,
    ...(usesTls
      ? {
          tls: {
            servername: redisUrl.hostname,
          },
        }
      : {}),
  };
}
