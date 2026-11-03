/**
 * Tax Calculator — Express Server
 * Cloud-Native Final Project
 */
const express = require("express");
const path = require("path");
const { calculateTax, calculateMonthlyTax, TAX_BRACKETS } = require("./tax");

const app = express();
const PORT = Number(process.env.PORT || 3000);

app.use(express.json());
app.use(express.static(path.join(__dirname, "..", "public")));

/* ── Health endpoint ─────────────────────────────────────────── */
app.get("/health", (_req, res) =>
  res.status(200).json({
    status: "ok",
    service: "tax-calculator",
    version: "1.0.0",
    uptime: Math.floor(process.uptime()),
  }),
);

/* ── API info ────────────────────────────────────────────────── */
app.get("/api", (_req, res) =>
  res.json({
    name: "Cloud Native Tax Calculator",
    version: "1.0.0",
    endpoints: [
      {
        method: "GET",
        path: "/health",
        description: "Application health check",
      },
      { method: "GET", path: "/api", description: "API information" },
      {
        method: "GET",
        path: "/api/tax/brackets",
        description: "List configured tax brackets",
      },
      {
        method: "POST",
        path: "/api/tax/calculate",
        description: "Calculate tax for a given annual income",
      },
    ],
  }),
);

/* ── Tax brackets info ───────────────────────────────────────── */
app.get("/api/tax/brackets", (_req, res) => {
  const brackets = TAX_BRACKETS.map((b, i) => ({
    bracket: i + 1,
    from: i === 0 ? 0 : TAX_BRACKETS[i - 1].upTo,
    upTo: b.upTo === Infinity ? null : b.upTo,
    rate: b.rate,
    rateLabel: `${(b.rate * 100).toFixed(0)}%`,
  }));
  res.json({
    brackets,
    note: "Illustrative brackets only. Not official tax advice.",
  });
});

/* ── Tax calculation ─────────────────────────────────────────── */
app.post("/api/tax/calculate", (req, res) => {
  const income = Number(req.body && req.body.annualIncome);

  if (!Number.isFinite(income) || income < 0) {
    return res.status(400).json({
      error: "annualIncome must be a non-negative finite number.",
    });
  }

  try {
    const annualTax = calculateTax(income);
    const monthlyTax = calculateMonthlyTax(income);

    return res.json({
      annualIncome: income,
      annualTax,
      monthlyTax,
      annualTakeHome: Math.round((income - annualTax) * 100) / 100,
      effectiveRate:
        income === 0 ? 0 : Math.round((annualTax / income) * 10000) / 100,
    });
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
});

/* ── 404 handler ─────────────────────────────────────────────── */
app.use((_req, res) => res.status(404).json({ error: "Not found." }));

/* ── Start server ────────────────────────────────────────────── */
if (require.main === module) {
  app.listen(PORT, "0.0.0.0", () =>
    console.log(`Tax Calculator listening on http://0.0.0.0:${PORT}`),
  );
}

module.exports = app;
