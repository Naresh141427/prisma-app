import express, { NextFunction, Request, Response } from "express";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import cors from "cors";

import logger from "./src/utils/logger";
import requestLogger from "./src/utils/requestLogger";
import authRoutes from "./src/routes/authRoutes";
import globalErrorHandler from "./src/middlewares/globalErrorHandler";
import { AppError } from "./src/utils/AppError";
import { env } from "./src/config/env";

dotenv.config();

const app = express();

const PORT = env.PORT || 3000;

app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:5175",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(cookieParser());
app.use(requestLogger);

app.use("/api/auth", authRoutes);

app.get("/", (req: Request, res: Response) =>
  res.status(200).send("API is running successfully! 🚀")
);

app.all(/(.*)/, (req: Request, res: Response, next: NextFunction) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

app.listen(Number(PORT), () => {
  logger.info(`Server running on port ${PORT}`);
});
