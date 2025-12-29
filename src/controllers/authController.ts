import { Request, Response, NextFunction } from "express";
import catchAsync from "../utils/catchAsync";

import { CreateUserInput } from "../schemas/userSchemas";
// import sessionService from "../services/sessionSerivce";

export const login = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {}
);
