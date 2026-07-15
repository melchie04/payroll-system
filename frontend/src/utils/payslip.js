import { parseCurrency } from "./currency.js";

// Approximate Philippine payroll deduction rates, for display purposes only
// (this is a front-end prototype with no real payroll engine behind it).
// Accepts either a formatted string ("₱65,000.00") or a plain number.
export function computeDeductions(grossInput) {
  const gross = typeof grossInput === "number" ? grossInput : parseCurrency(grossInput);
  const sss = gross * 0.045;
  const philhealth = gross * 0.025;
  const pagibig = 200;
  const tax = gross * 0.08;
  const totalDeductions = sss + philhealth + pagibig + tax;
  return { gross, sss, philhealth, pagibig, tax, net: gross - totalDeductions };
}
