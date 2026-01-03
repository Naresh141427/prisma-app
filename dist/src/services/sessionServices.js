"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sessionService = void 0;
const redis_1 = __importDefault(require("../utils/redis"));
const AppError_1 = require("../utils/AppError");
const authUtils_1 = require("../utils/authUtils");
const SESSION_PREFIX = "session";
const USER_SESSION_PREFIX = "user_session";
exports.sessionService = {
    async createSession({ userId, refreshToken, userAgent, ipAddress, expiresAt, }) {
        const tokenHash = (0, authUtils_1.hashToken)(refreshToken);
        const sessionKey = `${SESSION_PREFIX}${tokenHash}`;
        const userSessionKey = `${USER_SESSION_PREFIX}${userId}`;
        const sessionData = {
            userId: userId.toString(),
            refreshTokenHash: tokenHash,
            userAgent,
            ipAddress,
            expiresAt: expiresAt.toISOString(),
            createdAt: new Date().toISOString(),
        };
        const ttlSeconds = Math.ceil((expiresAt.getTime() - Date.now()) / 1000);
        if (ttlSeconds <= 0) {
            throw new AppError_1.AppError("Cannot created a session that is already expired", 400);
        }
        const pipeline = redis_1.default.multi();
        pipeline.set(sessionKey, JSON.stringify(sessionData), "EX", ttlSeconds);
        pipeline.sadd(userSessionKey, tokenHash);
        await pipeline.exec();
        return refreshToken;
    },
    async findSession(token) {
        const tokenHash = (0, authUtils_1.hashToken)(token);
        const sessionKey = `${SESSION_PREFIX}${tokenHash}`;
        const data = await redis_1.default.get(sessionKey);
        if (!data)
            return null;
        return JSON.parse(data);
    },
    async deleteSession(token) {
        const tokenHash = (0, authUtils_1.hashToken)(token);
        const sessionKey = `${SESSION_PREFIX}${tokenHash}`;
        const data = await redis_1.default.get(sessionKey);
        if (data) {
            const session = JSON.parse(data);
            const userSessionKey = `${USER_SESSION_PREFIX}${session.userId}`;
            const pipeline = await redis_1.default.multi();
            pipeline.del(sessionKey);
            pipeline.srem(userSessionKey, tokenHash);
            await pipeline.exec();
            return true;
        }
        return false;
    },
    async deleteAllSessions(userId) {
        const userSessionKey = `${USER_SESSION_PREFIX}${userId}`;
        const tokens = await redis_1.default.smembers(userSessionKey);
        if (tokens.length === 0) {
            return 0;
        }
        const pipeline = redis_1.default.multi();
        for (const token of tokens) {
            pipeline.del(`${SESSION_PREFIX}${token}`);
        }
        pipeline.del(userSessionKey);
        await pipeline.exec();
        return tokens.length;
    },
    async rotateSession(oldRawToken, newRawToken, newExpiryDate) {
        const oldHash = (0, authUtils_1.hashToken)(oldRawToken);
        const newHash = (0, authUtils_1.hashToken)(newRawToken);
        const oldSessionKey = `${SESSION_PREFIX}${oldHash}`;
        const data = await redis_1.default.get(oldSessionKey);
        if (!data)
            return false;
        const session = JSON.parse(data);
        const userId = session.userId;
        const userSessionsKey = `${USER_SESSION_PREFIX}${userId}`;
        const ttlSeconds = Math.ceil((newExpiryDate.getTime() - Date.now()) / 1000);
        if (ttlSeconds <= 0) {
            throw new AppError_1.AppError("Cant rotate to an expired session", 400);
        }
        const newSessionData = {
            ...session,
            refreshTokenHash: newHash,
            expiresAt: newExpiryDate.toISOString(),
            createdAt: new Date().toISOString(),
        };
        const pipeline = await redis_1.default.multi();
        // clear olde sesion
        pipeline.del(oldSessionKey);
        pipeline.srem(userSessionsKey, oldHash);
        // create new session
        const newSessionKey = `${SESSION_PREFIX}${newHash}`;
        pipeline.set(newSessionKey, JSON.stringify(newSessionData), "EX", ttlSeconds);
        pipeline.sadd(userSessionsKey, newHash);
        await pipeline.exec();
        return true;
    },
};
