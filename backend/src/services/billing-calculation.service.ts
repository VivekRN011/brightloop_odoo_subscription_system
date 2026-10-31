import { Prisma } from "@prisma/client";
import { prisma } from "../config/prisma";

export interface CalculationLineInput {
  productId?: string | null;
  planId?: string | null;
  description: string;
  quantity: number | string;
  unitPrice: number | string;
  variantPriceAdjustment?: number | string;
  variantSnapshot?: any;
  taxRate?: number | string;
  discountAmount?: number | string;
}

export interface CalculationResultLine {
  productId?: string | null;
  planId?: string | null;
  descriptionSnapshot: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  discountAmount: number;
  taxableAmount: number;
  taxAmount: number;
  lineTotal: number;
  taxSnapshot: any;
  variantSnapshot: any;
}

export interface CalculationResult {
  lines: CalculationResultLine[];
  subtotal: number;
  discountTotal: number;
  taxTotal: number;
  grandTotal: number;
  isInterState: boolean;
  cgstTotal: number;
  sgstTotal: number;
  igstTotal: number;
}

/**
 * Standard business state for Brightloop (Kerala, India).
 * Intra-state: CGST (9%) + SGST (9%)
 * Inter-state: IGST (18%)
 */
const DEFAULT_BUSINESS_STATE = "Kerala";
const DEFAULT_GST_RATE = 18.0;

export class BillingCalculationService {
  /**
   * Deterministically resolves applicable tax rule.
   * If customer has a state specified, determines whether intra-state or inter-state.
   */
  static async resolveTaxRule(customerState?: string | null): Promise<{
    ruleCode: string;
    ruleName: string;
    rate: number;
    isInterState: boolean;
  }> {
    const isInterState =
      Boolean(customerState) &&
      customerState?.trim().toLowerCase() !== DEFAULT_BUSINESS_STATE.toLowerCase();

    // Query active TaxRule from database
    const taxRules = await prisma.taxRule.findMany({
      where: { isActive: true },
      orderBy: { rate: "desc" },
    });

    const standardRule =
      taxRules.find((r) => Number(r.rate) === 18 || Number(r.rate) === 0.18) || taxRules[0];
    let rate = standardRule ? Number(standardRule.rate) : DEFAULT_GST_RATE;
    // If rate was stored as decimal fraction (0.18), normalize to standard percentage (18.0)
    if (rate > 0 && rate <= 1) {
      rate = this.round(rate * 100);
    }

    return {
      ruleCode: standardRule?.code || "GST-18",
      ruleName: standardRule?.name || "Goods & Services Tax 18%",
      rate,
      isInterState,
    };
  }

  /**
   * Authoritatively computes line items, dual GST breakdown, discounts and grand totals
   * using decimal-safe rounding (to 2 decimal places).
   */
  static async calculateDocument(params: {
    lines: CalculationLineInput[];
    customerState?: string | null;
    documentDiscountAmount?: number;
  }): Promise<CalculationResult> {
    const { lines, customerState, documentDiscountAmount = 0 } = params;
    const taxInfo = await this.resolveTaxRule(customerState);

    let docSubtotal = 0;
    let docLineDiscounts = 0;
    let docTaxTotal = 0;
    let docCgstTotal = 0;
    let docSgstTotal = 0;
    let docIgstTotal = 0;

    const calculatedLines: CalculationResultLine[] = [];

    for (const line of lines) {
      const qty = Math.max(1, Number(line.quantity) || 1);
      const baseUnitPrice = Number(line.unitPrice) || 0;
      const variantAdj = Number(line.variantPriceAdjustment) || 0;
      const effectiveUnitPrice = this.round(baseUnitPrice + variantAdj);

      const lineSubtotal = this.round(qty * effectiveUnitPrice);
      const lineDiscount = this.round(Math.min(lineSubtotal, Number(line.discountAmount) || 0));
      const taxableAmount = this.round(Math.max(0, lineSubtotal - lineDiscount));

      let effectiveTaxRate = line.taxRate !== undefined ? Number(line.taxRate) : taxInfo.rate;
      if (effectiveTaxRate > 0 && effectiveTaxRate <= 1) {
        effectiveTaxRate = this.round(effectiveTaxRate * 100);
      }
      const taxAmount = this.round((taxableAmount * effectiveTaxRate) / 100);
      const lineTotal = this.round(taxableAmount + taxAmount);

      const cgst = taxInfo.isInterState ? 0 : this.round(taxAmount / 2);
      const sgst = taxInfo.isInterState ? 0 : this.round(taxAmount / 2);
      const igst = taxInfo.isInterState ? taxAmount : 0;

      docSubtotal += lineSubtotal;
      docLineDiscounts += lineDiscount;
      docTaxTotal += taxAmount;
      docCgstTotal += cgst;
      docSgstTotal += sgst;
      docIgstTotal += igst;

      calculatedLines.push({
        productId: line.productId || null,
        planId: line.planId || null,
        descriptionSnapshot: line.description,
        quantity: qty,
        unitPrice: effectiveUnitPrice,
        subtotal: lineSubtotal,
        discountAmount: lineDiscount,
        taxableAmount,
        taxAmount,
        lineTotal,
        taxSnapshot: {
          code: taxInfo.ruleCode,
          name: taxInfo.ruleName,
          rate: effectiveTaxRate,
          isInterState: taxInfo.isInterState,
          cgst,
          sgst,
          igst,
        },
        variantSnapshot: line.variantSnapshot ?? Prisma.JsonNull,
      });
    }

    const totalDiscount = this.round(docLineDiscounts + Number(documentDiscountAmount));
    const grandTotal = this.round(Math.max(0, docSubtotal - totalDiscount + docTaxTotal));

    return {
      lines: calculatedLines,
      subtotal: this.round(docSubtotal),
      discountTotal: this.round(totalDiscount),
      taxTotal: this.round(docTaxTotal),
      grandTotal,
      isInterState: taxInfo.isInterState,
      cgstTotal: this.round(docCgstTotal),
      sgstTotal: this.round(docSgstTotal),
      igstTotal: this.round(docIgstTotal),
    };
  }

  /**
   * Helper: round to standard 2 currency decimals
   */
  private static round(val: number): number {
    return Math.round((val + Number.EPSILON) * 100) / 100;
  }
}
