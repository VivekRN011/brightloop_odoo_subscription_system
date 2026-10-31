import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { prisma } from "./config/prisma";

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  })
);
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

export default app;

