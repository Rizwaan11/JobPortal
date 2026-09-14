import type { NextFunction, Request, Response } from "express";
import { logger } from "./logger.js";

export function httpLogger(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const startedAt = Date.now();

  logger.info(
    {
      requestId: req.id,
      method: req.method,
      url: req.originalUrl,
    },
    "request received"
  );

  res.on("finish", () => {
    logger.info(
      {
        requestId: req.id,
        method: req.method,
        url: req.originalUrl,
        statusCode: res.statusCode,
        durationMs: Date.now() - startedAt,
      },
      "request completed"
    );
  });

  next();
}
