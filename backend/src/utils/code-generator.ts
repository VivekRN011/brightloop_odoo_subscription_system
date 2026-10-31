import crypto from "crypto";

export const generateCustomerCode = (): string => {
  const prefix = "CUST";
  const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const randomPart = crypto.randomBytes(3).toString("hex").toUpperCase();
  return `${prefix}-${datePart}-${randomPart}`;
};

export const generateQuotationNumber = (): string => {
  const year = new Date().getFullYear();
  const random = crypto.randomInt(1000, 9999);
  return `QUO-${year}-${random}`;
};

export const generateSubscriptionNumber = (): string => {
  const year = new Date().getFullYear();
  const random = crypto.randomInt(1000, 9999);
  return `SUB-${year}-${random}`;
};

export const generateInvoiceNumber = (): string => {
  const year = new Date().getFullYear();
  const random = crypto.randomInt(1000, 9999);
  return `INV-${year}-${random}`;
};

export const generatePaymentNumber = (): string => {
  const year = new Date().getFullYear();
  const random = crypto.randomInt(1000, 9999);
  return `PAY-${year}-${random}`;
};

export const generateRandomToken = (): string => {
  return crypto.randomBytes(32).toString("hex");
};

export const hashToken = (token: string): string => {
  return crypto.createHash("sha256").update(token).digest("hex");
};
