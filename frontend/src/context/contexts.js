// The nine context objects the providers publish into and the hooks read back out of.

import { createContext } from "react";

export const ActivityContext = createContext(null);
export const ClientsContext = createContext(null);
export const CurrentUserContext = createContext(null);
export const EmployeesContext = createContext(null);
export const InvoicesContext = createContext(null);
export const NotificationsContext = createContext(null);
export const PayrollContext = createContext(null);
export const ThemeContext = createContext(null);
export const TimesheetContext = createContext(null);
