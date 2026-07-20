/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState } from "react";
import { timesheetFiles as initialFiles } from "../assets/data/index.js";

const TimesheetContext = createContext(null);

// TimesheetProvider — uploaded sheets shared across the timesheet routes.
export function TimesheetProvider({ children }) {
  const [files, setFiles] = useState(initialFiles);

  function getFileById(id) {
    return files.find((f) => String(f.id) === String(id));
  }

  function updateFile(id, data) {
    setFiles((prev) => prev.map((f) => (String(f.id) === String(id) ? { ...f, ...data } : f)));
  }

  function approveFile(id, rows) {
    updateFile(id, { status: "Approved", ...(rows ? { rows } : {}) });
  }

  function retryFile(id) {
    updateFile(id, { status: "Processing" });
  }

  function discardFile(id) {
    setFiles((prev) => prev.filter((f) => String(f.id) !== String(id)));
  }

  const value = { files, getFileById, updateFile, approveFile, retryFile, discardFile };

  return <TimesheetContext.Provider value={value}>{children}</TimesheetContext.Provider>;
}

export function useTimesheets() {
  const ctx = useContext(TimesheetContext);
  if (!ctx) throw new Error("useTimesheets must be used within a TimesheetProvider");
  return ctx;
}
