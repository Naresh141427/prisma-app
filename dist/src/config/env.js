"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const zod_1 = require("zod");
dotenv_1.default.config();
const envSchema = zod_1.z.object({
    DATABASE_URL: zod_1.z.string({ message: "DATABASE_URL is missing" }),
    PORT: zod_1.z.string().default("3000"),
    NODE_ENV: zod_1.z
        .enum(["development", "production", "test"])
        .default("development"),
    JWT_ACCESS_SECRET: zod_1.z.string({ message: " JWT_ACCESS_SECRET is missing" }),
    JWT_REFRESH_SECRET: zod_1.z.string({ message: " JWT_REFRESH_SECRET is missing" }),
    JWT_ACCESS_EXPIRY: zod_1.z.string().default("15m"),
    JWT_REFRESH_EXPIRY: zod_1.z.string().default("7d"),
    REDIS_HOST: zod_1.z
        .string({ message: "REDIS_HOST is required" })
        .default("127.0.0.1"),
    REDIS_PORT: zod_1.z.coerce.number().default(6379),
});
const _env = envSchema.safeParse(process.env);
if (!_env.success) {
    console.error("Invalid environment variables : ", _env.error);
    process.exit(1);
}
exports.env = _env.data;
