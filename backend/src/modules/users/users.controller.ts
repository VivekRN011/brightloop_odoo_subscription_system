import { Request, Response } from "express";
import { UsersService } from "./users.service";
import { sendSuccess, sendError } from "../../utils/api-response";

export class UsersController {
  static async listStaff(req: Request, res: Response) {
    try {
      const data = await UsersService.listStaff(req.query as any);
      return sendSuccess(res, data);
    } catch (error: any) {
      return sendError(res, error.message || "Failed to fetch staff members", 400);
    }
  }

  static async updateStatus(req: Request, res: Response) {
    try {
      const data = await UsersService.updateUserStatus(
        req.params.id as string,
        req.body.status,
        req.user!.id
      );
      return sendSuccess(res, data, "User status updated successfully");
    } catch (error: any) {
      return sendError(res, error.message || "Failed to update user status", 400);
    }
  }
}
