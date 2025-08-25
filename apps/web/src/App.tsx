import React, { useState } from 'react';
import { compute, CalcInput } from '@egc/calc-core';

export default function App() {
  const [inputs, setInputs] = useState<CalcInput>({
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
  });

  const output = compute(inputs);

  const handleChange = (field: keyof CalcInput, value: string) => {
    const num = Number(value);
    setInputs((prev: CalcInput) => ({ ...prev, [field]: isNaN(num) ? 0 : num }));
  };

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>eBay Gross Calculator</h1>

      <div style={{ display: 'grid', gap: '0.5rem', maxWidth: 320 }}>
        <label>
          Item Price:
          <input
            type="number"
            value={inputs.itemPrice}
            onChange={e => handleChange('itemPrice', e.target.value)}
          />
        </label>
        <label>
          Shipping Charged:
          <input
            type="number"
            value={inputs.shippingCharged}
            onChange={e => handleChange('shippingCharged', e.target.value)}
          />
        </label>
        <label>
          Shipping Cost:
          <input
            type="number"
            value={inputs.shippingCost}
            onChange={e => handleChange('shippingCost', e.target.value)}
          />
        </label>
        <label>
          COGS:
          <input
            type="number"
            value={inputs.cogs}
            onChange={e => handleChange('cogs', e.target.value)}
          />
        </label>
        <label>
          eBay Fee % (decimal):
          <input
            type="number"
            step="0.01"
            value={inputs.ebayFeePct}
            onChange={e => handleChange('ebayFeePct', e.target.value)}
          />
        </label>
        <label>
          Promoted % (decimal):
          <input
            type="number"
            step="0.01"
            value={inputs.promotedPct}
            onChange={e => handleChange('promotedPct', e.target.value)}
          />
        </label>
        <label>
          Payment Proc % (decimal):
          <input
            type="number"
            step="0.01"
            value={inputs.paymentProcPct}
            onChange={e => handleChange('paymentProcPct', e.target.value)}
          />
        </label>
        <label>
          Payment Proc Fixed:
          <input
            type="number"
            step="0.01"
            value={inputs.paymentProcFixed}
            onChange={e => handleChange('paymentProcFixed', e.target.value)}
          />
        </label>
        <label>
          Refunds % (0–1):
          <input
            type="number"
            step="0.01"
            value={inputs.refundsPct}
            onChange={e => handleChange('refundsPct', e.target.value)}
          />
        </label>
        <label>
          Taxes:
          <input
            type="number"
            step="0.01"
            value={inputs.taxes}
            onChange={e => handleChange('taxes', e.target.value)}
          />
        </label>
        <label>
          Adjustments:
          <input
            type="number"
            step="0.01"
            value={inputs.adjustments}
            onChange={e => handleChange('adjustments', e.target.value)}
          />
        </label>
      </div>

      <hr style={{ margin: '1rem 0' }} />

      <h2>Results</h2>
      <p>Gross: ${output.gross.toFixed(2)}</p>
      <p>Net: ${output.net.toFixed(2)}</p>
      <p>Margin: {(output.marginPct * 100).toFixed(1)}%</p>
    </div>
  );
}
