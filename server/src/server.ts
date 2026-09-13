import mongoose from "mongoose";
import {config} from './shared/config.js';
import { connectDB } from "./shared/db.js";
import { logger } from "./shared/logger.js";
import { connectRedis, redis } from "./shared/redis.js";

try {
  await connectDB();
  await connectRedis();
  const { default: app } = await import('./app.js');

  const server = app.listen(config.PORT, () => {
    logger.info({ port: config.PORT }, "Server started");
  });

  let isShuttingDown = false;

  const shutdown = (): void => {
    if (isShuttingDown) {
      return;
    }

    isShuttingDown = true;
    logger.info("Shutting down API");

    const forceExitTimer = setTimeout(() => {
      logger.error("API shutdown timed out");
      process.exit(1);
    }, 10_000);

    forceExitTimer.unref();

    server.close(async () => {
      try {
        await mongoose.disconnect();

        if (redis.isOpen) {
          await redis.quit();
        }

        clearTimeout(forceExitTimer);
        logger.info("API shutdown completed");
        process.exit(0);
      } catch (error) {
        clearTimeout(forceExitTimer);
        logger.error({ err: error }, "API shutdown failed");
        process.exit(1);
      }
    });
  };

  process.once("SIGINT", shutdown);
  process.once("SIGTERM", shutdown);
} catch (error) {
  logger.error({ err: error }, "Failed to start server");
  process.exit(1);
}
