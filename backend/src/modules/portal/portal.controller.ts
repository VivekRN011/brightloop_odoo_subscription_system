import { Request, Response } from "express";
import { prisma } from "../../config/prisma";
import { sendSuccess, sendError } from "../../utils/api-response";
import {
  generateSubscriptionNumber,
  generateInvoiceNumber,
} from "../../utils/code-generator";
import { SubscriptionStatus, InvoiceStatus, BillingFrequency, Prisma } from "@prisma/client";

export class PortalController {
  /**
   * Get comprehensive dashboard summary for logged-in customer
   */
  static async getSummary(req: Request, res: Response) {
    try {
      const user = req.user;
      if (!user) {
        return sendError(res, "Unauthorized", 401);
      }

      // Find Customer Profile
      let profile = null;
      if (user.customerProfileId) {
        profile = await prisma.customerProfile.findUnique({
          where: { id: user.customerProfileId },
          include: {
            user: true,
            subscriptions: {
              include: {
                plan: true,
                lines: {
                  include: {
                    product: true,
                  },
                },
              },
              orderBy: { createdAt: "desc" },
            },
            invoices: {
              include: {
                lines: true,
                allocations: true,
              },
              orderBy: { issueDate: "desc" },
            },
            payments: {
              include: {
                allocations: {
                  include: {
                    invoice: true,
                  },
                },
              },
              orderBy: { paidAt: "desc" },
            },
          },
        });
      }

      if (!profile) {
        profile = await prisma.customerProfile.findFirst({
          where: { userId: user.id },
          include: {
            user: true,
            subscriptions: {
              include: {
                plan: true,
                lines: {
                  include: {
                    product: true,
                  },
                },
              },
              orderBy: { createdAt: "desc" },
            },
            invoices: {
              include: {
                lines: true,
                allocations: true,
              },
              orderBy: { issueDate: "desc" },
            },
            payments: {
              include: {
                allocations: {
                  include: {
                    invoice: true,
                  },
                },
              },
              orderBy: { paidAt: "desc" },
            },
          },
        });
      }

      if (!profile) {
        return sendError(res, "Customer profile not found for this account", 404);
      }

      const activeSubs = profile.subscriptions.filter(
        (s) => s.status === SubscriptionStatus.ACTIVE
      );

      const nextRenewalSub = activeSubs[0];

      const invoices = profile.invoices.map((inv) => {
        const isOverdue =
          inv.status === InvoiceStatus.CONFIRMED &&
          new Date(inv.dueDate) < new Date();

        const paidAmt = inv.allocations.reduce(
          (sum, a) => sum + Number(a.allocatedAmount),
          0
        );
        const total = Number(inv.grandTotal);
        const outstanding = Math.max(0, total - paidAmt);

        return {
          id: inv.id,
          invoiceNumber: inv.invoiceNumber,
          issueDate: inv.issueDate.toISOString(),
          dueDate: inv.dueDate.toISOString(),
          totalAmount: total,
          paidAmount: paidAmt,
          outstandingAmount: outstanding,
          status: inv.status.toLowerCase(),
          isOverdue,
          lines: inv.lines.map((l) => ({
            id: l.id,
            description: l.descriptionSnapshot,
            quantity: Number(l.quantity),
            unitPrice: Number(l.unitPrice),
            amount: Number(l.lineTotal),
            taxRate: 0.18,
            taxAmount: Number(l.taxAmount),
          })),
        };
      });

      const outstandingInvoices = invoices.filter(
        (inv) => inv.outstandingAmount > 0 && inv.status !== "cancelled"
      );

      const totalOutstanding = outstandingInvoices.reduce(
        (acc, inv) => acc + inv.outstandingAmount,
        0
      );

      const payments = profile.payments.map((p) => ({
        id: p.id,
        paymentNumber: p.paymentNumber,
        invoiceNumber: p.allocations[0]?.invoice?.invoiceNumber || "-",
        amount: Number(p.amount),
        paymentDate: p.paidAt.toISOString(),
        paymentMethod: p.method,
        referenceNote: p.reference || p.note || "Portal recorded collection",
        status: "CONFIRMED" as const,
      }));

      const totalPaid = payments.reduce((acc, p) => acc + p.amount, 0);

      const formattedSubscriptions = profile.subscriptions.map((s) => ({
        id: s.id,
        subscriptionNumber: s.subscriptionNumber,
        planName: s.plan?.name || "Standard Plan",
        productName: s.lines[0]?.product?.name || "Brightloop Cloud Suite",
        status: s.status.toLowerCase(),
        quantity: Number(s.quantity || 1),
        billingInterval: s.billingFrequency,
        price: Number(s.lines[0]?.unitPrice || s.plan?.price || 0) * Number(s.quantity || 1),
        currency: "INR" as const,
        startDate: s.startAt.toISOString(),
        expiryDate: s.endAt?.toISOString() || "",
        nextBillingDate: s.nextBillingAt?.toISOString() || "",
      }));

      const summary = {
        profile: {
          id: profile.id,
          name: profile.displayName,
          email: user.email,
          companyName: profile.companyName || "",
          customerCode: profile.customerCode,
          phone: profile.phone || "",
          gstin: profile.taxIdentifier || "",
          city: profile.city || "",
          state: profile.state || "",
          billingAddress: {
            street: profile.billingAddressLine1 || "",
            city: profile.city || "",
            state: profile.state || "",
            pincode: profile.postalCode || "",
            country: profile.country || "India",
          },
        },
        activeSubscriptionsCount: activeSubs.length,
        nextRenewalDate: nextRenewalSub?.nextBillingAt?.toISOString() || null,
        nextRenewalPlan: nextRenewalSub?.plan?.name || null,
        totalOutstandingAmount: totalOutstanding,
        totalPaidAmount: totalPaid,
        paidInvoicesCount: invoices.filter((i) => i.status === "paid").length,
        subscriptions: formattedSubscriptions,
        recentInvoices: invoices.slice(0, 10),
        outstandingInvoices,
        payments: payments.slice(0, 10),
      };

      return sendSuccess(res, summary, "Portal summary fetched successfully");
    } catch (error: any) {
      console.error("Portal summary error:", error);
      return sendError(res, error.message || "Failed to load portal summary", 500);
    }
  }

  /**
   * Create a subscription directly from the customer portal
   */
  static async createSubscription(req: Request, res: Response) {
    try {
      const user = req.user;
      if (!user) {
        return sendError(res, "Unauthorized", 401);
      }

      let customerProfileId = user.customerProfileId;
      if (!customerProfileId) {
        const found = await prisma.customerProfile.findFirst({
          where: { userId: user.id },
        });
        if (found) customerProfileId = found.id;
      }

      if (!customerProfileId) {
        return sendError(res, "Customer profile required to subscribe", 400);
      }

      const { planId, productId, variantId, quantity = 1 } = req.body;

      if (!planId || !productId) {
        return sendError(res, "Plan ID and Product ID are required", 400);
      }

      // Fetch plan & product
      const plan = await prisma.subscriptionPlan.findUnique({
        where: { id: planId },
      });
      if (!plan) return sendError(res, "Plan not found", 404);

      const product = await prisma.product.findUnique({
        where: { id: productId },
      });
      if (!product) return sendError(res, "Product not found", 404);

      const unitPrice = Number(plan.price);
      const subtotal = unitPrice * Number(quantity);
      const taxRate = 0.18;
      const taxAmount = Math.round(subtotal * taxRate * 100) / 100;
      const grandTotal = subtotal + taxAmount;

      const startAt = new Date();
      const nextBillingAt = new Date();
      if (plan.billingFrequency === BillingFrequency.DAILY) {
        nextBillingAt.setDate(nextBillingAt.getDate() + 1);
      } else if (plan.billingFrequency === BillingFrequency.WEEKLY) {
        nextBillingAt.setDate(nextBillingAt.getDate() + 7);
      } else if (plan.billingFrequency === BillingFrequency.YEARLY) {
        nextBillingAt.setFullYear(nextBillingAt.getFullYear() + 1);
      } else {
        nextBillingAt.setMonth(nextBillingAt.getMonth() + 1);
      }

      const subscriptionNumber = generateSubscriptionNumber();
      const invoiceNumber = generateInvoiceNumber();

      const created = await prisma.$transaction(async (tx) => {
        const sub = await tx.subscription.create({
          data: {
            subscriptionNumber,
            customerId: customerProfileId!,
            planId: plan.id,
            status: SubscriptionStatus.ACTIVE,
            startAt,
            nextBillingAt,
            billingFrequency: plan.billingFrequency,
            intervalCount: 1,
            quantity,
            currency: "INR",
            createdById: user.id,
            lines: {
              create: {
                productId: product.id,
                planId: plan.id,
                descriptionSnapshot: `${product.name} - ${plan.name}`,
                quantity,
                unitPrice,
                variantSnapshot: variantId ? { variantId } : Prisma.JsonNull,
              },
            },
          },
          include: {
            plan: true,
            lines: { include: { product: true } },
          },
        });

        // Create the initial invoice
        await tx.invoice.create({
          data: {
            invoiceNumber,
            customerId: customerProfileId!,
            subscriptionId: sub.id,
            status: InvoiceStatus.CONFIRMED,
            issueDate: startAt,
            dueDate: new Date(startAt.getTime() + 15 * 86400000), // +15 days
            subtotal,
            taxTotal: taxAmount,
            grandTotal,
            currency: "INR",
            lines: {
              create: {
                productId: product.id,
                descriptionSnapshot: `${product.name} - ${plan.name}`,
                quantity,
                unitPrice,
                taxAmount,
                taxableAmount: subtotal,
                lineTotal: grandTotal,
              },
            },
          },
        });

        return sub;
      });

      return sendSuccess(res, created, "Subscription created successfully", 201);
    } catch (error: any) {
      console.error("Portal subscribe error:", error);
      return sendError(res, error.message || "Failed to create subscription", 500);
    }
  }
}
