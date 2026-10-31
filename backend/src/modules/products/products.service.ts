import { prisma } from "../../config/prisma";
import {
  CreateProductInput,
  UpdateProductInput,
  ProductQueryInput,
  CreateVariantInput,
} from "./products.validation";
import { Prisma } from "@prisma/client";

export class ProductsService {
  static async listProducts(query: ProductQueryInput) {
    const { search, isActive, productType, page, limit } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.ProductWhereInput = {
      archivedAt: null,
      ...(isActive !== undefined && { isActive: isActive === "true" }),
      ...(productType && { productType }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { sku: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
        ],
      }),
    };

    const [items, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          variants: {
            where: { isActive: true },
          },
        },
      }),
      prisma.product.count({ where }),
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

  static async getProductById(id: string) {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        variants: true,
      },
    });

    if (!product || product.archivedAt) {
      throw new Error("Product not found");
    }

    return product;
  }

  static async createProduct(input: CreateProductInput, actorUserId?: string) {
    return await prisma.$transaction(async (tx) => {
      const product = await tx.product.create({
        data: {
          sku: input.sku,
          name: input.name,
          productType: input.productType,
          description: input.description,
          salesPrice: input.salesPrice,
          costPrice: input.costPrice,
          currency: input.currency,
          notes: input.notes,
          isActive: input.isActive,
        },
      });

      if (actorUserId) {
        await tx.auditLog.create({
          data: {
            actorUserId,
            action: "CREATE_PRODUCT",
            entityType: "Product",
            entityId: product.id,
            summary: `Created product ${product.name} (${product.sku || "No SKU"})`,
          },
        });
      }

      return product;
    });
  }

  static async updateProduct(id: string, input: UpdateProductInput, actorUserId?: string) {
    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing || existing.archivedAt) {
      throw new Error("Product not found");
    }

    return await prisma.$transaction(async (tx) => {
      const updated = await tx.product.update({
        where: { id },
        data: input,
      });

      if (actorUserId) {
        await tx.auditLog.create({
          data: {
            actorUserId,
            action: "UPDATE_PRODUCT",
            entityType: "Product",
            entityId: id,
            summary: `Updated product ${updated.name}`,
          },
        });
      }

      return updated;
    });
  }

  static async toggleProductStatus(id: string, actorUserId?: string) {
    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing || existing.archivedAt) {
      throw new Error("Product not found");
    }

    const newStatus = !existing.isActive;

    return await prisma.$transaction(async (tx) => {
      const updated = await tx.product.update({
        where: { id },
        data: { isActive: newStatus },
      });

      if (actorUserId) {
        await tx.auditLog.create({
          data: {
            actorUserId,
            action: "TOGGLE_PRODUCT_STATUS",
            entityType: "Product",
            entityId: id,
            summary: `${newStatus ? "Activated" : "Deactivated"} product ${existing.name}`,
          },
        });
      }

      return updated;
    });
  }

  static async addVariant(productId: string, input: CreateVariantInput) {
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product || product.archivedAt) {
      throw new Error("Product not found");
    }

    return await prisma.productVariant.create({
      data: {
        productId,
        name: input.name,
        value: input.value,
        priceAdjustment: input.priceAdjustment,
      },
    });
  }

  static async deleteVariant(variantId: string) {
    return await prisma.productVariant.delete({
      where: { id: variantId },
    });
  }
}

