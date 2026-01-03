import redis from "../utils/redis";

import { AppError } from "../utils/AppError";
import { hashToken } from "../utils/authUtils";

const SESSION_PREFIX = "session";
const USER_SESSION_PREFIX = "user_session";

export interface SessionData {
  userId: string;
  refreshTokenHash: string;
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
    const tokenHash = hashToken(refreshToken);

    const sessionKey = `${SESSION_PREFIX}${tokenHash}`;
    const userSessionKey = `${USER_SESSION_PREFIX}${userId}`;

    const sessionData: SessionData = {
      userId: userId.toString(),
      refreshTokenHash: tokenHash,
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
    pipeline.sadd(userSessionKey, tokenHash);
    await pipeline.exec();
    return refreshToken;
  },

  async findSession(token: string): Promise<SessionData | null> {
    const tokenHash = hashToken(token);
    const sessionKey = `${SESSION_PREFIX}${tokenHash}`;
    const data = await redis.get(sessionKey);

    if (!data) return null;
    return JSON.parse(data) as SessionData;
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

  async rotateSession(
    oldRawToken: string,
    newRawToken: string,
    newExpiryDate: Date
  ) {
    const oldHash = hashToken(oldRawToken);
    const newHash = hashToken(newRawToken);

    const oldSessionKey = `${SESSION_PREFIX}${oldHash}`;
    const data = await redis.get(oldSessionKey);
    if (!data) return false;

    const session = JSON.parse(data) as SessionData;
    const userId = session.userId;
    const userSessionsKey = `${USER_SESSION_PREFIX}${userId}`;

    const ttlSeconds = Math.ceil((newExpiryDate.getTime() - Date.now()) / 1000);

    if (ttlSeconds <= 0) {
      throw new AppError("Cant rotate to an expired session", 400);
    }

    const newSessionData: SessionData = {
      ...session,
      refreshTokenHash: newHash,
      expiresAt: newExpiryDate.toISOString(),
      createdAt: new Date().toISOString(),
    };

    const pipeline = await redis.multi();

    // clear olde sesion
    pipeline.del(oldSessionKey);
    pipeline.srem(userSessionsKey, oldHash);

    // create new session
    const newSessionKey = `${SESSION_PREFIX}${newHash}`;
    pipeline.set(
      newSessionKey,
      JSON.stringify(newSessionData),
      "EX",
      ttlSeconds
    );
    pipeline.sadd(userSessionsKey, newHash);

    await pipeline.exec();
    return true;
  },
};
