import { Outlet } from "react-router";
import Footer from "../components/Footer.jsx";
import { useTheme } from "../context/ThemeContext.jsx";

// AuthThemeToggle — light/dark switch for the auth pages.
function AuthThemeToggle() {
  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark";
  const label = isDark ? "Switch to light mode" : "Switch to dark mode";

  return (
    <button type="button" className="auth-theme-toggle" onClick={() => setTheme(isDark ? "light" : "dark")} aria-label={label} title={label}>
      <i className={`fas ${isDark ? "fa-sun" : "fa-moon"}`}></i>
    </button>
  );
}

// AuthLayout — centered layout for the auth pages.
export default function AuthLayout() {
  return (
    <div id="layoutAuthentication" className="bg-body centered-bg d-flex flex-column" style={{ minHeight: "100vh" }}>
      <AuthThemeToggle />
      <div id="layoutAuthentication_content" className="d-flex flex-column flex-grow-1">
        <main className="d-flex align-items-center justify-content-center flex-grow-1">
          <div className="container p-5">
            <div className="row justify-content-center">
              <div className="col-12 d-flex flex-column align-items-center centered-animate">
                <Outlet />
              </div>
            </div>
          </div>
        </main>
      </div>
      <div id="layoutAuthentication_footer">
        <Footer />
      </div>
    </div>
  );
}
