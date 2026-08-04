// Records what each user did, feeding the Activity Log page.

import { createContext, useContext, useState } from "react";
import { activityLog as initialEntries } from "../assets/data/index.js";
import { useCurrentUser } from "./CurrentUserContext.jsx";

const ActivityContext = createContext(null);

// Formats the current time the way the Activity Log displays it.
function stamp(date = new Date()) {
  const day = date.toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" });
  const time = date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  return `${day} ${time}`;
}

// Holds the activity feed and exposes it to the tree below.
export function ActivityProvider({ children }) {
  const [entries, setEntries] = useState(initialEntries);
  const { user } = useCurrentUser();

  // Adds one entry to the front of the feed.
  function logActivity({ action, detail = "", module }) {
    setEntries((prev) => {
      const nextId = prev.reduce((max, e) => (Number(e.id) > max ? Number(e.id) : max), 0) + 1;
      return [{ id: nextId, user: user?.name || "Unknown", action, detail, module, timestamp: stamp() }, ...prev];
    });
  }

  return <ActivityContext.Provider value={{ entries, logActivity }}>{children}</ActivityContext.Provider>;
}

// Reads the activity feed from context.
export function useActivity() {
  const ctx = useContext(ActivityContext);
  if (!ctx) {
    throw new Error("useActivity must be used within an ActivityProvider");
  }
  return ctx;
}
