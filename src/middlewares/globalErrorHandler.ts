import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/AppError";
import logger from "../utils/logger";

const globalErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  if (err.statusCode >= 500) {
    logger.error(
      `SERVER ERROR: ${req.method} ${req.originalUrl} - ${err.message}`
    );
  } else if (err.statusCode >= 400) {
    logger.warn(
      `OPERATIONAL ERROR: ${req.method} ${req.originalUrl} - ${err.message}`
    );
  } else {
    logger.info(`INFO: ${req.method} ${req.originalUrl} - ${err.message}`);
  }

  //Prisma sepcific errors
  if (err.code === "P2002") {
    err.statusCode = 409;
    err.message = "Unique field already exists (e.g., email or username taken)";
  }

  res.status(err.statusCode).json({
    success: false,
    status: err.status,
    message: err.message,
    stack: process.env.NODE_ENV === "production" ? undefined : err.stack,
  });
};

export default globalErrorHandler;
