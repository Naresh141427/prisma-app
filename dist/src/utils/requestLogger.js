"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const logger_1 = __importDefault(require("./logger"));
const requestLogger = (req, res, next) => {
    res.on("finish", () => {
        const statusCode = res.statusCode;
        // Log level depends on status code
        if (statusCode >= 500) {
            logger_1.default.error(`❌ ${req.method} ${req.originalUrl} - ${statusCode}`);
        }
        else if (statusCode >= 400) {
            logger_1.default.warn(`⚠️ ${req.method} ${req.originalUrl} - ${statusCode}`);
        }
        else {
            logger_1.default.info(`✅ ${req.method} ${req.originalUrl} - ${statusCode}`);
        }
    });
    next();
};
exports.default = requestLogger;
