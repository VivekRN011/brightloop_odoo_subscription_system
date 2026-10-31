import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt";
import { prisma } from "../config/prisma";
import { sendError } from "../utils/api-response";
import { UserStatus } from "@prisma/client";

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let token: string | undefined;

    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    } else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      sendError(res, "Authentication required. Please sign in.", 401);
      return;
    }

    let payload;
    try {
      payload = verifyToken(token);
    } catch (err: any) {
      sendError(res, "Invalid or expired session. Please sign in again.", 401);
      return;
    }

    // Verify user exists and is active in database
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      include: {
        customerProfile: {
          select: { id: true },
        },
      },
    });

    if (!user) {
      sendError(res, "Account no longer exists.", 401);
      return;
    }

    if (user.status !== UserStatus.ACTIVE) {
      sendError(
        res,
        "Account is disabled or pending activation. Please contact support.",
        403
      );
      return;
    }

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      status: user.status,
      customerProfileId: user.customerProfile?.id,
    };

    next();
  } catch (error: any) {
    console.error("Auth middleware error:", error);
    sendError(res, "Authentication failed", 500);
  }
};

/**
 * Optional authentication middleware:
 * Populates req.user if a valid token is provided, but allows unauthenticated requests to proceed.
 */
export const optionalAuthenticate = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let token: string | undefined;

    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    } else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return next();
    }

    const payload = verifyToken(token);
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      include: {
        customerProfile: { select: { id: true } },
      },
    });

    if (user && user.status === UserStatus.ACTIVE) {
      req.user = {
        id: user.id,
        email: user.email,
        role: user.role,
        status: user.status,
        customerProfileId: user.customerProfile?.id,
      };
    }
    next();
  } catch {
    next();
  }
};


