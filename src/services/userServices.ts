import { CreateUserInput } from "../schemas/userSchemas";
import * as userModel from "../models/userModel";
import { AppError } from "../utils/AppError";
import { hashPassword } from "../utils/authUtils";



export const getAllUserService = async () => {
  return await userModel.findAllUsersFromDB();
};
