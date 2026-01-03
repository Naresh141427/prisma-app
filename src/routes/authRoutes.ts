import { Router } from "express";

import * as authHandler from "../controllers/authController";
import validateResource from "../middlewares/validateResource";
import { createUserSchema, loginUserSchema } from "../schemas/userSchemas";

const router = Router();

router.post("/signup", validateResource(createUserSchema), authHandler.signup);
router.post("/login", validateResource(loginUserSchema), authHandler.login);
router.get("/refresh", authHandler.refreshAccessToken);
router.post("/logout", authHandler.logout);
router.post("/logout-all", authHandler.logoutAll);

export default router;
