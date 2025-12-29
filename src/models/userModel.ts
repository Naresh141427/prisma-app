import prisma from "../utils/prisma";
import { CreateUserInput } from "../schemas/userSchemas";

export const findUserByEmail = async (email: string) => {
  return await prisma.user.findUnique({
    where: { email },
  });
};

export const createNewUserInDB = async (data: CreateUserInput) => {
  return await prisma.user.create({
    data,
  });
};

export const findAllUsersFromDB = async () => {
  return await prisma.user.findMany();
};
