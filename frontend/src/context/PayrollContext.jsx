/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState } from "react";

const PayrollContext = createContext(null);

// PayrollProvider — what a payroll clerk has changed by hand, kept apart from the
// figures the timesheets produce. The run itself is always recalculated from the
// sheets; only the decisions a person made are stored here, keyed by period + employee.
export function PayrollProvider({ children }) {
  const [overrides, setOverrides] = useState({});

  function setStatus(key, status) {
    setOverrides((prev) => ({ ...prev, [key]: { ...prev[key], status } }));
  }

  function setStatusMany(keys, status) {
    setOverrides((prev) => {
      const next = { ...prev };
      keys.forEach((key) => {
        next[key] = { ...next[key], status };
      });
      return next;
    });
  }

  // A corrected hour count is remembered rather than written back onto the sheet, so
  // the timesheet stays the record of what was submitted.
  function setHours(key, hours) {
    setOverrides((prev) => ({ ...prev, [key]: { ...prev[key], hours } }));
  }

  // Clearing an override hands the line back to the timesheets.
  function clearOverride(key) {
    setOverrides((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }

  function clearMany(keys) {
    setOverrides((prev) => {
      const next = { ...prev };
      keys.forEach((key) => delete next[key]);
      return next;
    });
  }

  const value = { overrides, setStatus, setStatusMany, setHours, clearOverride, clearMany };

  return <PayrollContext.Provider value={value}>{children}</PayrollContext.Provider>;
}

export function usePayroll() {
  const ctx = useContext(PayrollContext);
  if (!ctx) {
    throw new Error("usePayroll must be used within a PayrollProvider");
  }
  return ctx;
}
