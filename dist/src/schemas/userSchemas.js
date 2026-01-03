"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginUserSchema = exports.createUserSchema = void 0;
const zod_1 = require("zod");
exports.createUserSchema = zod_1.z.object({
    body: zod_1.z
        .object({
        email: zod_1.z.email({ message: "Invalid email address" }),
        username: zod_1.z
            .string({ message: "Username is required" })
            .min(3, { message: "Username must be at least 3 characters long" }),
        password: zod_1.z
            .string({ message: "password is required" })
            .min(6, { message: "password is atleast 6 characters" }),
        confirmPassword: zod_1.z.string({ message: "confirm password is required" }),
    })
        .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
    }),
});
exports.loginUserSchema = zod_1.z.object({
    body: zod_1.z.object({
        email: zod_1.z.email({ message: "Invalid email address" }),
        password: zod_1.z.string({ message: "password is require" }),
    }),
});
