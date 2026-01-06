import { Request, Response, NextFunction } from "express";

import catchAsync from "../utils/catchAsync";
import { CreateUserInput, LoginUserInput } from "../schemas/userSchemas";
import * as authService from "../services/authServices";
import { env } from "../config/env";
import { AppError } from "../utils/AppError";

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

export const refreshAccessToken = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return next(new AppError("Could not rotate access token", 401));
    }

    const {
      accessToken,
      refreshToken: newRefreshToken,
      dbUser,
    } = await authService.refreshUserSessionService(refreshToken);

    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      success: true,
      status: "success",
      data: {
        user: dbUser,
        accessToken,
      },
    });
  }
);

export const logout = catchAsync(
  async (req: Request, res: Response, next: Response) => {
    const refreshToken = req.cookies.refreshToken;

    if (refreshToken) {
      await authService.logoutUserSessionService(refreshToken);
    }

    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: env.NODE_ENV === "production",
      sameSite: "strict",
    });
    res.status(200).json({
      success: true,
      status: "success",
      message: "Logged out successfully",
    });
  }
);

export const logoutAll = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const refreshToken = req.cookies.refreshToken;

    if (refreshToken) {
      await authService.logoutAllDevicesService(refreshToken);
    }
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: env.NODE_ENV === "production",
      sameSite: "strict",
    });

    res.status(200).json({
      success: true,
      status: "success",
      message: "Logged out from all devices successfully",
    });
  }
);
