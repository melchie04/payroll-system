// Builds the payroll rows for a pay period from approved timesheets.

import { parseCurrency } from "./currency.js";
import { sheetTotals, resolveEmployee, resolveClient } from "../context/TimesheetContext.jsx";

// Says whether a date falls inside the given pay period.
function withinPeriod(dayRow, from, to) {
  const when = Date.parse(dayRow?.date);
  return Number.isFinite(when) && when >= from && when <= to;
}

// Rounds a figure to two decimal places.
function money(value) {
  return Math.round(value * 100) / 100;
}

// Builds the key that identifies one employee's row in a period.
export function rowKey(periodLabel, employeeId) {
  return `${periodLabel}|${employeeId}`;
}

// Adds up an employee's approved hours across the period.
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

// Turns approved timesheets into one payroll row per employee.
export function buildPayrollRows({ period, employees = [], files = [], clients = [], overrides = {} }) {
  return employees
    .filter((e) => e.status !== "Inactive")
    .map((employee) => {
      const worked = hoursForEmployee(employee, period, files, employees);
      const override = overrides[rowKey(period?.label, employee.id)] || {};
      const hours = override.hours != null ? Number(override.hours) : money(worked.regular + worked.overtime);
      const rate = parseCurrency(employee.rate);
      const client = clients.find((c) => c.code === employee.client);

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

// Finds the sheets belonging to one employee in a period.
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
