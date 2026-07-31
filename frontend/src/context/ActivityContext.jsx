/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState } from "react";
import { activityLog as initialEntries } from "../assets/data/index.js";
import { useCurrentUser } from "./CurrentUserContext.jsx";

const ActivityContext = createContext(null);

// Entries are stored as display text ("Jul 4, 2026 9:42 AM") because that is the shape
// the seeded log already uses and what the page's date filter reads back.
function stamp(date = new Date()) {
  const day = date.toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" });
  const time = date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  return `${day} ${time}`;
}

// ActivityProvider — the audit trail, shared so any page can add to it.
export function ActivityProvider({ children }) {
  const [entries, setEntries] = useState(initialEntries);
  const { user } = useCurrentUser();

  // logActivity — records one action. The signed-in user and the time are filled in
  // here rather than at each call site, so every entry is stamped the same way.
  function logActivity({ action, detail = "", module }) {
    setEntries((prev) => {
      // Derived inside the updater so a batch of changes in one tick still gets
      // distinct ids rather than several entries sharing a clock reading.
      const nextId = prev.reduce((max, e) => (Number(e.id) > max ? Number(e.id) : max), 0) + 1;
      return [{ id: nextId, user: user?.name || "Unknown", action, detail, module, timestamp: stamp() }, ...prev];
    });
  }

  return <ActivityContext.Provider value={{ entries, logActivity }}>{children}</ActivityContext.Provider>;
}

export function useActivity() {
  const ctx = useContext(ActivityContext);
  if (!ctx) {
    throw new Error("useActivity must be used within an ActivityProvider");
  }
  return ctx;
}
