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

  // addNotification — raises a new unread notification. The seeded entries carry a
  // written age ("2h ago") rather than a date, so a fresh one says "Just now" and
  // keeps the same shape the bell and the Notifications page already render.
  function addNotification({ icon = "\ud83d\udd14", title, bold = "", sub = "", type }) {
    setNotifications((prev) => {
      const nextId = prev.reduce((max, n) => (Number(n.id) > max ? Number(n.id) : max), 0) + 1;
      return [{ id: nextId, icon, title, bold, sub, time: "Just now", read: false, type }, ...prev];
    });
  }

  const value = { notifications, unreadCount, markAllRead, markOneRead, addNotification };

  return <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>;
}

export function useNotifications() {
  const ctx = useContext(NotificationsContext);
  if (!ctx) {
    throw new Error("useNotifications must be used within a NotificationsProvider");
  }
  return ctx;
}
