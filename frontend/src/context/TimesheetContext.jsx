/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState } from "react";
import { timesheetFiles as initialFiles } from "../assets/data/index.js";

const TimesheetContext = createContext(null);

const MONTH_INDEX = { jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5, jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11 };

// Reads a written Period Covered such as "Jun 1 - Jun 15, 2026" into real dates.
// The reviewer can type this field, so the days are read back from the text rather
// than from whatever the OCR first stored alongside it.
export function parsePeriodLabel(label) {
  if (!label) return null;
  const [left, right] = String(label).split(/\s*[–—-]\s*/);
  if (!left || !right) return null;

  const year = (right.match(/\b(\d{4})\b/) || left.match(/\b(\d{4})\b/) || [])[1];
  if (!year) return null;

  // Either side may leave the month out, as in "Jun 1 - 15, 2026", so each side
  // falls back to the month written on the other.
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

// A sheet covers one half of a month. Anything else means the wrong form was used,
// or the dates were written on the wrong version of it.
export function halfFromPeriod(label) {
  const range = parsePeriodLabel(label);
  if (!range) return null;
  const first = range.from.getDate();
  const last = range.to.getDate();
  if (first === 1 && last <= 15) return "1-15";
  if (first === 16) return "16-31";
  return null;
}

// checkPeriodHalf — does Period Covered agree with Sheet Half?
export function checkPeriodHalf(label, half) {
  if (!label || !half) return { status: "unknown" };
  const range = parsePeriodLabel(label);
  if (!range) return { status: "unreadable" };
  const derived = halfFromPeriod(label);
  if (!derived) return { status: "not-a-half", range };
  if (derived !== half) return { status: "mismatch", expected: derived, range };
  return { status: "ok", range };
}

// findDuplicateSheets — other sheets that already carry some of the same days for
// the same person. Those days would otherwise be paid twice. Sheets that have not
// been read yet cannot conflict, because nothing is known about their dates.
export function findDuplicateSheets(files, target, draft, roster = []) {
  // Identity key prefers the resolved roster id so two sheets for the same person still
  // clash when the scanned names differ; a live edit (draft) resolves by its typed name.
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

// Minutes between two "HH:MM" strings, or 0 when either is blank.
function span(from, to) {
  if (!from || !to) return 0;
  const [fh, fm] = from.split(":").map(Number);
  const [th, tm] = to.split(":").map(Number);
  const mins = th * 60 + tm - (fh * 60 + fm);
  return mins > 0 ? mins : 0;
}

function hours(mins) {
  return Math.round((mins / 60) * 100) / 100;
}

// Recomputes a row from its times rather than reading the handwritten totals.
export function rowTotals(row) {
  const regular = span(row.amIn, row.amOut) + span(row.pmIn, row.pmOut);
  const overtime = span(row.otIn, row.otOut);
  return { regular: hours(regular), overtime: hours(overtime), worked: regular > 0 };
}

// resolveEmployee — the roster record a sheet points at. Prefers the stable id link the
// scan resolved, falling back to the name so a hand-typed correction still lands.
export function resolveEmployee(employee, roster = []) {
  if (!employee) return null;
  if (employee.employeeId != null) {
    const byId = roster.find((e) => e.id === employee.employeeId);
    if (byId) return byId;
  }
  const name = (employee.name || "").trim().toLowerCase();
  return name ? roster.find((e) => e.name.trim().toLowerCase() === name) || null : null;
}

// scheduleFor — the standard start and end time on an employee's record. Resolved
// against the live roster passed in, so an edit on the Employees page immediately
// changes which schedule a sheet is measured against rather than reading stale seed data.
export function scheduleFor(employeeName, roster = []) {
  const name = (employeeName || "").trim().toLowerCase();
  if (!name) return null;
  return roster.find((e) => e.name.trim().toLowerCase() === name)?.schedule || null;
}

// Minutes late, worked out from the written IN time against the expected start.
// Arriving early is not negative late: it is simply on time.
export function lateMinutes(row, schedule) {
  if (!schedule?.in || !row?.amIn) return null;
  return span(schedule.in, row.amIn);
}

// The Late figure to use for a row: calculated where a schedule is known, and the
// figure written in the Late column where it is not.
export function rowLate(row, schedule) {
  const derived = lateMinutes(row, schedule);
  return derived === null ? row.late || 0 : derived;
}

// sheetTotals — the sheet re-added from its daily times. One implementation, so a
// sheet approved from the list and one approved from the review screen are judged
// by exactly the same arithmetic.
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

// Where the recomputed totals disagree with what was written on the form.
export function sheetMismatches(rows = [], handwritten, schedule = null) {
  const computed = sheetTotals(rows, schedule);
  const hw = handwritten || {};
  return [
    computed.days !== hw.totalDays && { label: "Total Days", computed: computed.days, written: hw.totalDays },
    Math.round(computed.overtime) !== hw.regOt && { label: "Reg. OT", computed: Math.round(computed.overtime), written: hw.regOt },
    computed.late !== hw.totalLate && { label: "Total Late", computed: `${computed.late} mins`, written: `${hw.totalLate} mins` },
  ].filter(Boolean);
}

// sheetFindings — everything the review screen would raise about a sheet, without
// opening it. The one thing left out is the Period Covered tick, because that is a
// person's confirmation rather than something read off the page; approving in bulk
// asks for it once, over the whole batch.
export function sheetFindings(file, allFiles = [], roster = []) {
  if (!file) return ["Sheet not found"];
  const findings = [];

  if (file.status !== "Needs Review") findings.push("Not awaiting review");
  if (!file.employee?.name) findings.push("Employee not identified");
  else if ((file.employee.confidence || 0) < 0.85) findings.push("Employee name read with low confidence");

  const periodCheck = checkPeriodHalf(file.period?.label, file.half);
  if (periodCheck.status !== "ok") findings.push("Period Covered and Sheet Half do not agree");

  const signatures = file.signatures || {};
  if (!signatures.employee) findings.push("Employee signature not detected");
  if (!signatures.supervisor) findings.push("Supervisor signature not detected");
  if (!signatures.client) findings.push("Client signature not detected");

  if (findDuplicateSheets(allFiles, file, null).length > 0) findings.push("Days already covered by another sheet");
  const schedule = resolveEmployee(file.employee, roster)?.schedule || null;
  if (sheetMismatches(file.rows, file.handwritten, schedule).length > 0) findings.push("Totals disagree with the handwritten figures");

  const lowConfidence = (file.rows || []).reduce((n, r) => n + (r.lowConfidence ? r.lowConfidence.length : 0), 0);
  if (lowConfidence > 0) findings.push(`${lowConfidence} cells read with low confidence`);
  if ((file.rows || []).length === 0) findings.push("Nothing was read from the sheet");

  return findings;
}

// A clean sheet is one with nothing flagged at all, not merely nothing blocking.
export function isSheetClean(file, allFiles = [], roster = []) {
  return sheetFindings(file, allFiles, roster).length === 0;
}

// Folds what the review screen holds in its fields back onto the stored sheet.
// The screen works with flat values; a sheet keeps the employee and the period
// as objects, so the confidence the OCR reported survives an operator's edit.
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
      // a name correction drops the scan's id link so resolution follows the typed name
      employeeId: draft.employee && draft.employee === file.employee?.name ? file.employee?.employeeId : null,
    },
    period: { ...file.period, label: draft.period || null, confirmed: Boolean(draft.periodConfirmed) },
    savedAt: new Date().toISOString(),
  };
}

// TimesheetProvider — uploaded sheets shared across the timesheet routes.
export function TimesheetProvider({ children }) {
  const [files, setFiles] = useState(initialFiles);

  function getFileById(id) {
    return files.find((f) => String(f.id) === String(id));
  }

  function updateFile(id, data) {
    setFiles((prev) => prev.map((f) => (String(f.id) === String(id) ? { ...f, ...data } : f)));
  }

  // saveFile — keeps a reviewer's corrections without approving the sheet.
  function saveFile(id, draft) {
    setFiles((prev) => prev.map((f) => (String(f.id) === String(id) ? applyDraft(f, draft) : f)));
  }

  // approveMany — files a batch of sheets that had nothing flagged. Period Covered
  // is marked confirmed because the operator confirmed the batch on screen.
  function approveMany(ids) {
    const wanted = new Set(ids.map(String));
    const at = new Date().toISOString();
    setFiles((prev) =>
      prev.map((f) =>
        wanted.has(String(f.id))
          ? { ...f, status: "Approved", period: { ...f.period, confirmed: true }, savedAt: at }
          : f,
      ),
    );
  }

  // approveFile — saves the same corrections, then files the sheet.
  function approveFile(id, draft) {
    setFiles((prev) => prev.map((f) => (String(f.id) === String(id) ? { ...applyDraft(f, draft), status: "Approved" } : f)));
  }

  // addSheets — files accepted by the upload queue enter the list as unread sheets,
  // exactly as a sheet arriving from the scanner would. Nothing is known about them
  // yet beyond the client they were uploaded under.
  function addSheets(accepted) {
    const created = accepted.map((item, i) => ({
      id: `u${Date.now()}-${i}`,
      name: item.name,
      type: item.type,
      source: item.source,
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

  // rejectFile — sends the sheet back with the reasons the sender has to act on.
  // Nothing is deleted: the document stays on file so the reason can be read later.
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

  // Reading the sheet again supersedes whatever it was rejected for.
  function retryFile(id) {
    updateFile(id, { status: "Processing", rejection: null });
  }

  // The preview is a handle on a file the browser is holding in memory, so it has
  // to be released explicitly when the sheet goes.
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

export function useTimesheets() {
  const ctx = useContext(TimesheetContext);
  if (!ctx) throw new Error("useTimesheets must be used within a TimesheetProvider");
  return ctx;
}
