import { Request, Response, NextFunction } from "express";
import catchAsync from "../utils/catchAsync";

import { CreateUserInput } from "../schemas/userSchemas";
import * as userService from "../services/userServices";

//creatin user controller
export const createUserHandler = catchAsync(
  async (
    req: Request<{}, {}, CreateUserInput>,
    res: Response,
    next: NextFunction
  ) => {
    const user = await userService.createUserService(req.body);

    res.status(201).json({
      success: true,
      status: "success",
      data: {
        user,
      },
    });
  }
);

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
