import jwt from "jsonwebtoken";
import { env } from "../config/env";

import { CreateUserInput, LoginUserInput } from "../schemas/userSchemas";
import * as userModel from "../models/userModel";
import { AppError } from "../utils/AppError";
import {
  generateTokens,
  hashPassword,
  verifyPassword,
} from "../utils/authUtils";
import { sessionService } from "./sessionServices";

interface LoginContext {
  userAgent?: string;
  ipAddress?: string;
}

export const signupService = async (input: CreateUserInput) => {
  const { email, password, username } = input;

  const existingUser = await userModel.findUserByEmail(email);

  if (existingUser) {
    throw new AppError("User already exists", 409);
  }

  const hashedPassword = await hashPassword(password);
  const newUser = await userModel.createNewUserInDB({
    email,
    username,
    password: hashedPassword,
  });
  return newUser;
};

export const loginService = async (
  input: LoginUserInput,
  context: LoginContext
) => {
  const { email, password } = input;
  const dbUser = await userModel.findUserByEmail(email);

  if (!dbUser) {
    throw new AppError("User not found", 404);
  }

  const isPasswordMatched = verifyPassword(dbUser.password, password);

  if (!isPasswordMatched) {
    throw new AppError("Invalid password", 400);
  }

  const { accessToken, refreshToken } = await generateTokens(dbUser.id);
  // const sessionData = {

  // }

  const sessionExpiry = new Date();
  sessionExpiry.setDate(sessionExpiry.getDate() + 7);

  await sessionService.createSession({
    userId: dbUser.id,
    refreshToken,
    userAgent: context.userAgent,
    ipAddress: context.ipAddress,
    expiresAt: sessionExpiry,
  });

  return { dbUser, accessToken, refreshToken };
};

export const refreshUserSessionService = async (refreshToken: string) => {
  let decoded;

  try {
    decoded = (await jwt.verify(refreshToken, env.JWT_REFRESH_SECRET)) as {
      userId: string;
    };
  } catch {
    throw new AppError("Invalid or expired refresh token", 401);
  }

  // check session exist in redis
  const session = await sessionService.findSession(refreshToken);

  if (!session) {
    throw new AppError("Session is not active", 401);
  }

  // generate new token
  const { accessToken, refreshToken: newRefreshToken } = await generateTokens(
    session.userId
  );

  const newExpiry = new Date();
  newExpiry.setDate(newExpiry.getDate() + 7);

  const success = await sessionService.rotateSession(
    refreshToken,
    newRefreshToken,
    newExpiry
  );

  if (!success) {
    throw new AppError("Could not refresh session", 500);
  }

  return { accessToken, refreshToken: newRefreshToken };
};

export const logoutUserSessionService = async (refreshToken: string) => {
  await sessionService.deleteSession(refreshToken);
};

export const logoutAllDevicesService = async (refreshToken: string) => {
  const session = await sessionService.findSession(refreshToken);

  if (!session) {
    throw new AppError("Invalid session", 401);
  }
  await sessionService.deleteAllSessions(session.userId);
};
