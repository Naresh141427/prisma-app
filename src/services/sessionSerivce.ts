import redis from "../utils/redis";

import { AppError } from "../utils/AppError";
import { SessionPath } from "node:quic";

const SESSION_PREFIX = "session";
const USER_SESSION_PREFIX = "user_session";

export interface SessionData {
  userId: string;
  refreshToken: string;
  userAgent?: string;
  ipAddress?: string;
  expiresAt: string;
  createdAt: string;
}

export interface CreateSessionInput {
  userId: string;
  refreshToken: string;
  userAgent?: string;
  ipAddress?: string;
  expiresAt: Date;
}

export const sessionService = {
  async createSession({
    userId,
    refreshToken,
    userAgent,
    ipAddress,
    expiresAt,
  }: CreateSessionInput) {
    const sessionKey = `${SESSION_PREFIX}${refreshToken}`;
    const userSessionKey = `${USER_SESSION_PREFIX}${userId}`;

    const sessionData: SessionData = {
      userId: userId.toString(),
      refreshToken,
      userAgent,
      ipAddress,
      expiresAt: expiresAt.toISOString(),
      createdAt: new Date().toISOString(),
    };

    const ttlSeconds = Math.ceil((expiresAt.getTime() - Date.now()) / 1000);

    if (ttlSeconds <= 0) {
      throw new AppError(
        "Cannot created a session that is already expired",
        400
      );
    }

    const pipeline = redis.multi();
    pipeline.set(sessionKey, JSON.stringify(sessionData), "EX", ttlSeconds);
    pipeline.sadd(userSessionKey, refreshToken);
    await pipeline.exec();
    return refreshToken;
  },

  async deleteSession(token: string) {
    const sessionKey = `${SESSION_PREFIX}${token}`;

    const data = await redis.get(sessionKey);
    if (data) {
      const session = JSON.parse(data) as SessionData;
      const userSessionKey = `${USER_SESSION_PREFIX}${session.userId}`;

      const pipeline = await redis.multi();
      pipeline.del(sessionKey);
      pipeline.srem(userSessionKey, token);
      return true;
    }

    return false;
  },

  async deleteAllSessions(userId: number) {
    const userSessionKey = `${USER_SESSION_PREFIX}${userId}`;

    const tokens = await redis.smembers(userSessionKey);
    if (tokens.length === 0) {
      return 0;
    }

    const pipeline = await redis.multi();

    for (const token of tokens) {
      pipeline.del(`${SESSION_PREFIX}${token}`);
    }

    pipeline.del(userSessionKey);
    await pipeline.exec();

    return tokens.length;
  },
};
