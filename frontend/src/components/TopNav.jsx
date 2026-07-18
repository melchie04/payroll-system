import { Link } from "react-router-dom";
import { useTheme } from "../context/ThemeContext.jsx";
import { useCurrentUser } from "../context/CurrentUserContext.jsx";

function initialsOf(name = "") {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0].toUpperCase())
    .join("");
}

export default function TopNav({ onToggleSidebar }) {
  const { theme, setTheme } = useTheme();
  const { user } = useCurrentUser();
  const isDark = theme === "dark";

  const toggleTheme = () => {
    setTheme(isDark ? "light" : "dark");
  };

  return (
    <nav className={`sb-topnav navbar navbar-expand ${isDark ? "navbar-dark bg-dark" : "navbar-light bg-white"} border-bottom px-2 px-md-3`}>
      {/* Sidebar Toggle */}
      <button
        className="nav-box-btn d-flex align-items-center justify-content-center order-1 order-md-0 me-2 me-md-0 ms-1 ms-md-4"
        id="sidebarToggle"
        onClick={onToggleSidebar}
      >
        <i className="fas fa-bars"></i>
      </button>

      {/* Navbar Brand */}
      <Link className="navbar-brand d-flex align-items-center gap-2 order-2 order-md-1 ps-1 ps-md-3" to="/">
        <span
          className="d-inline-flex align-items-center justify-content-center rounded-2 fw-bold"
          style={{
            width: 26,
            height: 26,
            background: isDark ? "#fff" : "#1a1a1a",
            color: isDark ? "#1a1a1a" : "#fff",
            fontSize: 12,
          }}
        >
          P
        </span>
        <span className="fs-6 fw-semibold tracking-wider d-inline">PAYROLL</span>
      </Link>

      {/* Navigation Controls Wrapper */}
      <div className="d-flex align-items-center ms-auto order-3 gap-1 gap-md-2">
        {/* Notification Bell */}
        <ul className="navbar-nav">
          <li className="nav-item dropdown">
            <a
              className="nav-circle-btn d-flex align-items-center justify-content-center text-decoration-none"
              id="navbarNotificationsDropdown"
              href="#"
              role="button"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              <span className="position-relative d-inline-block">
                <i className="fas fa-bell"></i>
                <span
                  className="position-absolute top-0 start-100 translate-middle rounded-circle"
                  style={{ width: 8, height: 8, background: "#ff9c55", border: "1.5px solid var(--bs-body-bg)" }}
                >
                  <span className="visually-hidden">New notifications</span>
                </span>
              </span>
            </a>
            <ul
              className="dropdown-menu dropdown-menu-end position-absolute shadow-sm"
              aria-labelledby="navbarNotificationsDropdown"
              style={{
                minWidth: "280px",
                maxWidth: "calc(100vw - 32px)",
                fontSize: "0.9rem",
              }}
            >
              <li>
                <div
                  className="dropdown-header d-flex align-items-center gap-2 py-2 text-body fw-bold text-decoration-none"
                  style={{ fontSize: "inherit" }}
                >
                  <i className="fas fa-bell fa-fw opacity-75 pt-1"></i>
                  Notifications
                </div>
              </li>
              <li>
                <hr className="dropdown-divider mt-1" />
              </li>
              <li>
                <a
                  className="dropdown-item py-2 text-wrap border-bottom border-light-subtle"
                  href="#!"
                  style={{
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}
                >
                  <span>Payroll run for Acme Corp is ready to review</span>
                </a>
              </li>
              <li>
                <a
                  className="dropdown-item py-2 text-wrap border-bottom border-light-subtle"
                  href="#!"
                  style={{
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}
                >
                  <span>Invoice #1042 is overdue</span>
                </a>
              </li>
              <li>
                <a
                  className="dropdown-item py-2 text-wrap"
                  href="#!"
                  style={{
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}
                >
                  <span>Timesheet extraction completed for 3 files</span>
                </a>
              </li>
              <li>
                <hr className="dropdown-divider" />
              </li>
              <li>
                <Link
                  className="dropdown-item d-flex align-items-center justify-content-center gap-2 py-2 text-center text-primary fw-semibold"
                  to="/notifications"
                >
                  View all notifications
                  <i className="fas fa-arrow-right fa-fw small"></i>
                </Link>
              </li>
            </ul>
          </li>
        </ul>

        {/* User Account Dropdown */}
        <ul className="navbar-nav">
          <li className="nav-item dropdown">
            <a
              className="nav-user-btn d-flex align-items-center gap-2 text-decoration-none"
              id="navbarDropdown"
              href="#"
              role="button"
              data-bs-toggle="dropdown"
              aria-expanded="false"
              style={{ fontSize: "0.95rem" }}
            >
              {user.avatarImage ? (
                <img src={user.avatarImage} alt={user.name} className="rounded-circle" style={{ width: 36, height: 36, objectFit: "cover" }} />
              ) : (
                <span
                  className="d-inline-flex align-items-center justify-content-center rounded-circle text-white fw-semibold flex-shrink-0"
                  style={{ width: 36, height: 36, fontSize: "0.85rem", background: user.avatarColor }}
                >
                  {initialsOf(user.name)}
                </span>
              )}
              <span className="d-none d-sm-inline fw-medium text-body">{user.name}</span>
              <i className="fas fa-chevron-down text-secondary" style={{ fontSize: "0.6rem" }}></i>
            </a>
            <ul
              className="dropdown-menu dropdown-menu-end position-absolute shadow-sm"
              aria-labelledby="navbarDropdown"
              style={{ fontSize: "0.9rem" }}
            >
              <li>
                <div className="dropdown-header py-2 text-decoration-none" style={{ fontSize: "inherit" }}>
                  <div className="d-flex align-items-center gap-2 text-body fw-bold">
                    <i className="fas fa-user-shield fa-fw opacity-75"></i>
                    {user.name}
                  </div>
                  <div className="text-muted small ps-4">{user.role}</div>
                </div>
              </li>
              <li>
                <hr className="dropdown-divider mt-1" />
              </li>
              <li>
                <Link className="dropdown-item d-flex align-items-center gap-2 py-2" to="/profile">
                  <i className="fas fa-id-badge fa-fw opacity-75"></i>
                  My Profile
                </Link>
              </li>
              <li>
                <Link className="dropdown-item d-flex align-items-center gap-2 py-2" to="/settings">
                  <i className="fas fa-gear fa-fw opacity-75"></i>
                  Settings
                </Link>
              </li>
              <li>
                <Link className="dropdown-item d-flex align-items-center gap-2 py-2" to="/activity-log">
                  <i className="fas fa-list-check fa-fw opacity-75"></i>
                  Activity Log
                </Link>
              </li>
              <li>
                <hr className="dropdown-divider" />
              </li>
              <li>
                <button type="button" className="dropdown-item d-flex align-items-center justify-content-between gap-4 py-2" onClick={toggleTheme}>
                  <span className="d-flex align-items-center gap-2">
                    <i className={`fas ${isDark ? "fa-moon" : "fa-sun"} fa-fw opacity-75`}></i>
                    Theme
                  </span>
                  <span className="badge rounded-pill bg-secondary text-capitalize fw-normal">{theme}</span>
                </button>
              </li>
              <li>
                <hr className="dropdown-divider" />
              </li>
              <li>
                <Link className="dropdown-item d-flex align-items-center gap-2 py-2 text-danger" to="/login">
                  <i className="fas fa-right-from-bracket fa-fw opacity-75"></i>
                  Logout
                </Link>
              </li>
            </ul>
          </li>
        </ul>
      </div>
    </nav>
  );
}
