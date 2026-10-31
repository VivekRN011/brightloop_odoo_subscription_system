import { Request, Response, NextFunction } from "express";
import { UserRole } from "@prisma/client";
import { sendError } from "../utils/api-response";

/**
 * Restricts route access to specified roles.
 * Must be preceded by authenticate middleware.
 */
export const requireRole = (...allowedRoles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      sendError(res, "Authentication required.", 401);
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      sendError(
        res,
        `Access denied. Requires one of the following roles: [${allowedRoles.join(
          ", "
        )}]`,
        403
      );
      return;
    }

    next();
  };
};

