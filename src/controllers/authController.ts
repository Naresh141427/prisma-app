import { Request, Response, NextFunction } from "express";
import catchAsync from "../utils/catchAsync";

import { CreateUserInput, LoginUserInput } from "../schemas/userSchemas";
import * as authService from "../services/authServices";
import { env } from "../config/env";
import { email } from "zod";

export const signup = catchAsync(
  async (
    req: Request<{}, {}, CreateUserInput>,
    res: Response,
    next: NextFunction
  ) => {
    const user = await authService.signupService(req.body);

    res.status(201).json({
      success: true,
      status: "success",
      data: {
        user,
      },
    });
  }
);
export const login = catchAsync(
  async (
    req: Request<{}, {}, LoginUserInput>,
    res: Response,
    next: NextFunction
  ) => {
    const userAgent = req.headers["user-agent"] || "Unknown";
    const ipAddress =
      (req.headers["x-forwarded-for"] as string) || req.ip || "";

    const { dbUser, accessToken, refreshToken } =
      await authService.loginService(req.body, { userAgent, ipAddress });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      success: true,
      status: "success",
      data: {
        user: {
          id: dbUser.id,
          email: dbUser.email,
          username: dbUser.username,
        },
        accessToken,
      },
    });
  }
);
