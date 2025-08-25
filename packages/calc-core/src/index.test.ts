import { describe, it, expect } from 'vitest';
import { compute, withOverrides, CalcInput } from './index';

const base: CalcInput = {
  itemPrice: 100,
  shippingCharged: 10,
  shippingCost: 5,
  cogs: 20,
  ebayFeePct: 0.13,
  promotedPct: 0.05,
  paymentProcPct: 0.029,
  paymentProcFixed: 0.3,
  refundsPct: 0,
  taxes: 0,
  adjustments: 0,
  provenance: 'manual'
};

describe('compute()', () => {
  it('basic case produces expected net and margin', () => {
    const out = compute(base);
    expect(out.gross).toBe(110);
    expect(out.net).toBeTypeOf('number');
    expect(out.marginPct).toBeGreaterThan(0);
  });

  it('handles refunds correctly', () => {
    const withRefund = withOverrides(base, { refundsPct: 0.1 });
    const out = compute(withRefund);
    expect(out.fees.refunds).toBeGreaterThan(0);
    expect(out.net).toBeLessThan(compute(base).net);
  });

  it('handles zero gross safely', () => {
    const out = compute({ ...base, itemPrice: 0, shippingCharged: 0 });
    expect(out.gross).toBe(0);
    expect(out.marginPct).toBe(0);
  });
});
