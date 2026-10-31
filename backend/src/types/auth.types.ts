import { UserRole, UserStatus } from "@prisma/client";

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  customerProfileId?: string;
}

export interface TokenPayload {
  userId: string;
  email: string;
  role: UserRole;
  customerProfileId?: string;
}

