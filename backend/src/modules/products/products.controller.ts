import { Request, Response } from "express";
import { ProductsService } from "./products.service";
import { sendSuccess, sendError } from "../../utils/api-response";

export class ProductsController {
  static async list(req: Request, res: Response) {
    try {
      const data = await ProductsService.listProducts(req.query as any);
      return sendSuccess(res, data);
    } catch (error: any) {
      return sendError(res, error.message || "Failed to fetch products", 400);
    }
  }

  static async getById(req: Request, res: Response) {
    try {
      const data = await ProductsService.getProductById(req.params.id as string);
      return sendSuccess(res, data);
    } catch (error: any) {
      return sendError(res, error.message || "Failed to fetch product", 404);
    }
  }

  static async create(req: Request, res: Response) {
    try {
      const data = await ProductsService.createProduct(req.body, req.user?.id);
      return sendSuccess(res, data, "Product created successfully", 201);
    } catch (error: any) {
      return sendError(res, error.message || "Failed to create product", 400);
    }
  }

  static async update(req: Request, res: Response) {
    try {
      const data = await ProductsService.updateProduct(req.params.id as string, req.body, req.user?.id);
      return sendSuccess(res, data, "Product updated successfully");
    } catch (error: any) {
      return sendError(res, error.message || "Failed to update product", 400);
    }
  }

  static async toggleStatus(req: Request, res: Response) {
    try {
      const data = await ProductsService.toggleProductStatus(req.params.id as string, req.user?.id);
      return sendSuccess(res, data, "Product status updated");
    } catch (error: any) {
      return sendError(res, error.message || "Failed to toggle status", 400);
    }
  }

  static async addVariant(req: Request, res: Response) {
    try {
      const data = await ProductsService.addVariant(req.params.id as string, req.body);
      return sendSuccess(res, data, "Variant added successfully", 201);
    } catch (error: any) {
      return sendError(res, error.message || "Failed to add variant", 400);
    }
  }

  static async deleteVariant(req: Request, res: Response) {
    try {
      await ProductsService.deleteVariant(req.params.variantId as string);
      return sendSuccess(res, null, "Variant removed successfully");
    } catch (error: any) {
      return sendError(res, error.message || "Failed to delete variant", 400);
    }
  }
}
