// Application entry point: mounts React and wraps it in every context provider.

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";

import "bootstrap";
import "@fontsource-variable/inter";
import "@fortawesome/fontawesome-free/css/all.min.css";

import "./assets/scss/styles.scss";
import "./assets/scss/app.scss";

import { ThemeProvider } from "./context/ThemeContext.jsx";
import { EmployeesProvider } from "./context/EmployeesContext.jsx";
import { ClientsProvider } from "./context/ClientsContext.jsx";
import { TimesheetProvider } from "./context/TimesheetContext.jsx";
import { CurrentUserProvider } from "./context/CurrentUserContext.jsx";
import { NotificationsProvider } from "./context/NotificationsContext.jsx";
import { ActivityProvider } from "./context/ActivityContext.jsx";
import { InvoicesProvider } from "./context/InvoicesContext.jsx";
import { PayrollProvider } from "./context/PayrollContext.jsx";
import App from "./App.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <CurrentUserProvider>
          <ActivityProvider>
            <NotificationsProvider>
              <ClientsProvider>
                <InvoicesProvider>
                  <EmployeesProvider>
                    <TimesheetProvider>
                      <PayrollProvider>
                        <App />
                      </PayrollProvider>
                    </TimesheetProvider>
                  </EmployeesProvider>
                </InvoicesProvider>
              </ClientsProvider>
            </NotificationsProvider>
          </ActivityProvider>
        </CurrentUserProvider>
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>,
);
