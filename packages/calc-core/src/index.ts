// /packages/calc-core/src/index.ts
import { z } from 'zod';

/**
 * Centralized rounding: money to 2 decimals using bankers rounding avoidance.
 */
export const round2 = (n: number): number => Math.round((n + Number.EPSILON) * 100) / 100;

export const CalcInputSchema = z.object({
  // Prices
  itemPrice: z.number().nonnegative().default(0), // sale price of the item (excluding tax)
  shippingCharged: z.number().nonnegative().default(0), // what buyer paid you for shipping
  // Costs
  shippingCost: z.number().nonnegative().default(0), // your label cost
  cogs: z.number().nonnegative().default(0), // cost of goods sold
  // Fees (as decimal proportions unless noted)
  ebayFeePct: z.number().min(0).default(0), // e.g., 0.131 for 13.1%
  promotedPct: z.number().min(0).default(0), // e.g., 0.05 for 5%
  paymentProcPct: z.number().min(0).default(0), // e.g., 0.029 for 2.9%
  paymentProcFixed: z.number().min(0).default(0), // e.g., 0.30 per order
  // Other adjustments
  refundsPct: z.number().min(0).max(1).default(0), // fraction of gross refunded
  taxes: z.number().default(0), // positive if it reduces what you keep (treat pass-through as 0)
  adjustments: z.number().default(0), // catch-all debits(+) or credits(-)
  // Provenance tagging for UI traceability
  provenance: z.enum(['manual', 'csv', 'scenario']).default('manual')
});

export type CalcInput = z.infer<typeof CalcInputSchema>;

export const FeeBreakdownSchema = z.object({
  ebayFee: z.number(),
  promotedFee: z.number(),
  paymentProcessingFee: z.number(),
  refunds: z.number(),
});

export type FeeBreakdown = z.infer<typeof FeeBreakdownSchema>;

export const CalcOutputSchema = z.object({
  gross: z.number(), // itemPrice + shippingCharged
  fees: FeeBreakdownSchema,
  shippingCost: z.number(),
  cogs: z.number(),
  taxes: z.number(),
  adjustments: z.number(),
  net: z.number(),
  marginPct: z.number(), // net / gross (0 if gross=0)
  asp: z.number(), // average selling price; for single calc equals itemPrice
  waterfall: z.array(
    z.object({
      label: z.string(),
      delta: z.number(), // signed change applied at this step
      runningTotal: z.number()
    })
  )
});

export type CalcOutput = z.infer<typeof CalcOutputSchema>;

/**
 * Deterministic calculator.
 * No I/O, no globals. All calculations are explicit and rounded at the final step.
 */
export function compute(raw: CalcInput): CalcOutput {
  const input = CalcInputSchema.parse(raw);

  const gross = round2(input.itemPrice + input.shippingCharged);

  // Refunds modeled as a percentage of gross
  const refunds = round2(gross * input.refundsPct);

  // Fee bases use gross less refunds by default (conservative). Adjust if policy differs.
  const feeBase = Math.max(0, gross - refunds);

  const ebayFee = round2(feeBase * input.ebayFeePct);
  const promotedFee = round2(feeBase * input.promotedPct);
  const paymentProcessingFee = round2(feeBase * input.paymentProcPct + input.paymentProcFixed);

  const fees: FeeBreakdown = {
    ebayFee,
    promotedFee,
    paymentProcessingFee,
    refunds
  };

  // Net calculation
  const netRaw =
    gross -
    input.cogs -
    input.shippingCost -
    fees.ebayFee -
    fees.promotedFee -
    fees.paymentProcessingFee -
    fees.refunds -
    input.taxes -
    input.adjustments;

  const net = round2(netRaw);
  const marginPct = gross > 0 ? round2(net / gross) : 0;
  const asp = round2(input.itemPrice);

  // Waterfall sequence for UI charting and transparency
  let running = gross;
  const step = (label: string, delta: number) => {
    running = round2(running + delta);
    return { label, delta: round2(delta), runningTotal: running };
  };

  const waterfall = [
    { label: 'Gross', delta: 0, runningTotal: running },
    step('COGS', -input.cogs),
    step('Shipping Cost', -input.shippingCost),
    step('eBay Fee', -fees.ebayFee),
    step('Promoted Fee', -fees.promotedFee),
    step('Payment Processing', -fees.paymentProcessingFee),
    step('Refunds', -fees.refunds),
    step('Taxes', -input.taxes),
    step('Adjustments', -input.adjustments),
    { label: 'Net', delta: 0, runningTotal: net }
  ];

  return CalcOutputSchema.parse({
    gross,
    fees,
    shippingCost: round2(input.shippingCost),
    cogs: round2(input.cogs),
    taxes: round2(input.taxes),
    adjustments: round2(input.adjustments),
    net,
    marginPct,
    asp,
    waterfall
  });
}

/**
 * Convenience scenario delta helper. Produces a new input object with selective overrides
 * while preserving provenance tags for auditing in the UI layer.
 */
export function withOverrides(base: CalcInput, overrides: Partial<CalcInput>): CalcInput {
  const merged = { ...base, ...overrides };
  return CalcInputSchema.parse(merged);
}

export default { compute, withOverrides, round2 };
