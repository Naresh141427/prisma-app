import { Router } from "express";

import * as userHandler from "../controllers/userController";
import validateResource from "../middlewares/validateResource";
import { createUserSchema } from "../schemas/userSchemas";

const router = Router();

router.post(
  "/",
  validateResource(createUserSchema),
  userHandler.createUserHandler
);

router.get(
  "/",
  userHandler.getAllUsersHandler
);

export default router;
