// One hook per context: reads its value and fails loudly if the matching provider is missing.

import { useContext } from "react";
import {
  ActivityContext,
  ClientsContext,
  CurrentUserContext,
  EmployeesContext,
  InvoicesContext,
  NotificationsContext,
  PayrollContext,
  ThemeContext,
  TimesheetContext,
} from "./contexts.js";

// Reads the activity feed from context.
export function useActivity() {
  const ctx = useContext(ActivityContext);
  if (!ctx) {
    throw new Error("useActivity must be used within an ActivityProvider");
  }
  return ctx;
}

// Reads the client roster from context.
export function useClients() {
  const ctx = useContext(ClientsContext);
  if (!ctx) {
    throw new Error("useClients must be used within a ClientsProvider");
  }
  return ctx;
}

// Reads the signed-in user from context.
export function useCurrentUser() {
  const ctx = useContext(CurrentUserContext);
  if (!ctx) {
    throw new Error("useCurrentUser must be used within a CurrentUserProvider");
  }
  return ctx;
}

// Reads the employee roster from context.
export function useEmployees() {
  const ctx = useContext(EmployeesContext);
  if (!ctx) throw new Error("useEmployees must be used within an EmployeesProvider");
  return ctx;
}

// Reads the invoice list from context.
export function useInvoices() {
  const ctx = useContext(InvoicesContext);
  if (!ctx) {
    throw new Error("useInvoices must be used within an InvoicesProvider");
  }
  return ctx;
}

// Reads the notification list from context.
export function useNotifications() {
  const ctx = useContext(NotificationsContext);
  if (!ctx) {
    throw new Error("useNotifications must be used within a NotificationsProvider");
  }
  return ctx;
}

// Reads payroll state from context.
export function usePayroll() {
  const ctx = useContext(PayrollContext);
  if (!ctx) {
    throw new Error("usePayroll must be used within a PayrollProvider");
  }
  return ctx;
}

// Reads the current theme from context.
export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside a ThemeProvider");
  return ctx;
}

// Reads timesheet state from context.
export function useTimesheets() {
  const ctx = useContext(TimesheetContext);
  if (!ctx) throw new Error("useTimesheets must be used within a TimesheetProvider");
  return ctx;
}
