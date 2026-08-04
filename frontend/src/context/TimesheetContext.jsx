// Holds uploaded timesheets and hands them to the tree below.

import { useState } from "react";
import { timesheetFiles as initialFiles } from "../assets/data/index.js";
import { TimesheetContext } from "./contexts.js";

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
