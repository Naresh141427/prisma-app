"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const dotenv_1 = __importDefault(require("dotenv"));
const logger_1 = __importDefault(require("./src/utils/logger"));
const requestLogger_1 = __importDefault(require("./src/utils/requestLogger"));
const authRoutes_1 = __importDefault(require("./src/routes/authRoutes"));
const globalErrorHandler_1 = __importDefault(require("./src/middlewares/globalErrorHandler"));
const AppError_1 = require("./src/utils/AppError");
const env_1 = require("./src/config/env");
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = env_1.env.PORT || 3000;
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
app.use(requestLogger_1.default);
app.use("/api/auth", authRoutes_1.default);
app.get("/health", (req, res) => res.status(200).send("OK"));
app.all(/(.*)/, (req, res, next) => {
    next(new AppError_1.AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});
app.use(globalErrorHandler_1.default);
app.listen(Number(PORT), () => {
    logger_1.default.info(`Server running on port ${PORT}`);
});
