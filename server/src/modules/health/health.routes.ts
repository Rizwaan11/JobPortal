import { Router } from "express";
import mongoose from "mongoose";
import { redis } from "../../shared/redis.js";

export const healthRouter = Router();

healthRouter.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
  });
});

healthRouter.get("/ready", async (_req, res) => {
  const checks: {
    mongodb: "ok" | "error";
    redis: "ok" | "error";
  } = {
    mongodb: "ok",
    redis: "ok",
  };

  try {
    if (!mongoose.connection.db) {
      throw new Error("MongoDB is not connected");
    }

    await mongoose.connection.db.admin().ping();
  } catch {
    checks.mongodb = "error";
  }

  try {
    await redis.ping();
  } catch {
    checks.redis = "error";
  }

  const ready = checks.mongodb === "ok" && checks.redis === "ok";

  res.status(ready ? 200 : 503).json({
    status: ready ? "ok" : "error",
    checks,
  });
});
