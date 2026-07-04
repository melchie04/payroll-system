import { Routes, Route } from "react-router-dom";

import DashboardLayout from "./layouts/DashboardLayout.jsx";

import Login from "./views/Login.jsx";
import Dashboard from "./views/Dashboard.jsx";
import Payroll from "./views/Payroll.jsx";
import Billing from "./views/Billing.jsx";
import Timesheet from "./views/Timesheet.jsx";
import Employees from "./views/Employees.jsx";
import Clients from "./views/Clients.jsx";
import Notifications from "./views/Notifications.jsx";
import Settings from "./views/Settings.jsx";
import ActivityLog from "./views/ActivityLog.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<DashboardLayout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/payroll" element={<Payroll />} />
        <Route path="/billing" element={<Billing />} />
        <Route path="/timesheet" element={<Timesheet />} />
        <Route path="/employees" element={<Employees />} />
        <Route path="/clients" element={<Clients />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/activity-log" element={<ActivityLog />} />
      </Route>
    </Routes>
  );
}
