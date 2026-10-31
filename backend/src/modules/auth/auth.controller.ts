import { Request, Response, NextFunction } from "express";
import { AuthService } from "./auth.service";
import { sendSuccess, sendError } from "../../utils/api-response";

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  maxAge: 24 * 60 * 60 * 1000, // 1 day
};

export class AuthController {
  static async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await AuthService.registerCustomer(req.body);
      res.cookie("token", result.token, COOKIE_OPTIONS);
      sendSuccess(res, result, "Account registered successfully", 201);
    } catch (error: any) {
      sendError(res, error.message || "Registration failed", 400);
    }
  }

  static async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await AuthService.login(req.body);
      res.cookie("token", result.token, COOKIE_OPTIONS);
      sendSuccess(res, result, "Login successful");
    } catch (error: any) {
      sendError(res, error.message || "Login failed", 401);
    }
  }

  static async getMe(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        sendError(res, "Unauthorized", 401);
        return;
      }
      const user = await AuthService.getMe(req.user.id);
      sendSuccess(res, user, "User profile retrieved");
    } catch (error: any) {
      sendError(res, error.message || "Failed to retrieve user profile", 400);
    }
  }

  static async logout(_req: Request, res: Response, _next: NextFunction): Promise<void> {
    res.clearCookie("token");
    sendSuccess(res, null, "Logged out successfully");
  }

  static async forgotPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await AuthService.forgotPassword(req.body.email);
      sendSuccess(res, result, result.message);
    } catch (error: any) {
      sendError(res, error.message || "Failed to process forgot password", 400);
    }
  }

  static async resetPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { token, newPassword } = req.body;
      const result = await AuthService.resetPassword(token, newPassword);
      sendSuccess(res, null, result.message);
    } catch (error: any) {
      sendError(res, error.message || "Failed to reset password", 400);
    }
  }

  static async createStaff(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        sendError(res, "Unauthorized", 401);
        return;
      }
      const newStaff = await AuthService.createStaff(req.user.id, req.body);
      sendSuccess(res, newStaff, "Staff account created successfully", 201);
    } catch (error: any) {
      sendError(res, error.message || "Failed to create staff account", 400);
    }
  }
}

