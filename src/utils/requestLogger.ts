import { Request, Response, NextFunction } from "express";
import logger from "./logger";

const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  res.on("finish", () => {
    const statusCode = res.statusCode;

    // Log level depends on status code
    if (statusCode >= 500) {
      logger.error(`❌ ${req.method} ${req.originalUrl} - ${statusCode}`);
    } else if (statusCode >= 400) {
      logger.warn(`⚠️ ${req.method} ${req.originalUrl} - ${statusCode}`);
    } else {
      logger.info(`✅ ${req.method} ${req.originalUrl} - ${statusCode}`);
    }
  });

  next();
};

export default requestLogger;
