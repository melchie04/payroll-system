/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState } from "react";
import { notifications as initialNotifications } from "../assets/data/index.js";

const NotificationsContext = createContext(null);

// NotificationsProvider — notifications state shared by TopNav and the Notifications page.
export function NotificationsProvider({ children }) {
  const [notifications, setNotifications] = useState(initialNotifications);

  const unreadCount = notifications.filter((n) => !n.read).length;

  function markAllRead() {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }

  function markOneRead(id) {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  }

  const value = { notifications, unreadCount, markAllRead, markOneRead };

  return <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>;
}

export function useNotifications() {
  const ctx = useContext(NotificationsContext);
  if (!ctx) {
    throw new Error("useNotifications must be used within a NotificationsProvider");
  }
  return ctx;
}
