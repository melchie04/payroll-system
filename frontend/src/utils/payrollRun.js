import { parseCurrency } from "./currency.js";
import { sheetTotals, resolveEmployee, resolveClient } from "../context/TimesheetContext.jsx";

// A pay period can straddle the 15th, so it is fed by more than one sheet and never by
// a whole one. Days are therefore counted individually rather than by taking a sheet's
// own total, which would pull in days that belong to the period either side.
function withinPeriod(dayRow, from, to) {
  const when = Date.parse(dayRow?.date);
  return Number.isFinite(when) && when >= from && when <= to;
}

function money(value) {
  return Math.round(value * 100) / 100;
}

// rowKey — one payroll line is one person in one pay period, so overrides such as a
// corrected hour count or a Paid mark survive a re-read of the timesheets.
export function rowKey(periodLabel, employeeId) {
  return `${periodLabel}|${employeeId}`;
}

// hoursForEmployee — the hours an employee actually worked inside a pay period,
// re-added from the approved sheets covering it. Sheets still under review are
// ignored: nothing unapproved may reach a payslip.
export function hoursForEmployee(employee, period, files = [], roster = []) {
  const from = Date.parse(period?.from);
  const to = Date.parse(period?.to);
  if (!Number.isFinite(from) || !Number.isFinite(to)) return { regular: 0, overtime: 0, days: 0, sheets: 0 };

  let regular = 0;
  let overtime = 0;
  let days = 0;
  let sheets = 0;

  files.forEach((file) => {
    if (file.status !== "Approved") return;
    if (resolveEmployee(file.employee, roster)?.id !== employee.id) return;
    const inPeriod = (file.rows || []).filter((r) => withinPeriod(r, from, to));
    if (inPeriod.length === 0) return;
    const totals = sheetTotals(inPeriod, employee.schedule || null);
    regular += totals.regular;
    overtime += totals.overtime;
    days += totals.days;
    sheets += 1;
  });

  return { regular: money(regular), overtime: money(overtime), days, sheets };
}

// buildPayrollRows — the payroll run for one period: every deployed employee, with the
// hours their approved sheets support. Someone with no approved sheet still appears,
// as Pending, because a missing person is the thing a payroll clerk most needs to see.
export function buildPayrollRows({ period, employees = [], files = [], clients = [], overrides = {} }) {
  return employees
    .filter((e) => e.status !== "Inactive")
    .map((employee) => {
      const worked = hoursForEmployee(employee, period, files, employees);
      const override = overrides[rowKey(period?.label, employee.id)] || {};
      const hours = override.hours != null ? Number(override.hours) : money(worked.regular + worked.overtime);
      const rate = parseCurrency(employee.rate);
      const client = clients.find((c) => c.code === employee.client);

      // Ready means the paperwork is in. Pending means it is not, whatever the hours say.
      const derived = worked.sheets > 0 ? "Ready" : "Pending";

      return {
        id: employee.id,
        key: rowKey(period?.label, employee.id),
        employeeId: employee.id,
        code: employee.code,
        name: employee.name,
        position: employee.position,
        clientCode: employee.client,
        client: client?.name || employee.client || "—",
        period: period?.label || "",
        sheets: worked.sheets,
        days: worked.days,
        regular: worked.regular,
        overtime: worked.overtime,
        hours,
        edited: override.hours != null,
        rate,
        gross: money(hours * rate),
        status: override.status || derived,
      };
    });
}

// sheetsForEmployee — the approved sheets behind one payroll line, so a payslip can
// show its workings and link back to the sheets it was built from.
export function sheetsForEmployee(employee, period, files = [], roster = [], clients = []) {
  const from = Date.parse(period?.from);
  const to = Date.parse(period?.to);
  if (!employee || !Number.isFinite(from) || !Number.isFinite(to)) return [];

  return files
    .filter((file) => file.status === "Approved" && resolveEmployee(file.employee, roster)?.id === employee.id)
    .map((file) => {
      const inPeriod = (file.rows || []).filter((r) => withinPeriod(r, from, to));
      if (inPeriod.length === 0) return null;
      const totals = sheetTotals(inPeriod, employee.schedule || null);
      return {
        id: file.id,
        name: file.name,
        period: file.period?.label || "",
        client: resolveClient(file, clients)?.name || file.client || "",
        days: totals.days,
        regular: totals.regular,
        overtime: totals.overtime,
      };
    })
    .filter(Boolean);
}
