"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// import { AppError } from "../utils/AppError";
const logger_1 = __importDefault(require("../utils/logger"));
const globalErrorHandler = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || "error";
    if (err.statusCode >= 500) {
        logger_1.default.error(`SERVER ERROR: ${req.method} ${req.originalUrl} - ${err.message}`);
    }
    else if (err.statusCode >= 400) {
        logger_1.default.warn(`OPERATIONAL ERROR: ${req.method} ${req.originalUrl} - ${err.message}`);
    }
    else {
        logger_1.default.info(`INFO: ${req.method} ${req.originalUrl} - ${err.message}`);
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
exports.default = globalErrorHandler;
