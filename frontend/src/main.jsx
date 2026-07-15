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
import { CurrentUserProvider } from "./context/CurrentUserContext.jsx";
import App from "./App.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <CurrentUserProvider>
          <ClientsProvider>
            <EmployeesProvider>
              <App />
            </EmployeesProvider>
          </ClientsProvider>
        </CurrentUserProvider>
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>,
);
