// Works out what a client should be billed for a period.

import { parseCurrency } from "./currency.js";
import { sheetTotals, resolveEmployee, resolveClient } from "../context/TimesheetContext.jsx";

// Rounds a figure to two decimal places.
function money(value) {
  return Math.round(value * 100) / 100;
}

// Picks out the approved sheets belonging to one client and period.
export function approvedSheetsFor(files = [], client, periodLabel, clients = []) {
  if (!client?.code || !periodLabel) return [];
  return files.filter((f) => f.status === "Approved" && f.period?.label === periodLabel && resolveClient(f, clients)?.code === client.code);
}

// Totals the hours and amount a client owes for a period.
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

// Turns each employee's approved hours into a line on the invoice.
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
