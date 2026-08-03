import { Routes, Route } from "react-router";

import AuthLayout from "./layouts/AuthLayout.jsx";
import ErrorLayout from "./layouts/ErrorLayout.jsx";
import DashboardLayout from "./layouts/DashboardLayout.jsx";

import Login from "./pages/auth/Login.jsx";
import ChangePassword from "./pages/auth/ChangePassword.jsx";

import NotFound from "./pages/errors/NotFound.jsx";
import AccessDenied from "./pages/errors/AccessDenied.jsx";
import ServerError from "./pages/errors/ServerError.jsx";

import Notifications from "./pages/topnav/Notifications.jsx";

import Dashboard from "./pages/dashboard/Dashboard.jsx";
import Payroll from "./pages/payroll/Payroll.jsx";
import Billing from "./pages/billing/Billing.jsx";
import Invoice from "./pages/billing/Invoice.jsx";
import Payslip from "./pages/payroll/Payslip.jsx";
import Timesheet from "./pages/timesheet/Timesheet.jsx";
import TimesheetReview from "./pages/timesheet/TimesheetReview.jsx";
import Settings from "./pages/topnav/Settings.jsx";
import MyProfile from "./pages/topnav/MyProfile.jsx";
import ActivityLog from "./pages/topnav/ActivityLog.jsx";

import Employees from "./pages/employees/Employees.jsx";
import EmployeeProfile from "./pages/employees/EmployeeProfile.jsx";
import EmployeeForm from "./pages/employees/EmployeeForm.jsx";

import Clients from "./pages/clients/Clients.jsx";
import ClientProfile from "./pages/clients/ClientProfile.jsx";
import ClientForm from "./pages/clients/ClientForm.jsx";

// App — route table mapping auth, dashboard, and error pages to their layouts.
export default function App() {
  return (
    <Routes>
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/change-password" element={<ChangePassword />} />
      </Route>

      <Route element={<DashboardLayout />}>
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/profile" element={<MyProfile />} />
        <Route path="/activity-log" element={<ActivityLog />} />

        <Route path="/" element={<Dashboard />} />

        <Route path="/payroll" element={<Payroll />} />
        <Route path="/payroll/:id" element={<Payslip />} />

        <Route path="/billing" element={<Billing />} />
        <Route path="/billing/:id" element={<Invoice />} />

        <Route path="/timesheet" element={<Timesheet />} />
        <Route path="/timesheet/:id" element={<TimesheetReview />} />

        <Route path="/employees" element={<Employees />} />
        <Route path="/employees/new" element={<EmployeeForm />} />
        <Route path="/employees/:id" element={<EmployeeProfile />} />
        <Route path="/employees/:id/edit" element={<EmployeeForm />} />

        <Route path="/clients" element={<Clients />} />
        <Route path="/clients/new" element={<ClientForm />} />
        <Route path="/clients/:id" element={<ClientProfile />} />
        <Route path="/clients/:id/edit" element={<ClientForm />} />
      </Route>

      <Route element={<ErrorLayout />}>
        <Route path="/403" element={<AccessDenied />} />
        <Route path="/500" element={<ServerError />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
