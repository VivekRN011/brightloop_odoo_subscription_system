import crypto from "crypto";

export const generateCustomerCode = (): string => {
  const prefix = "CUST";
  const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const randomPart = crypto.randomBytes(3).toString("hex").toUpperCase();
  return `${prefix}-${datePart}-${randomPart}`;
};

export const generateRandomToken = (): string => {
  return crypto.randomBytes(32).toString("hex");
};

export const hashToken = (token: string): string => {
  return crypto.createHash("sha256").update(token).digest("hex");
};

