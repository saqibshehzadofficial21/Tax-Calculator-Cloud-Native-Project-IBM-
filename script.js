/**
 * script.js
 * Frontend interaction script for the Cloud-Native Tax Calculator.
 * Works with the static Nginx deployment (no backend required).
 */

const TAX_BRACKETS = [
  { from: 0,       upTo: 600000,   rate: 0.00 },
  { from: 600000,  upTo: 1200000,  rate: 0.05 },
  { from: 1200000, upTo: 2200000,  rate: 0.15 },
  { from: 2200000, upTo: 3200000,  rate: 0.25 },
  { from: 3200000, upTo: Infinity, rate: 0.30 }
];

function computeTax(income) {
  let remaining = income;
  let prev = 0;
  let total = 0;
  for (const b of TAX_BRACKETS) {
    const taxable = Math.max(0, Math.min(remaining, b.upTo - prev));
    total += taxable * b.rate;
    remaining -= taxable;
    prev = b.upTo;
    if (remaining <= 0) break;
  }
  return Math.round(total * 100) / 100;
}

function fmt(n) {
  return new Intl.NumberFormat(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);
}

function validateIncome(value) {
  if (value === '' || value === null) return { valid: false, error: 'Please enter your annual income.' };
  const n = Number(value);
  if (!Number.isFinite(n))           return { valid: false, error: 'Income must be a valid number.' };
  if (n < 0)                         return { valid: false, error: 'Income cannot be negative.' };
  if (n > 999999999)                 return { valid: false, error: 'Income exceeds maximum (999,999,999).' };
  return { valid: true, value: n };
}

document.addEventListener('DOMContentLoaded', function () {
  const form       = document.getElementById('tax-form');
  const incomeEl   = document.getElementById('income');
  const errorEl    = document.getElementById('error-msg');
  const resultsEl  = document.getElementById('results');
  const btnCalc    = document.getElementById('btn-calculate');
  const btnReset   = document.getElementById('btn-reset');

  function showError(msg) {
    errorEl.textContent = msg;
    errorEl.hidden = false;
    incomeEl.setAttribute('aria-invalid', 'true');
    incomeEl.classList.add('is-invalid');
  }

  function clearError() {
    errorEl.hidden = true;
    errorEl.textContent = '';
    incomeEl.removeAttribute('aria-invalid');
    incomeEl.classList.remove('is-invalid');
  }

  function showResults(income) {
    const annualTax   = computeTax(income);
    const monthlyTax  = Math.round((annualTax / 12) * 100) / 100;
    const takeHome    = Math.round((income - annualTax) * 100) / 100;
    const effectiveRate = income === 0 ? 0 : Math.round((annualTax / income) * 10000) / 100;

    document.getElementById('res-annual-tax').textContent   = fmt(annualTax);
    document.getElementById('res-monthly-tax').textContent  = fmt(monthlyTax);
    document.getElementById('res-take-home').textContent    = fmt(takeHome);
    document.getElementById('res-effective').textContent    = effectiveRate + '%';
    document.getElementById('res-income').textContent       = fmt(income);

    buildBreakdown(income, annualTax);
    updateBar(income, annualTax);

    resultsEl.hidden = false;
    if (btnReset) btnReset.hidden = false;
    resultsEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function buildBreakdown(income, annualTax) {
    const tbody = document.getElementById('breakdown-body');
    if (!tbody) return;
    tbody.innerHTML = '';
    let remaining = income;
    let prev = 0;
    TAX_BRACKETS.forEach(function (b) {
      const width   = b.upTo === Infinity ? remaining : b.upTo - prev;
      const taxable = Math.max(0, Math.min(remaining, width));
      const tax     = Math.round(taxable * b.rate * 100) / 100;
      const label   = b.upTo === Infinity
        ? fmt(prev + 1) + '+'
        : fmt(prev + (prev === 0 ? 0 : 1)) + ' – ' + fmt(b.upTo);
      const tr = document.createElement('tr');
      tr.innerHTML =
        '<td>' + label + '</td>' +
        '<td class="num">' + (taxable > 0 ? fmt(taxable) : '—') + '</td>' +
        '<td class="num">' + (b.rate * 100).toFixed(0) + '%</td>' +
        '<td class="num">' + (taxable > 0 ? fmt(tax) : '—') + '</td>';
      if (taxable > 0) tr.classList.add(tax > 0 ? 'row-active' : 'row-zero-rate');
      tbody.appendChild(tr);
      remaining -= taxable;
      prev = b.upTo;
      if (remaining < 0) remaining = 0;
    });
    const tfoot = document.getElementById('breakdown-total');
    if (tfoot) tfoot.textContent = fmt(annualTax);
  }

  function updateBar(income, annualTax) {
    const taxSeg  = document.getElementById('bar-tax');
    const homeSeg = document.getElementById('bar-home');
    if (!taxSeg || !homeSeg) return;
    const pct = income > 0 ? (annualTax / income) * 100 : 0;
    taxSeg.style.width  = pct.toFixed(2) + '%';
    homeSeg.style.width = (100 - pct).toFixed(2) + '%';
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    clearError();
    const check = validateIncome(incomeEl.value.trim());
    if (!check.valid) {
      showError(check.error);
      incomeEl.focus();
      return;
    }
    showResults(check.value);
  });

  incomeEl.addEventListener('input', function () {
    if (incomeEl.classList.contains('is-invalid')) clearError();
  });

  if (btnReset) {
    btnReset.addEventListener('click', function () {
      form.reset();
      clearError();
      resultsEl.hidden = true;
      btnReset.hidden = true;
      incomeEl.focus();
    });
  }
});
