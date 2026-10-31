import { Request, Response, NextFunction } from "express";
import { Prisma } from "@prisma/client";
import { sendError } from "../utils/api-response";

export const errorHandler = (
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  console.error("Unhandled Error:", err);

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      const target = (err.meta?.target as string[]) || ["field"];
      sendError(
        res,
        `Duplicate entry: A record with this ${target.join(", ")} already exists.`,
        409
      );
      return;
    }
    if (err.code === "P2025") {
      sendError(res, "The requested resource was not found.", 404);
      return;
    }
  }

  const message =
    process.env.NODE_ENV === "production"
      ? "An unexpected error occurred"
      : err.message || "Internal server error";

  sendError(res, message, err.statusCode || 500);
};

