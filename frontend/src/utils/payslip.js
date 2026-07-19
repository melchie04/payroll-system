import { parseCurrency } from "./currency.js";

// Computes approximate PH payroll deductions (SSS, PhilHealth, Pag-IBIG, tax) from gross pay.
export function computeDeductions(grossInput) {
  const gross = typeof grossInput === "number" ? grossInput : parseCurrency(grossInput);
  const sss = gross * 0.045;
  const philhealth = gross * 0.025;
  const pagibig = 200;
  const tax = gross * 0.08;
  const totalDeductions = sss + philhealth + pagibig + tax;
  return { gross, sss, philhealth, pagibig, tax, net: gross - totalDeductions };
}
