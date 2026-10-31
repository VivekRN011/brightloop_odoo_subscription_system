import { z } from "zod";
import { UserStatus } from "@prisma/client";

export const updateUserStatusSchema = z.object({
  status: z.nativeEnum(UserStatus),
});

export const userQuerySchema = z.object({
  search: z.string().optional(),
  status: z.nativeEnum(UserStatus).optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
});

export type UpdateUserStatusInput = z.infer<typeof updateUserStatusSchema>;
export type UserQueryInput = z.infer<typeof userQuerySchema>;

