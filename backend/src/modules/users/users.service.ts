import { prisma } from "../../config/prisma";
import { UserRole, UserStatus, Prisma } from "@prisma/client";
import { UserQueryInput } from "./users.validation";

export class UsersService {
  static async listStaff(query: UserQueryInput) {
    const { search, status, page, limit } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.UserWhereInput = {
      role: { in: [UserRole.ADMIN, UserRole.STAFF] },
      ...(status && { status }),
      ...(search && {
        email: { contains: search, mode: "insensitive" },
      }),
    };

    const [items, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          email: true,
          role: true,
          status: true,
          lastLoginAt: true,
          createdAt: true,
        },
      }),
      prisma.user.count({ where }),
    ]);

    return {
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static async updateUserStatus(userId: string, status: UserStatus, actorUserId: string) {
    const targetUser = await prisma.user.findUnique({ where: { id: userId } });
    if (!targetUser) throw new Error("User not found");
    if (targetUser.id === actorUserId) {
      throw new Error("You cannot change your own account status.");
    }

    return await prisma.$transaction(async (tx) => {
      const updated = await tx.user.update({
        where: { id: userId },
        data: { status },
        select: {
          id: true,
          email: true,
          role: true,
          status: true,
        },
      });

      await tx.auditLog.create({
        data: {
          actorUserId,
          action: "UPDATE_USER_STATUS",
          entityType: "User",
          entityId: userId,
          summary: `Changed user ${targetUser.email} status to ${status}`,
        },
      });

      return updated;
    });
  }
}

