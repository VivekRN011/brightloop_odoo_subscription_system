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
        const parsedQuery = (await schemas.query.parseAsync(req.query)) as any;
        try {
          Object.defineProperty(req, "query", {
            value: parsedQuery,
            writable: true,
            configurable: true,
            enumerable: true,
          });
        } catch {
          Object.assign(req.query, parsedQuery);
        }
      }
      if (schemas.params) {
        const parsedParams = (await schemas.params.parseAsync(req.params)) as any;
        try {
          Object.defineProperty(req, "params", {
            value: parsedParams,
            writable: true,
            configurable: true,
            enumerable: true,
          });
        } catch {
          Object.assign(req.params, parsedParams);
        }
      }
      next();
    } catch (error: any) {
      if (error instanceof ZodError || error?.name === "ZodError") {
        const formattedErrors = (error.issues || []).map((err: any) => ({
          field: err.path?.join(".") || "unknown",
          message: err.message,
        }));
        sendError(res, "Validation failed", 400, formattedErrors);
        return;
      }
      sendError(res, error?.message || "Invalid request data", 400);
    }
  };
};

