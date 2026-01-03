"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ioredis_1 = __importDefault(require("ioredis"));
const env_1 = require("../config/env");
const logger_1 = __importDefault(require("./logger"));
const redis = new ioredis_1.default({
    host: env_1.env.REDIS_HOST,
    port: env_1.env.REDIS_PORT,
    maxRetriesPerRequest: null,
});
redis.on("connect", () => {
    logger_1.default.info("Redis Connected Successfully");
});
redis.on("error", (err) => {
    logger_1.default.error(err, "Redis connection error: ");
});
exports.default = redis;
