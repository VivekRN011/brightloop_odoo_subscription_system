import { Request, Response } from "express";
import { CustomersService } from "./customers.service";
import { sendSuccess, sendError } from "../../utils/api-response";

export class CustomersController {
  static async list(req: Request, res: Response) {
    try {
      const data = await CustomersService.listCustomers(req.query as any);
      return sendSuccess(res, data);
    } catch (error: any) {
      return sendError(res, error.message || "Failed to fetch customers", 400);
    }
  }

  static async getById(req: Request, res: Response) {
    try {
      const data = await CustomersService.getCustomerById(req.params.id as string);
      return sendSuccess(res, data);
    } catch (error: any) {
      return sendError(res, error.message || "Failed to fetch customer details", 404);
    }
  }

  static async create(req: Request, res: Response) {
    try {
      const data = await CustomersService.createCustomer(req.body, req.user?.id);
      return sendSuccess(res, data, "Customer created successfully", 201);
    } catch (error: any) {
      return sendError(res, error.message || "Failed to create customer", 400);
    }
  }

  static async update(req: Request, res: Response) {
    try {
      const data = await CustomersService.updateCustomer(req.params.id as string, req.body, req.user?.id);
      return sendSuccess(res, data, "Customer updated successfully");
    } catch (error: any) {
      return sendError(res, error.message || "Failed to update customer", 400);
    }
  }

  static async archive(req: Request, res: Response) {
    try {
      await CustomersService.archiveCustomer(req.params.id as string, req.user?.id);
      return sendSuccess(res, null, "Customer archived successfully");
    } catch (error: any) {
      return sendError(res, error.message || "Failed to archive customer", 400);
    }
  }
}
