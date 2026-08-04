// Holds payroll run statuses and any manually edited hours.

import { useState } from "react";
import { PayrollContext } from "./contexts.js";

// Holds payroll statuses and any hours edited by hand.
export function PayrollProvider({ children }) {
  const [overrides, setOverrides] = useState({});

  // Sets the status of one payroll row.
  function setStatus(key, status) {
    setOverrides((prev) => ({ ...prev, [key]: { ...prev[key], status } }));
  }

  // Sets the same status on several rows at once.
  function setStatusMany(keys, status) {
    setOverrides((prev) => {
      const next = { ...prev };
      keys.forEach((key) => {
        next[key] = { ...next[key], status };
      });
      return next;
    });
  }

  // Overrides an employee's hours for a period.
  function setHours(key, hours) {
    setOverrides((prev) => ({ ...prev, [key]: { ...prev[key], hours } }));
  }

  // Drops one manual hours edit, returning the row to its timesheet total.
  function clearOverride(key) {
    setOverrides((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }

  // Drops several manual hours edits at once.
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
