import { parseCurrency } from "./currency.js";
import { sheetTotals, resolveEmployee, resolveClient } from "../context/TimesheetContext.jsx";

// Money is rounded once, at the point it becomes an amount, so a total is always the
// sum of the figures shown beside it rather than a separately rounded number.
function money(value) {
  return Math.round(value * 100) / 100;
}

// approvedSheetsFor — the sheets that may be billed for a client and period. Only
// approved sheets count: anything still under review could still change.
export function approvedSheetsFor(files = [], client, periodLabel, clients = []) {
  if (!client?.code || !periodLabel) return [];
  return files.filter(
    (f) => f.status === "Approved" && f.period?.label === periodLabel && resolveClient(f, clients)?.code === client.code,
  );
}

// billableFor — what a client owes for one period, worked out from their approved
// sheets and the rates on their own record. Hours come from sheetTotals, the same
// arithmetic the review screen uses, so an invoice and a timesheet can never disagree.
export function billableFor({ files = [], client, periodLabel, roster = [], clients = [] }) {
  const sheets = approvedSheetsFor(files, client, periodLabel, clients);
  const rate = parseCurrency(client?.billingRate);
  const multiplier = Number(client?.overtimeMultiplier) || 1;

  const lines = sheets.map((file) => {
    const matched = resolveEmployee(file.employee, roster);
    const totals = sheetTotals(file.rows, matched?.schedule || null);
    const amount = money(totals.regular * rate + totals.overtime * rate * multiplier);
    return {
      sheetId: file.id,
      employee: matched?.name || file.employee?.name || "Unidentified",
      days: totals.days,
      regular: totals.regular,
      overtime: totals.overtime,
      amount,
    };
  });

  const regular = money(lines.reduce((sum, l) => sum + l.regular, 0));
  const overtime = money(lines.reduce((sum, l) => sum + l.overtime, 0));
  const total = money(lines.reduce((sum, l) => sum + l.amount, 0));

  return {
    // A rate of zero means the client record has no Billing Rate filled in, so the
    // figure below is not a real quote and the caller should say so rather than show ₱0.
    ready: rate > 0 && sheets.length > 0,
    reason: rate > 0 ? (sheets.length > 0 ? null : "No approved sheets for this period") : "This client has no billing rate set",
    sheetCount: sheets.length,
    rate,
    multiplier,
    regular,
    overtime,
    lines,
    total,
  };
}

// invoiceLines — the rows printed on an invoice. A calculated invoice keeps the
// per-employee breakdown it was built from; anything entered by hand falls back to a
// single service line so an older invoice still prints.
export function invoiceLines(invoice, clientName) {
  if (invoice?.lines?.length) {
    return invoice.lines.map((l) => ({
      description: l.employee,
      detail: `${l.days} day${l.days === 1 ? "" : "s"} · ${l.regular} regular hrs${l.overtime ? ` · ${l.overtime} OT hrs` : ""}`,
      amount: l.amount,
    }));
  }
  return [
    {
      description: `Staffing services — ${clientName}`,
      detail: invoice?.period || `${invoice?.invoiceDate || ""} to ${invoice?.dueDate || ""}`,
      amount: parseCurrency(invoice?.amount),
    },
  ];
}
