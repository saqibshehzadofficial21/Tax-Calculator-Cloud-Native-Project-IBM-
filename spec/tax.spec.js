const {
  calculateTax,
  calculateMonthlyTax,
  TAX_BRACKETS,
} = require("../src/tax");

describe("Tax Calculator", () => {
  it("returns zero tax for zero income", () => {
    expect(calculateTax(0)).toBe(0);
  });

  it("returns zero tax for income in the first illustrative bracket", () => {
    expect(calculateTax(500000)).toBe(0);
  });

  it("calculates tax progressively across brackets", () => {
    // 600,000 at 0%; next 600,000 at 5%; next 200,000 at 15%.
    expect(calculateTax(1400000)).toBe(60000);
  });

  it("calculates monthly tax from annual tax", () => {
    expect(calculateMonthlyTax(1400000)).toBe(5000);
  });

  it("rejects negative income", () => {
    expect(() => calculateTax(-1)).toThrowError(RangeError);
  });

  it("rejects non-numeric income", () => {
    expect(() => calculateTax("1000")).toThrowError(TypeError);
  });

  it("calculates correct tax at the exact upper boundary of the top bracket", () => {
    // Income = 3,200,000:
    //   0 – 600,000     = 600,000 × 0%   =       0
    //   600,001 – 1,200,000 = 600,000 × 5%   =  30,000
    //   1,200,001 – 2,200,000 = 1,000,000 × 15%  = 150,000
    //   2,200,001 – 3,200,000 = 1,000,000 × 25%  = 250,000
    //   Total = 430,000
    expect(calculateTax(3200000)).toBe(430000);
  });
});
