import { Request, Response, NextFunction } from "express";
import { ZodSchema, ZodError } from "zod";
import { sendError } from "../utils/api-response";

interface ValidationSchemas {
  body?: ZodSchema;
  query?: ZodSchema;
  params?: ZodSchema;
}

export const validate = (schemas: ValidationSchemas) => {
  return async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      if (schemas.body) {
        req.body = await schemas.body.parseAsync(req.body);
      }
      if (schemas.query) {
        req.query = (await schemas.query.parseAsync(req.query)) as any;
      }
      if (schemas.params) {
        req.params = (await schemas.params.parseAsync(req.params)) as any;
      }
      next();
    } catch (error: any) {
      if (error instanceof ZodError) {
        const formattedErrors = error.issues.map((err) => ({
          field: err.path.join("."),
          message: err.message,
        }));
        sendError(res, "Validation failed", 400, formattedErrors);
        return;
      }
      sendError(res, "Invalid request data", 400);
    }
  };
};

