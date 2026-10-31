import { prisma } from "../../config/prisma";
import { UserRole, UserStatus } from "@prisma/client";
import { hashPassword, comparePassword } from "../../utils/password";
import { signToken } from "../../utils/jwt";
import {
  generateCustomerCode,
  generateRandomToken,
  hashToken,
} from "../../utils/code-generator";
import {
  RegisterInput,
  LoginInput,
  CreateStaffInput,
} from "./auth.validation";
import { EmailService } from "../../services/email.service";

export class AuthService {
  /**
   * Register a new customer account and create their customer profile.
   */
  static async registerCustomer(input: RegisterInput) {
    const existingUser = await prisma.user.findUnique({
      where: { email: input.email },
    });

    if (existingUser) {
      throw new Error("An account with this email address already exists.");
    }

    const passwordHash = await hashPassword(input.password);
    const customerCode = generateCustomerCode();

    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: input.email,
          passwordHash,
          role: UserRole.CUSTOMER,
          status: UserStatus.ACTIVE,
          emailVerifiedAt: new Date(),
        },
      });

      const customerProfile = await tx.customerProfile.create({
        data: {
          userId: user.id,
          customerCode,
          displayName: input.displayName || input.name || input.email.split("@")[0],
          companyName: input.companyName,
          phone: input.phone,
          billingAddressLine1: input.billingAddressLine1,
          billingAddressLine2: input.billingAddressLine2,
          city: input.city,
          state: input.state,
          postalCode: input.postalCode,
          country: input.country,
          taxIdentifier: input.taxIdentifier,
        },
      });

      await tx.auditLog.create({
        data: {
          actorUserId: user.id,
          action: "REGISTER_CUSTOMER",
          entityType: "User",
          entityId: user.id,
          summary: `New customer registered: ${user.email} (${customerProfile.customerCode})`,
        },
      });

      return { user, customerProfile };
    });

    const token = signToken({
      userId: result.user.id,
      email: result.user.email,
      role: result.user.role,
      customerProfileId: result.customerProfile.id,
    });

    return {
      user: {
        id: result.user.id,
        email: result.user.email,
        role: result.user.role,
        status: result.user.status,
      },
      customerProfile: result.customerProfile,
      token,
    };
  }

  /**
   * Authenticate user with email and password.
   */
  static async login(input: LoginInput) {
    const user = await prisma.user.findUnique({
      where: { email: input.email },
      include: {
        customerProfile: true,
      },
    });

    if (!user) {
      throw new Error("Invalid email or password.");
    }

    const isMatch = await comparePassword(input.password, user.passwordHash);
    if (!isMatch) {
      throw new Error("Invalid email or password.");
    }

    if (user.status !== UserStatus.ACTIVE) {
      throw new Error(
        "Your account is disabled or pending activation. Please contact support."
      );
    }

    // Update lastLoginAt
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    const token = signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      customerProfileId: user.customerProfile?.id,
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        status: user.status,
        lastLoginAt: new Date(),
      },
      customerProfile: user.customerProfile,
      token,
    };
  }

  /**
   * Retrieve currently authenticated user profile.
   */
  static async getMe(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        role: true,
        status: true,
        lastLoginAt: true,
        createdAt: true,
        customerProfile: true,
      },
    });

    if (!user) {
      throw new Error("User account not found.");
    }

    return user;
  }

  /**
   * Initiate password reset flow and deliver reset email via Nodemailer.
   */
  static async forgotPassword(email: string) {
    const user = await prisma.user.findUnique({
      where: { email },
      include: { customerProfile: true },
    });

    if (!user) {
      // Return safe message to prevent email enumeration
      return {
        message: "If that email is registered, password reset instructions have been generated.",
      };
    }

    const rawToken = generateRandomToken();
    const tokenHash = hashToken(rawToken);
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour validity

    // Store hashed token
    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt,
      },
    });

    // Send reset email via Nodemailer
    await EmailService.sendPasswordResetEmail({
      to: user.email,
      resetToken: rawToken,
      userDisplayName:
        user.customerProfile?.displayName || user.email.split("@")[0],
    });

    return {
      message: "If that email is registered, password reset instructions have been sent.",
      // Include token in dev mode for easy test execution
      ...(process.env.NODE_ENV !== "production" && { devResetToken: rawToken }),
    };
  }

  /**
   * Complete password reset.
   */
  static async resetPassword(rawToken: string, newPassword: string) {
    const tokenHash = hashToken(rawToken);

    const resetRecord = await prisma.passwordResetToken.findUnique({
      where: { tokenHash },
      include: { user: true },
    });

    if (
      !resetRecord ||
      resetRecord.usedAt !== null ||
      resetRecord.expiresAt < new Date()
    ) {
      throw new Error("Invalid or expired password reset link.");
    }

    const passwordHash = await hashPassword(newPassword);

    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: resetRecord.userId },
        data: { passwordHash },
      });

      await tx.passwordResetToken.update({
        where: { id: resetRecord.id },
        data: { usedAt: new Date() },
      });

      await tx.auditLog.create({
        data: {
          actorUserId: resetRecord.userId,
          action: "PASSWORD_RESET_COMPLETED",
          entityType: "User",
          entityId: resetRecord.userId,
          summary: `Password reset successfully for ${resetRecord.user.email}`,
        },
      });
    });

    return { message: "Password updated successfully. You can now log in." };
  }

  /**
   * Admin-only: Create an internal staff account.
   */
  static async createStaff(adminUserId: string, input: CreateStaffInput) {
    const existing = await prisma.user.findUnique({
      where: { email: input.email },
    });

    if (existing) {
      throw new Error("An account with this email address already exists.");
    }

    const passwordHash = await hashPassword(input.password);

    const newStaff = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: input.email,
          passwordHash,
          role: UserRole.STAFF,
          status: UserStatus.ACTIVE,
          emailVerifiedAt: new Date(),
        },
        select: {
          id: true,
          email: true,
          role: true,
          status: true,
          createdAt: true,
        },
      });

      await tx.auditLog.create({
        data: {
          actorUserId: adminUserId,
          action: "CREATE_STAFF_ACCOUNT",
          entityType: "User",
          entityId: user.id,
          summary: `Admin created staff account for ${user.email} (${input.displayName || input.name || "Staff"})`,
        },
      });

      return user;
    });

    return newStaff;
  }
}
