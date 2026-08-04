// Holds uploaded timesheets and everything derived from them.

import { createContext, useContext, useState } from "react";
import { timesheetFiles as initialFiles } from "../assets/data/index.js";

const TimesheetContext = createContext(null);

const MONTH_INDEX = { jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5, jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11 };

// Reads a period label such as 1-15 Jul into its start and end dates.
export function parsePeriodLabel(label) {
  if (!label) return null;
  const [left, right] = String(label).split(/\s*[–—-]\s*/);
  if (!left || !right) return null;

  const year = (right.match(/\b(\d{4})\b/) || left.match(/\b(\d{4})\b/) || [])[1];
  if (!year) return null;

  const monthOf = (part) => {
    const name = part.match(/([A-Za-z]{3,})/);
    const index = name ? MONTH_INDEX[name[1].slice(0, 3).toLowerCase()] : undefined;
    return index == null ? null : index;
  };
  const dayOf = (part) => {
    const day = part.match(/\b(\d{1,2})\b/);
    return day ? Number(day[1]) : null;
  };

  const leftMonth = monthOf(left);
  const rightMonth = monthOf(right);
  const fromMonth = leftMonth ?? rightMonth;
  const toMonth = rightMonth ?? leftMonth;
  const fromDay = dayOf(left);
  const toDay = dayOf(right);
  if (fromMonth == null || toMonth == null || fromDay == null || toDay == null) return null;

  const from = new Date(Number(year), fromMonth, fromDay);
  const to = new Date(Number(year), toMonth, toDay);
  if (from > to) return null;
  return { from, to };
}

// Works out whether a period is the first or second half of the month.
export function halfFromPeriod(label) {
  const range = parsePeriodLabel(label);
  if (!range) return null;
  const first = range.from.getDate();
  const last = range.to.getDate();
  if (first === 1 && last <= 15) return "1-15";
  if (first === 16) return "16-31";
  return null;
}

// Flags a sheet whose dates fall outside the half it claims to cover.
export function checkPeriodHalf(label, half) {
  if (!label || !half) return { status: "unknown" };
  const range = parsePeriodLabel(label);
  if (!range) return { status: "unreadable" };
  const derived = halfFromPeriod(label);
  if (!derived) return { status: "not-a-half", range };
  if (derived !== half) return { status: "mismatch", expected: derived, range };
  return { status: "ok", range };
}

// Finds other sheets already filed for the same employee and period.
export function findDuplicateSheets(files, target, draft, roster = []) {
  const self = draft ? { name: draft.employee } : target?.employee;
  const selfResolved = resolveEmployee(self, roster);
  const key = selfResolved ? `id:${selfResolved.id}` : (self?.name || "").trim().toLowerCase();
  const range = parsePeriodLabel(draft ? draft.period : target?.period?.label);
  if (!key || !range) return [];

  return files.filter((other) => {
    if (String(other.id) === String(target?.id)) return false;
    if (other.status === "Failed" || other.status === "Processing") return false;
    const otherResolved = resolveEmployee(other.employee, roster);
    const otherKey = otherResolved ? `id:${otherResolved.id}` : (other.employee?.name || "").trim().toLowerCase();
    if (otherKey !== key) return false;
    const otherRange = parsePeriodLabel(other.period?.label);
    if (!otherRange) return false;
    return range.from <= otherRange.to && range.to >= otherRange.from;
  });
}

// Measures the hours between two times, allowing for an overnight shift.
function span(from, to) {
  if (!from || !to) return 0;
  const [fh, fm] = from.split(":").map(Number);
  const [th, tm] = to.split(":").map(Number);
  const mins = th * 60 + tm - (fh * 60 + fm);
  return mins > 0 ? mins : 0;
}

// Totals one day's worked hours, less the break.
function hours(mins) {
  return Math.round((mins / 60) * 100) / 100;
}

// Totals one row's regular, overtime and night-differential hours.
export function rowTotals(row) {
  const regular = span(row.amIn, row.amOut) + span(row.pmIn, row.pmOut);
  const overtime = span(row.otIn, row.otOut);
  return { regular: hours(regular), overtime: hours(overtime), worked: regular > 0 };
}

// Matches a sheet to an employee on the roster by name.
export function resolveEmployee(employee, roster = []) {
  if (!employee) return null;
  if (employee.employeeId != null) {
    const byId = roster.find((e) => e.id === employee.employeeId);
    if (byId) return byId;
  }
  const name = (employee.name || "").trim().toLowerCase();
  if (!name) return null;
  return (
    roster.find((e) => e.name.trim().toLowerCase() === name) ||
    roster.find((e) => (e.aliases || []).some((a) => a.trim().toLowerCase() === name)) ||
    null
  );
}

// Matches a sheet to a client by code, falling back to the name.
export function resolveClient(file, clients = []) {
  if (!file) return null;
  if (file.clientCode) {
    const byCode = clients.find((c) => c.code === file.clientCode);
    if (byCode) return byCode;
  }
  return clients.find((c) => c.name === file.client) || null;
}

// Parses an ISO date string, returning null rather than an invalid date.
function parseIsoDate(value) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(value || "").trim());
  return m ? new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3])) : null;
}

// Says whether an employee was posted to that client on that date.
export function deploymentState(employee, range) {
  if (!employee) return { expected: true, reason: null };
  if (employee.status && employee.status !== "Active") return { expected: false, reason: employee.status };
  if (!range) return { expected: true, reason: null };
  const start = parseIsoDate(employee.assignmentStart);
  if (start && start > range.to) return { expected: false, reason: "Not yet deployed" };
  const end = parseIsoDate(employee.assignmentEnd);
  if (end && end < range.from) return { expected: false, reason: "Assignment ended" };
  return { expected: true, reason: null };
}

// Finds the shift an employee was rostered to work that day.
export function scheduleFor(employeeName, roster = []) {
  return resolveEmployee({ name: employeeName }, roster)?.schedule || null;
}

// Measures how many minutes after the rostered start the employee clocked in.
export function lateMinutes(row, schedule) {
  if (!schedule?.in || !row?.amIn) return null;
  return span(schedule.in, row.amIn);
}

// Reports lateness for one row, using its own schedule if it has one.
export function rowLate(row, schedule) {
  const derived = lateMinutes(row, schedule);
  return derived === null ? row.late || 0 : derived;
}

// Adds every row of a sheet into one set of totals.
export function sheetTotals(rows = [], schedule = null) {
  return rows.reduce(
    (acc, r) => {
      const t = rowTotals(r);
      return {
        days: acc.days + (t.worked ? 1 : 0),
        regular: acc.regular + t.regular,
        overtime: acc.overtime + t.overtime,
        late: acc.late + rowLate(r, schedule),
      };
    },
    { days: 0, regular: 0, overtime: 0, late: 0 },
  );
}

// Compares the computed totals against the ones printed on the sheet.
export function sheetMismatches(rows = [], handwritten, schedule = null) {
  const computed = sheetTotals(rows, schedule);
  const hw = handwritten || {};
  return [
    computed.days !== hw.totalDays && { label: "Total Days", computed: computed.days, written: hw.totalDays },
    Math.round(computed.overtime) !== hw.regOt && { label: "Reg. OT", computed: Math.round(computed.overtime), written: hw.regOt },
    computed.late !== hw.totalLate && { label: "Total Late", computed: `${computed.late} mins`, written: `${hw.totalLate} mins` },
  ].filter(Boolean);
}

// Collects everything the review screen would raise about a sheet.
export function sheetFindings(file, allFiles = [], roster = [], clients = []) {
  if (!file) return ["Sheet not found"];
  const client = resolveClient(file, clients);
  const findings = [];

  if (file.status !== "Needs Review") findings.push("Not awaiting review");
  if (!file.employee?.name) findings.push("Employee not identified");
  else if ((file.employee.confidence || 0) < 0.85) findings.push("Employee name read with low confidence");

  const periodCheck = checkPeriodHalf(file.period?.label, file.half);
  if (periodCheck.status !== "ok") findings.push("Period Covered and Sheet Half do not agree");

  const signatures = file.signatures || {};
  if (!signatures.employee) findings.push("Employee signature not detected");
  if (!signatures.supervisor) findings.push("Supervisor signature not detected");
  if (client?.requiresClientSignature !== false && !signatures.client)
    findings.push(client?.approvingRep ? `Client signature (${client.approvingRep}) not detected` : "Client signature not detected");
  if (client?.approvedFormCodes?.length && file.formCode && !client.approvedFormCodes.includes(file.formCode))
    findings.push(`Form ${file.formCode} is not approved for this client`);

  if (findDuplicateSheets(allFiles, file, null, roster).length > 0) findings.push("Days already covered by another sheet");
  const matched = resolveEmployee(file.employee, roster);
  const deployment = deploymentState(matched, parsePeriodLabel(file.period?.label));
  if (!deployment.expected) findings.push(`Employee not deployed for this period (${deployment.reason})`);
  const schedule = matched?.schedule || null;
  if (sheetMismatches(file.rows, file.handwritten, schedule).length > 0) findings.push("Totals disagree with the handwritten figures");

  const lowConfidence = (file.rows || []).reduce((n, r) => n + (r.lowConfidence ? r.lowConfidence.length : 0), 0);
  if (lowConfidence > 0) findings.push(`${lowConfidence} cells read with low confidence`);
  if ((file.rows || []).length === 0) findings.push("Nothing was read from the sheet");

  return findings;
}

// A sheet is clean when it raises no findings at all.
export function isSheetClean(file, allFiles = [], roster = [], clients = []) {
  return sheetFindings(file, allFiles, roster, clients).length === 0;
}

// Folds a reviewer's edits back into the stored sheet.
function applyDraft(file, draft) {
  if (!draft) return file;
  return {
    ...file,
    rows: draft.rows ?? file.rows,
    client: draft.client ?? file.client,
    half: draft.half ?? file.half,
    employee: {
      ...file.employee,
      name: draft.employee || null,
      employeeId: draft.employee && draft.employee === file.employee?.name ? file.employee?.employeeId : null,
    },
    period: { ...file.period, label: draft.period || null, confirmed: Boolean(draft.periodConfirmed) },
    savedAt: new Date().toISOString(),
  };
}

// Holds every uploaded sheet and the helpers derived from them.
export function TimesheetProvider({ children }) {
  const [files, setFiles] = useState(initialFiles);

  // Finds one uploaded sheet by id.
  function getFileById(id) {
    return files.find((f) => String(f.id) === String(id));
  }

  // Merges changes into one sheet.
  function updateFile(id, data) {
    setFiles((prev) => prev.map((f) => (String(f.id) === String(id) ? { ...f, ...data } : f)));
  }

  // Saves a reviewer's draft without approving the sheet.
  function saveFile(id, draft) {
    setFiles((prev) => prev.map((f) => (String(f.id) === String(id) ? applyDraft(f, draft) : f)));
  }

  // Approves several sheets at once, skipping any that still have findings.
  function approveMany(ids) {
    const wanted = new Set(ids.map(String));
    const at = new Date().toISOString();
    setFiles((prev) =>
      prev.map((f) => (wanted.has(String(f.id)) ? { ...f, status: "Approved", period: { ...f.period, confirmed: true }, savedAt: at } : f)),
    );
  }

  // Saves the draft and moves the sheet to approved.
  function approveFile(id, draft) {
    setFiles((prev) => prev.map((f) => (String(f.id) === String(id) ? { ...applyDraft(f, draft), status: "Approved" } : f)));
  }

  // Files newly uploaded sheets and extracts their rows.
  function addSheets(accepted) {
    const created = accepted.map((item, i) => ({
      id: `u${Date.now()}-${i}`,
      name: item.name,
      type: item.type,
      source: item.source,
      clientCode: item.clientCode || null,
      uploaded: new Date().toLocaleString([], { month: "short", day: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }),
      status: "Processing",
      client: item.client,
      formCode: null,
      previewUrl: item.previewUrl || null,
      employee: { name: null, employeeId: null, matched: false, confidence: 0 },
      half: null,
      halfConfidence: 0,
      period: { label: null, from: null, to: null, confidence: 0, confirmed: false },
      signatures: { employee: false, supervisor: false, client: false },
      handwritten: null,
      rows: [],
    }));
    setFiles((prev) => [...created, ...prev]);
    return created;
  }

  // Rejects a sheet, recording the reasons given.
  function rejectFile(id, rejection) {
    updateFile(id, {
      status: "Rejected",
      rejection: {
        reasons: rejection?.reasons || [],
        note: (rejection?.note || "").trim(),
        at: new Date().toISOString(),
      },
    });
  }

  // Sends a failed sheet back through extraction.
  function retryFile(id) {
    updateFile(id, { status: "Processing", rejection: null });
  }

  // Removes a sheet from the list entirely.
  function discardFile(id) {
    setFiles((prev) => {
      const going = prev.find((f) => String(f.id) === String(id));
      if (going?.previewUrl) URL.revokeObjectURL(going.previewUrl);
      return prev.filter((f) => String(f.id) !== String(id));
    });
  }

  const value = { files, getFileById, updateFile, saveFile, approveFile, approveMany, addSheets, rejectFile, retryFile, discardFile };

  return <TimesheetContext.Provider value={value}>{children}</TimesheetContext.Provider>;
}

// Reads timesheet state from context.
export function useTimesheets() {
  const ctx = useContext(TimesheetContext);
  if (!ctx) throw new Error("useTimesheets must be used within a TimesheetProvider");
  return ctx;
}
