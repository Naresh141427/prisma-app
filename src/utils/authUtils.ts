import argon2 from "argon2";
import jwt, { SignOptions } from "jsonwebtoken";
import redis from "./redis";

import { env } from "../config/env";

export const hashPassword = async (password: string): Promise<string> => {
  return await argon2.hash(password);
};

export const verifyPassword = async (
  hash: string,
  plain: string
): Promise<boolean> => {
  try {
    return await argon2.verify(hash, plain);
  } catch {
    return false;
  }
};

export const generateToken = (userId: number) => {
  const accessOptions: SignOptions = {
    expiresIn: env.JWT_ACCESS_EXPIRY as any,
  };

  const refreshOptions: SignOptions = {
    expiresIn: env.JWT_REFRESH_EXPIRY as any,
  };

  const accessToken = jwt.sign(
    { userId },
    env.JWT_ACCESS_SECRET!,
    accessOptions
  );

  const refreshToken = jwt.sign(
    { userId },
    env.JWT_REFRESH_SECRET!,
    refreshOptions
  );

  return { accessToken, refreshToken };
};

export const storeRefreshToken = async (userId: number, token: string) => {
  const key = `refresh_token:${userId}`;
  await redis.set
};
