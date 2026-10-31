import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import { prisma } from "./config/prisma";
import { errorHandler } from "./middlewares/error.middleware";

// Module routes
import authRoutes from "./modules/auth/auth.routes";
import customersRoutes from "./modules/customers/customers.routes";
import productsRoutes from "./modules/products/products.routes";
import plansRoutes from "./modules/plans/plans.routes";
import quotationsRoutes from "./modules/quotations/quotations.routes";
import subscriptionsRoutes from "./modules/subscriptions/subscriptions.routes";
import invoicesRoutes from "./modules/invoices/invoices.routes";
import paymentsRoutes from "./modules/payments/payments.routes";
import discountsRoutes from "./modules/discounts/discounts.routes";
import taxesRoutes from "./modules/taxes/taxes.routes";
import usersRoutes from "./modules/users/users.routes";
import analyticsRoutes from "./modules/analytics/analytics.routes";

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

app.get("/api/v1/health", async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({
      success: true,
      message: "Brightloop API is running",
      database: "connected",
    });
  } catch (error) {
    console.error("Database connection failed:", error);
    res.status(503).json({
      success: false,
      message: "Database connection failed",
      database: "disconnected",
    });
  }
});

// Domain routes for 2.1 & 2.2 features
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/customers", customersRoutes);
app.use("/api/v1/products", productsRoutes);
app.use("/api/v1/plans", plansRoutes);
app.use("/api/v1/quotations", quotationsRoutes);
app.use("/api/v1/subscriptions", subscriptionsRoutes);
app.use("/api/v1/invoices", invoicesRoutes);
app.use("/api/v1/payments", paymentsRoutes);
app.use("/api/v1/discounts", discountsRoutes);
app.use("/api/v1/taxes", taxesRoutes);
app.use("/api/v1/users", usersRoutes);
app.use("/api/v1/analytics", analyticsRoutes);

// Central error handler
app.use(errorHandler);

export default app;
