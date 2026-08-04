// Holds the notification list and its unread count.

import { useState } from "react";
import { notifications as initialNotifications } from "../assets/data/index.js";
import { NotificationsContext } from "./contexts.js";

// Holds the notification list and derives the unread count.
export function NotificationsProvider({ children }) {
  const [notifications, setNotifications] = useState(initialNotifications);

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Marks every notification read.
  function markAllRead() {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }

  // Marks a single notification read.
  function markOneRead(id) {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  }

  // Adds a notification to the front of the list.
  function addNotification({ icon = "\ud83d\udd14", title, bold = "", sub = "", type }) {
    setNotifications((prev) => {
      const nextId = prev.reduce((max, n) => (Number(n.id) > max ? Number(n.id) : max), 0) + 1;
      return [{ id: nextId, icon, title, bold, sub, time: "Just now", read: false, type }, ...prev];
    });
  }

  const value = { notifications, unreadCount, markAllRead, markOneRead, addNotification };

  return <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>;
}
