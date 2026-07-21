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
export function findDuplicateSheets(files, target, draft) {
  const name = ((draft ? draft.employee : target?.employee?.name) || "").trim().toLowerCase();
  const range = parsePeriodLabel(draft ? draft.period : target?.period?.label);
  if (!name || !range) return [];

  return files.filter((other) => {
    if (String(other.id) === String(target?.id)) return false;
    if (other.status === "Failed" || other.status === "Processing") return false;
    if ((other.employee?.name || "").trim().toLowerCase() !== name) return false;
    const otherRange = parsePeriodLabel(other.period?.label);
    if (!otherRange) return false;
    return range.from <= otherRange.to && range.to >= otherRange.from;
  });
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
    employee: { ...file.employee, name: draft.employee || null },
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

  const value = { files, getFileById, updateFile, saveFile, approveFile, addSheets, rejectFile, retryFile, discardFile };

  return <TimesheetContext.Provider value={value}>{children}</TimesheetContext.Provider>;
}

export function useTimesheets() {
  const ctx = useContext(TimesheetContext);
  if (!ctx) throw new Error("useTimesheets must be used within a TimesheetProvider");
  return ctx;
}
