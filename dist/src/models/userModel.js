"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.findAllUsersFromDB = exports.createNewUserInDB = exports.findUserByEmail = void 0;
const prisma_1 = __importDefault(require("../utils/prisma"));
const findUserByEmail = async (email) => {
    return await prisma_1.default.user.findUnique({
        where: { email },
    });
};
exports.findUserByEmail = findUserByEmail;
const createNewUserInDB = async (data) => {
    return await prisma_1.default.user.create({
        data,
        select: {
            id: true,
            email: true,
            username: true,
            createdAt: true,
            updateAt: true,
        },
    });
};
exports.createNewUserInDB = createNewUserInDB;
const findAllUsersFromDB = async () => {
    return await prisma_1.default.user.findMany();
};
exports.findAllUsersFromDB = findAllUsersFromDB;
