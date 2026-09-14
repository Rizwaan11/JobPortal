import mongoose from "mongoose";
import { config } from "./config.js";
import { logger } from "./logger.js";

export const connectDB = async () => {
  await mongoose.connect(config.MONGO_URI);

  logger.info("MongoDB connected");
};
