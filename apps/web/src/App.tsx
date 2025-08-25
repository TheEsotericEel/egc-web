import React, { useMemo, useState } from "react";
import { compute, CalcInput } from "@egc/calc-core";

type LogEntry = {
  id: string;
  ts: number;
  gross: number;
  net: number;
  inputs: CalcInput;
};

export default function App() {
  // Calculator inputs
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
    provenance: "manual",
  });

  // Goal + progress
  const [grossGoal, setGrossGoal] = useState<number>(1000);
  const [entries, setEntries] = useState<LogEntry[]>([]);
  const grossProgress = useMemo(
    () => entries.reduce((sum, e) => sum + e.gross, 0),
    [entries]
  );
  const pct = grossGoal > 0 ? Math.min(100, (grossProgress / grossGoal) * 100) : 0;

  // Lock options
  const [lockFeesBetweenItems, setLockFeesBetweenItems] = useState<boolean>(true);

  // Live output
  const output = compute(inputs);

  // Helpers
  const num = (v: string) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
  };

  const handleChange = (field: keyof CalcInput, value: string) => {
    setInputs((prev: CalcInput) => ({ ...prev, [field]: num(value) }));
  };

  const clearForNextItem = () => {
    setInputs((prev) => {
      const cleared: CalcInput = {
        ...prev,
        // Clear per-item numeric fields
        itemPrice: 0,
        shippingCharged: 0,
        shippingCost: 0,
        cogs: 0,
        taxes: lockFeesBetweenItems ? prev.taxes : 0,
        adjustments: lockFeesBetweenItems ? prev.adjustments : 0,
        provenance: "manual",
      };

      if (!lockFeesBetweenItems) {
        cleared.ebayFeePct = 0.13;
        cleared.promotedPct = 0.0;
        cleared.paymentProcPct = 0.029;
        cleared.paymentProcFixed = 0.3;
        cleared.refundsPct = 0;
      }

      return cleared;
    });
  };

  const logItem = () => {
    // Do not log empty
    if (output.gross <= 0) return;

    const entry: LogEntry = {
      id: crypto.randomUUID(),
      ts: Date.now(),
      gross: output.gross,
      net: output.net,
      inputs,
    };

    setEntries((prev) => [entry, ...prev]);
    clearForNextItem();
  };

  const resetProgress = () => setEntries([]);

  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif", lineHeight: 1.3 }}>
      <h1>eBay Gross Calculator</h1>

      {/* Goal + Progress */}
      <section style={{ marginBottom: "1rem" }}>
        <h2 style={{ marginBottom: 8 }}>Gross Goal (manual)</h2>
        <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
          <label>
            Goal:{" "}
            <input
              type="number"
              step="1"
              value={grossGoal}
              onChange={(e) => setGrossGoal(num(e.target.value))}
            />
          </label>
          <div>
            Progress: ${grossProgress.toFixed(2)} / ${grossGoal.toFixed(2)}{" "}
            <strong>({pct.toFixed(1)}%)</strong>
          </div>
        </div>
        <div
          style={{
            marginTop: 8,
            width: 400,
            maxWidth: "100%",
            height: 10,
            background: "#eee",
            borderRadius: 6,
            overflow: "hidden",
          }}
          aria-label="Goal progress"
        >
          <div
            style={{
              width: `${pct}%`,
              height: "100%",
              background: "#4caf50",
              transition: "width 120ms linear",
            }}
          />
        </div>
      </section>

      {/* Inputs */}
      <section style={{ display: "grid", gap: "0.5rem", maxWidth: 360 }}>
        <h2 style={{ margin: "0.5rem 0" }}>Inputs</h2>

        <label>
          Item Price:
          <input
            type="number"
            value={inputs.itemPrice}
            onChange={(e) => handleChange("itemPrice", e.target.value)}
          />
        </label>

        <label>
          Shipping Charged:
          <input
            type="number"
            value={inputs.shippingCharged}
            onChange={(e) => handleChange("shippingCharged", e.target.value)}
          />
        </label>

        <label>
          Shipping Cost:
          <input
            type="number"
            value={inputs.shippingCost}
            onChange={(e) => handleChange("shippingCost", e.target.value)}
          />
        </label>

        <label>
          COGS:
          <input
            type="number"
            value={inputs.cogs}
            onChange={(e) => handleChange("cogs", e.target.value)}
          />
        </label>

        <label>
          eBay Fee % (decimal):
          <input
            type="number"
            step="0.001"
            value={inputs.ebayFeePct}
            onChange={(e) => handleChange("ebayFeePct", e.target.value)}
          />
        </label>

        <label>
          Promoted % (decimal):
          <input
            type="number"
            step="0.001"
            value={inputs.promotedPct}
            onChange={(e) => handleChange("promotedPct", e.target.value)}
          />
        </label>

        <label>
          Payment Proc % (decimal):
          <input
            type="number"
            step="0.001"
            value={inputs.paymentProcPct}
            onChange={(e) => handleChange("paymentProcPct", e.target.value)}
          />
        </label>

        <label>
          Payment Proc Fixed:
          <input
            type="number"
            step="0.01"
            value={inputs.paymentProcFixed}
            onChange={(e) => handleChange("paymentProcFixed", e.target.value)}
          />
        </label>

        <label>
          Refunds % (0–1):
          <input
            type="number"
            step="0.01"
            value={inputs.refundsPct}
            onChange={(e) => handleChange("refundsPct", e.target.value)}
          />
        </label>

        <label>
          Taxes:
          <input
            type="number"
            step="0.01"
            value={inputs.taxes}
            onChange={(e) => handleChange("taxes", e.target.value)}
          />
        </label>

        <label>
          Adjustments:
          <input
            type="number"
            step="0.01"
            value={inputs.adjustments}
            onChange={(e) => handleChange("adjustments", e.target.value)}
          />
        </label>

        <label style={{ marginTop: 8 }}>
          <input
            type="checkbox"
            checked={lockFeesBetweenItems}
            onChange={(e) => setLockFeesBetweenItems(e.target.checked)}
          />{" "}
          Keep fee settings between items
        </label>

        <div style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
          <button
            onClick={logItem}
            disabled={output.gross <= 0}
            title={output.gross <= 0 ? "Enter values first" : "Log this item toward goal"}
          >
            Log Item toward Gross Goal
          </button>
          <button onClick={resetProgress} title="Clear all logged items and progress">
            Reset Progress
          </button>
        </div>
      </section>

      {/* Live Results */}
      <section style={{ marginTop: "1rem" }}>
        <h2>Results</h2>
        <p>Gross: ${output.gross.toFixed(2)}</p>
        <p>Net: ${output.net.toFixed(2)}</p>
        <p>Margin: {(output.marginPct * 100).toFixed(1)}%</p>
      </section>

      {/* Recent Log */}
      <section style={{ marginTop: "1rem" }}>
        <h3>Recent Logged Items ({entries.length})</h3>
        <ul style={{ paddingLeft: 18 }}>
          {entries.slice(0, 5).map((e) => (
            <li key={e.id}>
              {new Date(e.ts).toLocaleTimeString()} — Gross ${e.gross.toFixed(2)} | Net $
              {e.net.toFixed(2)}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
