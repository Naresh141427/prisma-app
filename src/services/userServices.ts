import { CreateUserInput } from "../schemas/userSchemas";
import * as userModel from "../models/userModel";
import { AppError } from "../utils/AppError";

export const createUserService = async (input: CreateUserInput) => {
  const { email } = input;

  const existingUser = await userModel.findUserByEmail(email);

  if (existingUser) {
    throw new AppError("User already exists", 409);
  }

  const newUser = await userModel.createNewUserInDB(input);
  return newUser;
};

export const getAllUserService = async () => {
  return await userModel.findAllUsersFromDB();
};
