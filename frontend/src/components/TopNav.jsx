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
      {/* Navbar Brand*/}
      <Link className="navbar-brand ps-1 ps-md-3 d-flex align-items-center gap-2" to="/">
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
        <span className="fs-6 fw-semibold tracking-wider">PAYROLL</span>
      </Link>

      {/* Sidebar Toggle*/}
      <button className="btn btn-link btn-sm me-1 me-lg-0 ms-3 ms-lg-4 fs-6" id="sidebarToggle" onClick={onToggleSidebar}>
        <i className="fas fa-bars fa-lg"></i>
      </button>

      {/* Navigation Controls Wrapper */}
      <div className="d-flex align-items-center ms-auto gap-1 gap-md-2">
        {/* Notification Bell*/}
        <ul className="navbar-nav">
          <li className="nav-item dropdown">
            <a
              className="nav-link d-flex align-items-center px-1 px-lg-2"
              id="navbarNotificationsDropdown"
              href="#"
              role="button"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              <span className="position-relative d-inline-block">
                <i className="fas fa-bell fa-lg"></i>
                <span
                  className="position-absolute top-0 start-100 translate-middle bg-danger border border-dark rounded-circle"
                  style={{ width: 7, height: 7 }}
                >
                  <span className="visually-hidden">New notifications</span>
                </span>
              </span>
              <i className="fas fa-caret-down text-secondary" style={{ fontSize: "0.65rem" }}></i>
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
              {/* Header with Icon */}
              <li>
                <div className="dropdown-header d-flex align-items-center gap-2 py-2 text-dark fw-bold" style={{ fontSize: "inherit" }}>
                  <i className="fas fa-bell fa-fw opacity-75 pt-1"></i>
                  Notifications
                </div>
              </li>
              <li>
                <hr className="dropdown-divider mt-1" />
              </li>

              {/* Notification Items */}
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

              {/* Footer Action */}
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

        {/* Navbar Dropdown */}
        <ul className="navbar-nav">
          <li className="nav-item dropdown">
            <a
              className="nav-link d-flex align-items-center gap-2 px-1 px-lg-2"
              id="navbarDropdown"
              href="#"
              role="button"
              data-bs-toggle="dropdown"
              aria-expanded="false"
              style={{ fontSize: "0.95rem" }}
            >
              {user.avatarImage ? (
                <img src={user.avatarImage} alt={user.name} className="rounded-circle" style={{ width: 28, height: 28, objectFit: "cover" }} />
              ) : (
                <span
                  className="d-inline-flex align-items-center justify-content-center rounded-circle text-white fw-semibold"
                  style={{ width: 28, height: 28, fontSize: "0.75rem", background: user.avatarColor }}
                >
                  {initialsOf(user.name)}
                </span>
              )}
              <i className="fas fa-caret-down text-secondary" style={{ fontSize: "0.65rem" }}></i>
            </a>

            <ul
              className="dropdown-menu dropdown-menu-end position-absolute shadow-sm"
              aria-labelledby="navbarDropdown"
              style={{ fontSize: "0.9rem" }}
            >
              {/* Name Header */}
              <li>
                <div className="dropdown-header py-2" style={{ fontSize: "inherit" }}>
                  <div className="d-flex align-items-center gap-2 text-dark fw-bold">
                    <i className="fas fa-user-shield fa-fw opacity-75"></i>
                    {user.name}
                  </div>
                  <div className="text-muted small ps-4">{user.role}</div>
                </div>
              </li>
              <li>
                <hr className="dropdown-divider mt-1" />
              </li>

              {/* My Profile */}
              <li>
                <Link className="dropdown-item d-flex align-items-center gap-2 py-2" to="/profile">
                  <i className="fas fa-id-badge fa-fw opacity-75"></i>
                  My Profile
                </Link>
              </li>

              {/* Settings */}
              <li>
                <Link className="dropdown-item d-flex align-items-center gap-2 py-2" to="/settings">
                  <i className="fas fa-gear fa-fw opacity-75"></i>
                  Settings
                </Link>
              </li>

              {/* Activity Log */}
              <li>
                <Link className="dropdown-item d-flex align-items-center gap-2 py-2" to="/activity-log">
                  <i className="fas fa-list-check fa-fw opacity-75"></i>
                  Activity Log
                </Link>
              </li>
              <li>
                <hr className="dropdown-divider" />
              </li>

              {/* Theme Toggle */}
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

              {/* Logout */}
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
