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
exports.logoutAllDevicesService = exports.logoutUserSessionService = exports.refreshUserSessionService = exports.loginService = exports.signupService = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../config/env");
const userModel = __importStar(require("../models/userModel"));
const AppError_1 = require("../utils/AppError");
const authUtils_1 = require("../utils/authUtils");
const sessionServices_1 = require("./sessionServices");
const signupService = async (input) => {
    const { email, password, username } = input;
    const existingUser = await userModel.findUserByEmail(email);
    if (existingUser) {
        throw new AppError_1.AppError("User already exists", 409);
    }
    const hashedPassword = await (0, authUtils_1.hashPassword)(password);
    const newUser = await userModel.createNewUserInDB({
        email,
        username,
        password: hashedPassword,
    });
    return newUser;
};
exports.signupService = signupService;
const loginService = async (input, context) => {
    const { email, password } = input;
    const dbUser = await userModel.findUserByEmail(email);
    if (!dbUser) {
        throw new AppError_1.AppError("User not found", 404);
    }
    const isPasswordMatched = (0, authUtils_1.verifyPassword)(dbUser.password, password);
    if (!isPasswordMatched) {
        throw new AppError_1.AppError("Invalid password", 400);
    }
    const { accessToken, refreshToken } = await (0, authUtils_1.generateTokens)(dbUser.id);
    // const sessionData = {
    // }
    const sessionExpiry = new Date();
    sessionExpiry.setDate(sessionExpiry.getDate() + 7);
    await sessionServices_1.sessionService.createSession({
        userId: dbUser.id,
        refreshToken,
        userAgent: context.userAgent,
        ipAddress: context.ipAddress,
        expiresAt: sessionExpiry,
    });
    return { dbUser, accessToken, refreshToken };
};
exports.loginService = loginService;
const refreshUserSessionService = async (refreshToken) => {
    let decoded;
    try {
        decoded = (await jsonwebtoken_1.default.verify(refreshToken, env_1.env.JWT_REFRESH_SECRET));
    }
    catch {
        throw new AppError_1.AppError("Invalid or expired refresh token", 401);
    }
    // check session exist in redis
    const session = await sessionServices_1.sessionService.findSession(refreshToken);
    if (!session) {
        throw new AppError_1.AppError("Session is not active", 401);
    }
    // generate new token
    const { accessToken, refreshToken: newRefreshToken } = await (0, authUtils_1.generateTokens)(session.userId);
    const newExpiry = new Date();
    newExpiry.setDate(newExpiry.getDate() + 7);
    const success = await sessionServices_1.sessionService.rotateSession(refreshToken, newRefreshToken, newExpiry);
    if (!success) {
        throw new AppError_1.AppError("Could not refresh session", 500);
    }
    return { accessToken, refreshToken: newRefreshToken };
};
exports.refreshUserSessionService = refreshUserSessionService;
const logoutUserSessionService = async (refreshToken) => {
    await sessionServices_1.sessionService.deleteSession(refreshToken);
};
exports.logoutUserSessionService = logoutUserSessionService;
const logoutAllDevicesService = async (refreshToken) => {
    const session = await sessionServices_1.sessionService.findSession(refreshToken);
    if (!session) {
        throw new AppError_1.AppError("Invalid session", 401);
    }
    await sessionServices_1.sessionService.deleteAllSessions(session.userId);
};
exports.logoutAllDevicesService = logoutAllDevicesService;
