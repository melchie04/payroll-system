import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import "bootstrap";
import "@fortawesome/fontawesome-free/css/all.min.css";

import "./assets/scss/styles.scss";
import "./assets/scss/custom.scss";

import { ThemeProvider } from "./context/ThemeContext.jsx";
import { EmployeesProvider } from "./context/EmployeesContext.jsx";
import { ClientsProvider } from "./context/ClientsContext.jsx";
import { TimesheetProvider } from "./context/TimesheetContext.jsx";
import { CurrentUserProvider } from "./context/CurrentUserContext.jsx";
import { NotificationsProvider } from "./context/NotificationsContext.jsx";
import App from "./App.jsx";

// App entry point — mounts the router, global providers, and styles.
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <CurrentUserProvider>
          <NotificationsProvider>
            <ClientsProvider>
              <EmployeesProvider>
                <TimesheetProvider>
                  <App />
                </TimesheetProvider>
              </EmployeesProvider>
            </ClientsProvider>
          </NotificationsProvider>
        </CurrentUserProvider>
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>,
);
