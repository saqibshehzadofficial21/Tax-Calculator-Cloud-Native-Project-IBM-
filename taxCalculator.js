/**
 * taxCalculator.js
 * Core tax calculation logic for the Cloud-Native Tax Calculator.
 * Illustrative progressive brackets — not official tax advice.
 */

const TAX_BRACKETS = [
  { upTo: 600000,   rate: 0.00 },
  { upTo: 1200000,  rate: 0.05 },
  { upTo: 2200000,  rate: 0.15 },
  { upTo: 3200000,  rate: 0.25 },
  { upTo: Infinity, rate: 0.30 }
];

function calculateTax(annualIncome) {
  if (typeof annualIncome !== 'number' || !Number.isFinite(annualIncome)) {
    throw new TypeError('Annual income must be a finite number.');
  }
  if (annualIncome < 0) {
    throw new RangeError('Annual income cannot be negative.');
  }

  let remaining = annualIncome;
  let previousLimit = 0;
  let totalTax = 0;

  for (const bracket of TAX_BRACKETS) {
    const taxableInBracket = Math.max(0, Math.min(remaining, bracket.upTo - previousLimit));
    totalTax += taxableInBracket * bracket.rate;
    remaining -= taxableInBracket;
    previousLimit = bracket.upTo;
    if (remaining <= 0) break;
  }

  return Math.round(totalTax * 100) / 100;
}

function calculateMonthlyTax(annualIncome) {
  return Math.round((calculateTax(annualIncome) / 12) * 100) / 100;
}

function calculateTakeHome(annualIncome) {
  const tax = calculateTax(annualIncome);
  return Math.round((annualIncome - tax) * 100) / 100;
}

function calculateEffectiveRate(annualIncome) {
  if (annualIncome === 0) return 0;
  return Math.round((calculateTax(annualIncome) / annualIncome) * 10000) / 100;
}
