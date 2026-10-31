import { prisma } from "../../config/prisma";
import { generateCustomerCode } from "../../utils/code-generator";
import {
  CreateCustomerInput,
  UpdateCustomerInput,
  CustomerQueryInput,
} from "./customers.validation";
import { Prisma } from "@prisma/client";

export class CustomersService {
  static async listCustomers(query: CustomerQueryInput) {
    const { search, page, limit } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.CustomerProfileWhereInput = {
      archivedAt: null,
      ...(search && {
        OR: [
          { displayName: { contains: search, mode: "insensitive" } },
          { companyName: { contains: search, mode: "insensitive" } },
          { customerCode: { contains: search, mode: "insensitive" } },
          { user: { email: { contains: search, mode: "insensitive" } } },
        ],
      }),
    };

    const [items, total] = await Promise.all([
      prisma.customerProfile.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              status: true,
            },
          },
          _count: {
            select: {
              subscriptions: true,
              invoices: true,
              payments: true,
            },
          },
        },
      }),
      prisma.customerProfile.count({ where }),
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

  static async getCustomerById(id: string) {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(String(id).trim());
    const customer = isUuid
      ? await prisma.customerProfile.findUnique({
          where: { id },
          include: {
            user: {
              select: {
                id: true,
                email: true,
                role: true,
                status: true,
                lastLoginAt: true,
              },
            },
            subscriptions: {
              orderBy: { createdAt: "desc" },
              take: 10,
              include: {
                plan: true,
              },
            },
            invoices: {
              orderBy: { issueDate: "desc" },
              take: 10,
              include: {
                allocations: true,
              },
            },
            payments: {
              orderBy: { paidAt: "desc" },
              take: 10,
            },
          },
        })
      : await prisma.customerProfile.findFirst({
          where: {
            OR: [
              { customerCode: id },
              { displayName: { equals: id, mode: "insensitive" } },
            ],
          },
          include: {
            user: {
              select: {
                id: true,
                email: true,
                role: true,
                status: true,
                lastLoginAt: true,
              },
            },
            subscriptions: {
              orderBy: { createdAt: "desc" },
              take: 10,
              include: {
                plan: true,
              },
            },
            invoices: {
              orderBy: { issueDate: "desc" },
              take: 10,
              include: {
                allocations: true,
              },
            },
            payments: {
              orderBy: { paidAt: "desc" },
              take: 10,
            },
          },
        });

    if (!customer || customer.archivedAt) {
      throw new Error("Customer not found");
    }

    return customer;
  }

  static async createCustomer(input: CreateCustomerInput, actorUserId?: string) {
    const customerCode = generateCustomerCode();

    const result = await prisma.$transaction(async (tx) => {
      const customer = await tx.customerProfile.create({
        data: {
          customerCode,
          displayName: input.displayName,
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

      if (actorUserId) {
        await tx.auditLog.create({
          data: {
            actorUserId,
            action: "CREATE_CUSTOMER",
            entityType: "CustomerProfile",
            entityId: customer.id,
            summary: `Created customer ${customer.displayName} (${customer.customerCode})`,
          },
        });
      }

      return customer;
    });

    return result;
  }

  static async updateCustomer(id: string, input: UpdateCustomerInput, actorUserId?: string) {
    const existing = await prisma.customerProfile.findUnique({ where: { id } });
    if (!existing || existing.archivedAt) {
      throw new Error("Customer not found");
    }

    const updated = await prisma.$transaction(async (tx) => {
      const customer = await tx.customerProfile.update({
        where: { id },
        data: input,
      });

      if (actorUserId) {
        await tx.auditLog.create({
          data: {
            actorUserId,
            action: "UPDATE_CUSTOMER",
            entityType: "CustomerProfile",
            entityId: customer.id,
            summary: `Updated customer profile ${customer.customerCode}`,
          },
        });
      }

      return customer;
    });

    return updated;
  }

  static async archiveCustomer(id: string, actorUserId?: string) {
    const existing = await prisma.customerProfile.findUnique({ where: { id } });
    if (!existing || existing.archivedAt) {
      throw new Error("Customer not found");
    }

    return await prisma.$transaction(async (tx) => {
      const archived = await tx.customerProfile.update({
        where: { id },
        data: { archivedAt: new Date() },
      });

      if (actorUserId) {
        await tx.auditLog.create({
          data: {
            actorUserId,
            action: "ARCHIVE_CUSTOMER",
            entityType: "CustomerProfile",
            entityId: id,
            summary: `Archived customer ${existing.displayName} (${existing.customerCode})`,
          },
        });
      }

      return archived;
    });
  }
}

