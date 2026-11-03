/**
 * Demonstration progressive tax calculator.
 * IMPORTANT: These brackets are illustrative test data, NOT official tax advice.
 * Replace TAX_BRACKETS with the rates and thresholds required by your assignment/jurisdiction.
 */
const TAX_BRACKETS = [
  { upTo: 600000, rate: 0.00 },
  { upTo: 1200000, rate: 0.05 },
  { upTo: 2200000, rate: 0.15 },
  { upTo: 3200000, rate: 0.25 },
  { upTo: Infinity, rate: 0.30 }
];

function calculateTax(annualIncome, brackets = TAX_BRACKETS) {
  if (typeof annualIncome !== 'number' || !Number.isFinite(annualIncome)) {
    throw new TypeError('Annual income must be a finite number.');
  }
  if (annualIncome < 0) throw new RangeError('Annual income cannot be negative.');
  if (!Array.isArray(brackets) || brackets.length === 0) {
    throw new TypeError('At least one tax bracket is required.');
  }

  let remaining = annualIncome;
  let previousLimit = 0;
  let totalTax = 0;

  for (const bracket of brackets) {
    if (typeof bracket.upTo !== 'number' || bracket.upTo <= previousLimit ||
        typeof bracket.rate !== 'number' || bracket.rate < 0 || bracket.rate > 1) {
      throw new TypeError('Tax brackets must have increasing limits and rates between 0 and 1.');
    }
    const taxableInBracket = Math.max(0, Math.min(remaining, bracket.upTo - previousLimit));
    totalTax += taxableInBracket * bracket.rate;
    remaining -= taxableInBracket;
    previousLimit = bracket.upTo;
    if (remaining <= 0) break;
  }
  if (remaining > 0) {
    const last = brackets[brackets.length - 1];
    if (last.upTo !== Infinity) throw new RangeError('Tax brackets do not cover the supplied income.');
  }
  return Math.round(totalTax * 100) / 100;
}

function calculateMonthlyTax(annualIncome, brackets = TAX_BRACKETS) {
  return Math.round((calculateTax(annualIncome, brackets) / 12) * 100) / 100;
}

module.exports = { TAX_BRACKETS, calculateTax, calculateMonthlyTax };
