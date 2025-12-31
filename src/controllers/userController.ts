import { Request, Response, NextFunction } from "express";
import catchAsync from "../utils/catchAsync";

import * as userService from "../services/userServices";

//getAllUsers Controller
export const getAllUsersHandler = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const users = await userService.getAllUserService();

    res.status(200).json({
      success: true,
      results: users.length,
      data: {
        users,
      },
    });
  }
);
