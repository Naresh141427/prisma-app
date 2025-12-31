import { CreateUserInput, LoginUserInput } from "../schemas/userSchemas";
import * as userModel from "../models/userModel";
import { AppError } from "../utils/AppError";
import {
  generateToken,
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

  const { accessToken, refreshToken } = await generateToken(dbUser.id);
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
