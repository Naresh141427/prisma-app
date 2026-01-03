import express, { NextFunction, Request, Response } from "express";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
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
app.use(cookieParser());
app.use(requestLogger);

app.use("/api/auth", authRoutes);

app.get("/health", (req: Request, res: Response) => res.status(200).send("OK"));

app.all(/(.*)/, (req: Request, res: Response, next: NextFunction) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

app.listen(Number(PORT), () => {
  logger.info(`Server running on port ${PORT}`);
});
