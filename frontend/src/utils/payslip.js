// Works out the statutory deductions on a payslip.

import { parseCurrency } from "./currency.js";

// Works out each statutory deduction and what is left as net pay.
export function computeDeductions(grossInput) {
  const gross = typeof grossInput === "number" ? grossInput : parseCurrency(grossInput);
  const sss = gross * 0.045;
  const philhealth = gross * 0.025;
  const pagibig = 200;
  const tax = gross * 0.08;
  const totalDeductions = sss + philhealth + pagibig + tax;
  return { gross, sss, philhealth, pagibig, tax, net: gross - totalDeductions };
}
