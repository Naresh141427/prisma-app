"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const pino_1 = __importDefault(require("pino"));
const dayjs_1 = __importDefault(require("dayjs"));
const logger = (0, pino_1.default)({
    // Level: 'info' means we log everything from info, warn, and error.
    // In 'debug' mode, we might want more details.
    level: process.env.LOG_LEVEL || "info",
    transport: {
        target: "pino-pretty",
        options: {
            colorize: true, // Colors in terminal
            translateTime: "SYS:standard", // Readable timestamp
            ignore: "pid,hostname", // Clean up the log output
        },
    },
    base: {
        pid: false, // Don't log Process ID in output (cleaner)
    },
    timestamp: () => `,"time":"${(0, dayjs_1.default)().format()}"`,
});
exports.default = logger;
