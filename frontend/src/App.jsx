import { Routes, Route } from "react-router-dom";

import DashboardLayout from "./layouts/DashboardLayout.jsx";
import AuthLayout from "./layouts/AuthLayout.jsx";
import ErrorLayout from "./layouts/ErrorLayout.jsx";

import Login from "./pages/auth/Login.jsx";
import ForgotPassword from "./pages/auth/ForgotPassword.jsx";
import ResetPassword from "./pages/auth/ResetPassword.jsx";
import ChangePassword from "./pages/auth/ChangePassword.jsx";

import Dashboard from "./pages/Dashboard.jsx";
import Payroll from "./pages/Payroll.jsx";
import Billing from "./pages/Billing.jsx";
import Timesheet from "./pages/Timesheet.jsx";
import Clients from "./pages/Clients.jsx";
import Notifications from "./pages/Notifications.jsx";
import Settings from "./pages/Settings.jsx";
import ActivityLog from "./pages/ActivityLog.jsx";

import Employees from "./pages/employees/Employees.jsx";
import EmployeeProfile from "./pages/employees/EmployeeProfile.jsx";
import EmployeeForm from "./pages/employees/EmployeeForm.jsx";

import NotFound from "./pages/errors/NotFound.jsx";
import AccessDenied from "./pages/errors/AccessDenied.jsx";
import ServerError from "./pages/errors/ServerError.jsx";

export default function App() {
  return (
    <Routes>
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/change-password/:token" element={<ChangePassword />} />
        <Route path="/change-password" element={<ChangePassword />} />
      </Route>

      <Route element={<DashboardLayout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/payroll" element={<Payroll />} />
        <Route path="/billing" element={<Billing />} />
        <Route path="/timesheet" element={<Timesheet />} />

        <Route path="/employees" element={<Employees />} />
        <Route path="/employees/new" element={<EmployeeForm />} />
        <Route path="/employees/:id" element={<EmployeeProfile />} />
        <Route path="/employees/:id/edit" element={<EmployeeForm />} />

        <Route path="/clients" element={<Clients />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/activity-log" element={<ActivityLog />} />
      </Route>

      {/* Error pages */}
      <Route element={<ErrorLayout />}>
        <Route path="/403" element={<AccessDenied />} />
        <Route path="/500" element={<ServerError />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
