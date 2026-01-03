"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logoutAll = exports.logout = exports.refreshAccessToken = exports.login = exports.signup = void 0;
const catchAsync_1 = __importDefault(require("../utils/catchAsync"));
const authService = __importStar(require("../services/authServices"));
const env_1 = require("../config/env");
const AppError_1 = require("../utils/AppError");
exports.signup = (0, catchAsync_1.default)(async (req, res, next) => {
    const user = await authService.signupService(req.body);
    res.status(201).json({
        success: true,
        status: "success",
        data: {
            user,
        },
    });
});
exports.login = (0, catchAsync_1.default)(async (req, res, next) => {
    const userAgent = req.headers["user-agent"] || "Unknown";
    const ipAddress = req.headers["x-forwarded-for"] || req.ip || "";
    const { dbUser, accessToken, refreshToken } = await authService.loginService(req.body, { userAgent, ipAddress });
    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: env_1.env.NODE_ENV === "production",
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
});
exports.refreshAccessToken = (0, catchAsync_1.default)(async (req, res, next) => {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
        return next(new AppError_1.AppError("Could not rotate access token", 401));
    }
    const { accessToken, refreshToken: newRefreshToken } = await authService.refreshUserSessionService(refreshToken);
    res.cookie("refreshToken", newRefreshToken, {
        httpOnly: true,
        secure: env_1.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    res.status(200).json({
        success: true,
        status: "success",
        data: {
            accessToken,
        },
    });
});
exports.logout = (0, catchAsync_1.default)(async (req, res, next) => {
    const refreshToken = req.cookies.refreshToken;
    if (refreshToken) {
        await authService.logoutUserSessionService(refreshToken);
    }
    res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: env_1.env.NODE_ENV === "production",
        sameSite: "strict",
    });
    res.status(200).json({
        success: true,
        status: "success",
        message: "Logged out successfully",
    });
});
exports.logoutAll = (0, catchAsync_1.default)(async (req, res, next) => {
    const refreshToken = req.cookies.refreshToken;
    if (refreshToken) {
        await authService.logoutAllDevicesService(refreshToken);
    }
    res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: env_1.env.NODE_ENV === "production",
        sameSite: "strict",
    });
    res.status(200).json({
        success: true,
        status: "success",
        message: "Loggedout from all devices successfully",
    });
});
