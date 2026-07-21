/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState } from "react";
import { timesheetFiles as initialFiles } from "../assets/data/index.js";

const TimesheetContext = createContext(null);

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

  function retryFile(id) {
    updateFile(id, { status: "Processing" });
  }

  function discardFile(id) {
    setFiles((prev) => prev.filter((f) => String(f.id) !== String(id)));
  }

  const value = { files, getFileById, updateFile, saveFile, approveFile, retryFile, discardFile };

  return <TimesheetContext.Provider value={value}>{children}</TimesheetContext.Provider>;
}

export function useTimesheets() {
  const ctx = useContext(TimesheetContext);
  if (!ctx) throw new Error("useTimesheets must be used within a TimesheetProvider");
  return ctx;
}
