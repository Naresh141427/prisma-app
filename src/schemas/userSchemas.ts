import { email, z } from "zod";

export const createUserSchema = z.object({
  body: z
    .object({
      email: z.email({ message: "Invalid email address" }),
      username: z
        .string({ message: "Username is required" })
        .min(3, { message: "Username must be at least 3 characters long" }),
      password: z
        .string({ message: "password is required" })
        .min(6, { message: "password is atleast 6 characters" }),
      confirmPassword: z.string({ message: "confirm password is required" }),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: "Passwords do not match",
      path: ["confirmPassword"],
    }),
});

export type CreateUserInput = z.infer<typeof createUserSchema>["body"];

export const loginUserSchema = z.object({
  body: z.object({
    email: z.email({ message: "Invalid email address" }),
    password: z.string({ message: "password is require" }),
  }),
});

export type LoginUserInput = z.infer<typeof loginUserSchema>["body"];
