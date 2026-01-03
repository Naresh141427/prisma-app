"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateTokens = exports.hashToken = exports.verifyPassword = exports.hashPassword = void 0;
const argon2_1 = __importDefault(require("argon2"));
const crypto_1 = __importDefault(require("crypto"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../config/env");
const hashPassword = async (password) => {
    return await argon2_1.default.hash(password);
};
exports.hashPassword = hashPassword;
const verifyPassword = async (hash, plain) => {
    try {
        return await argon2_1.default.verify(hash, plain);
    }
    catch {
        return false;
    }
};
exports.verifyPassword = verifyPassword;
const hashToken = (token) => {
    return crypto_1.default.createHash("sha256").update(token).digest("hex");
};
exports.hashToken = hashToken;
const generateTokens = (userId) => {
    const accessOptions = {
        expiresIn: env_1.env.JWT_ACCESS_EXPIRY,
    };
    const refreshOptions = {
        expiresIn: env_1.env.JWT_REFRESH_EXPIRY,
    };
    const accessToken = jsonwebtoken_1.default.sign({ userId }, env_1.env.JWT_ACCESS_SECRET, accessOptions);
    const refreshToken = jsonwebtoken_1.default.sign({ userId }, env_1.env.JWT_REFRESH_SECRET, refreshOptions);
    return { accessToken, refreshToken };
};
exports.generateTokens = generateTokens;
// export const storeRefreshToken = async (userId: number, token: string) => {
//   const key = `refresh_token:${userId}`;
//   await redis.set;
// };
