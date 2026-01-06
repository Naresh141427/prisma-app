import { Prisma } from "@prisma/client";
import prisma from "../utils/prisma";


export const findUserByEmail = async (email: string) => {
  return await prisma.user.findUnique({
    where: { email },
  });
};

export const createNewUserInDB = async (data: Prisma.UserCreateInput) => {
  return await prisma.user.create({
    data,
    select: {
      id: true,
      email: true,
      username: true,
      createdAt: true,
      updatedAt: true,
    },
  });
};

export const findAllUsersFromDB = async () => {
  return await prisma.user.findMany();
};
