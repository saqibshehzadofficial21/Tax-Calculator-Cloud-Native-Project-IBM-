/**
 * TaxCalc Pro — Frontend Application
 * Cloud-Native Tax Calculator
 */

/* ── Utility: number formatter ─────────────────────────────── */
const formatMoney = (value) =>
  new Intl.NumberFormat(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);

/* ── Utility: animated counter ─────────────────────────────── */
function animateValue(element, targetValue, formatter, duration = 500) {
  const start = performance.now();
  const startVal = 0;

  function tick(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const ease = 1 - Math.pow(1 - progress, 3); // ease-out-cubic
    const current = startVal + (targetValue - startVal) * ease;
    element.textContent = formatter(current);
    if (progress < 1) requestAnimationFrame(tick);
  }

  requestAnimationFrame(tick);
}

/* ── DOM refs ───────────────────────────────────────────────── */
const form = document.getElementById("tax-form");
const incomeInput = document.getElementById("income");
const incomeError = document.getElementById("income-error");
const globalError = document.getElementById("global-error");
const globalErrorText = document.getElementById("global-error-text");
const btnCalculate = document.getElementById("btn-calculate");
const btnReset = document.getElementById("btn-reset");
const btnText = btnCalculate.querySelector(".btn-text");
const btnLoading = btnCalculate.querySelector(".btn-loading");
const resultsPanel = document.getElementById("results-panel");
const incomeLabelEl = document.getElementById("results-income-label");
const annualTaxEl = document.getElementById("annual-tax");
const monthlyTaxEl = document.getElementById("monthly-tax");
const takeHomeEl = document.getElementById("take-home");
const effectiveRateEl = document.getElementById("effective-rate");
const breakdownBody = document.getElementById("breakdown-body");
const breakdownTotal = document.getElementById("breakdown-total");
const distTaxSeg = document.getElementById("dist-tax-seg");
const distTakehomeSeg = document.getElementById("dist-takehome-seg");
const healthDot = document.querySelector(".health-dot");
const healthLabel = document.querySelector(".health-label");

/* ── Tax bracket labels (must match src/tax.js TAX_BRACKETS) ─ */
const BRACKET_LABELS = [
  { from: 0, to: 600000, label: "0 – 600,000", rate: 0.0 },
  { from: 600000, to: 1200000, label: "600,001 – 1,200,000", rate: 0.05 },
  { from: 1200000, to: 2200000, label: "1,200,001 – 2,200,000", rate: 0.15 },
  { from: 2200000, to: 3200000, label: "2,200,001 – 3,200,000", rate: 0.25 },
  { from: 3200000, to: Infinity, label: "3,200,001+", rate: 0.3 },
];

/* ── Health check on load ───────────────────────────────────── */
async function checkHealth() {
  try {
    const resp = await fetch("/health");
    if (resp.ok) {
      healthDot.classList.add("healthy");
      healthLabel.title = "API is healthy";
    } else {
      throw new Error("not ok");
    }
  } catch {
    healthDot.classList.add("unhealthy");
    healthLabel.title = "API is not responding";
  }
}

checkHealth();

/* ── Validate income field inline ───────────────────────────── */
function validateIncomeField() {
  const raw = incomeInput.value.trim();
  if (raw === "") {
    setFieldError("Please enter your annual income.");
    return null;
  }
  const val = Number(raw);
  if (!Number.isFinite(val) || val < 0) {
    setFieldError("Income must be a non-negative number.");
    return null;
  }
  if (val > 999_999_999) {
    setFieldError("Income exceeds the maximum supported amount (999,999,999).");
    return null;
  }
  clearFieldError();
  return val;
}

function setFieldError(msg) {
  incomeError.textContent = msg;
  incomeInput.classList.add("error-state");
  incomeInput.setAttribute("aria-invalid", "true");
}

function clearFieldError() {
  incomeError.textContent = "";
  incomeInput.classList.remove("error-state");
  incomeInput.removeAttribute("aria-invalid");
}

function showGlobalError(msg) {
  globalErrorText.textContent = msg;
  globalError.hidden = false;
}

function clearGlobalError() {
  globalError.hidden = true;
  globalErrorText.textContent = "";
}

/* ── Set loading state ──────────────────────────────────────── */
function setLoading(state) {
  btnCalculate.disabled = state;
  btnText.hidden = state;
  btnLoading.hidden = !state;
}

/* ── Build bracket breakdown table ─────────────────────────── */
function buildBreakdown(income, annualTax) {
  breakdownBody.innerHTML = "";
  let remaining = income;
  let prev = 0;
  let runningTax = 0;

  BRACKET_LABELS.forEach((b) => {
    const bracketWidth = b.to === Infinity ? remaining : b.to - b.from;
    const taxable = Math.max(0, Math.min(remaining, bracketWidth));
    const tax = Math.round(taxable * b.rate * 100) / 100;
    runningTax += tax;
    remaining -= taxable;

    const tr = document.createElement("tr");
    const isActive = taxable > 0;
    tr.className = isActive
      ? tax > 0
        ? "bracket-active"
        : ""
      : "bracket-zero";

    tr.innerHTML = `
      <td>${b.label}</td>
      <td>${isActive ? formatMoney(taxable) : "—"}</td>
      <td>${(b.rate * 100).toFixed(0)}%</td>
      <td>${isActive && tax > 0 ? formatMoney(tax) : isActive ? "0.00" : "—"}</td>
    `;
    breakdownBody.appendChild(tr);
    prev = b.to;
    if (remaining <= 0) remaining = 0;
  });

  breakdownTotal.textContent = formatMoney(annualTax);
}

/* ── Update distribution bar ────────────────────────────────── */
function updateDistribution(income, annualTax) {
  if (income === 0) {
    distTaxSeg.style.width = "0%";
    distTakehomeSeg.style.width = "100%";
    return;
  }
  const taxPct = Math.min(100, (annualTax / income) * 100);
  distTaxSeg.style.width = `${taxPct.toFixed(2)}%`;
  distTakehomeSeg.style.width = `${(100 - taxPct).toFixed(2)}%`;
}

/* ── Render results ─────────────────────────────────────────── */
function renderResults(income, data) {
  incomeLabelEl.textContent = `Income: ${formatMoney(income)}`;

  // Animate KPI values
  animateValue(annualTaxEl, data.annualTax, formatMoney);
  animateValue(monthlyTaxEl, data.monthlyTax, formatMoney);
  animateValue(takeHomeEl, data.annualTakeHome, formatMoney);

  effectiveRateEl.textContent = `${data.effectiveRate}%`;

  buildBreakdown(income, data.annualTax);
  updateDistribution(income, data.annualTax);

  resultsPanel.hidden = false;
  btnReset.hidden = false;

  // Smooth scroll to results
  setTimeout(() => {
    resultsPanel.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, 100);
}

/* ── Main submit handler ────────────────────────────────────── */
form.addEventListener("submit", async (event) => {
  event.preventDefault();
  clearGlobalError();

  const income = validateIncomeField();
  if (income === null) {
    incomeInput.focus();
    return;
  }

  setLoading(true);

  try {
    const response = await fetch("/api/tax/calculate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ annualIncome: income }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.error || "The server returned an error. Please try again.",
      );
    }

    renderResults(income, data);
  } catch (err) {
    // Network error or server error
    if (err instanceof TypeError && err.message.includes("fetch")) {
      showGlobalError(
        "Unable to reach the API. Please ensure the server is running and try again.",
      );
    } else {
      showGlobalError(
        err.message || "An unexpected error occurred. Please try again.",
      );
    }
    resultsPanel.hidden = true;
  } finally {
    setLoading(false);
  }
});

/* ── Reset handler ──────────────────────────────────────────── */
btnReset.addEventListener("click", () => {
  form.reset();
  clearFieldError();
  clearGlobalError();
  resultsPanel.hidden = true;
  btnReset.hidden = true;
  incomeInput.focus();
});

/* ── Live field validation on blur ─────────────────────────── */
incomeInput.addEventListener("blur", () => {
  if (incomeInput.value.trim() !== "") {
    validateIncomeField();
  }
});

/* ── Clear field error on input ─────────────────────────────── */
incomeInput.addEventListener("input", () => {
  if (incomeInput.classList.contains("error-state")) {
    clearFieldError();
  }
});
