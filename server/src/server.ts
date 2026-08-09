import app from './app.js';
import {config} from './shared/config.js';
import { connectDB } from "./shared/db.js";
import { connectRedis } from "./shared/redis.js";

try {
  await connectDB();
  await connectRedis();

  app.listen(config.PORT, () => {
    console.log(`Server running on port ${config.PORT}`);
  });
} catch (error) {
  console.error("Failed to start server:", error);
  process.exit(1);
}
