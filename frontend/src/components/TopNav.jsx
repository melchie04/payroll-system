import { useEffect, useRef, useState } from "react";
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

/* Shared notification dropdown menu — used by both the desktop trigger
   and the mobile trigger so the two stay in sync automatically. */
function NotificationsMenu({ id, align = "end" }) {
  return (
    <ul
      className={`topnav-dropdown-menu dropdown-menu dropdown-menu-${align} position-absolute shadow-sm`}
      aria-labelledby={id}
      style={{
        minWidth: "280px",
        maxWidth: "calc(100vw - 32px)",
        fontSize: "0.9rem",
      }}
    >
      <li>
        <div className="dropdown-header d-flex align-items-center gap-2 py-2 text-body fw-bold text-decoration-none" style={{ fontSize: "inherit" }}>
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
  );
}

/* Notification bell trigger — uses the same .nav-icon-btn class as
   every other topnav icon button (sidebar toggle, theme, "..."), so
   sizing/shape/hover are identical everywhere on desktop and mobile. */
function NotificationsTrigger({ id }) {
  return (
    <a className="nav-icon-btn text-decoration-none" id={id} href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
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
  );
}

/* User avatar + name trigger. nameClassName controls whether the name is
   hidden on very small screens (desktop copy) or always shown (mobile
   copy, where it has its own dedicated row so there's room for it). */
function UserTrigger({ id, user, nameClassName = "d-none d-sm-inline" }) {
  return (
    <a
      className="nav-user-btn d-flex align-items-center gap-2 text-decoration-none"
      id={id}
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
      <span className={`fw-medium text-body ${nameClassName}`}>{user.name}</span>
      <i className="fas fa-chevron-down text-secondary" style={{ fontSize: "0.6rem" }}></i>
    </a>
  );
}

/* Shared user dropdown menu — used by both the desktop trigger and the
   mobile trigger so profile/settings/logout stay in sync. */
function UserMenu({ id, user }) {
  return (
    <ul
      className="topnav-dropdown-menu dropdown-menu dropdown-menu-end position-absolute shadow-sm"
      aria-labelledby={id}
      style={{ maxWidth: "calc(100vw - 32px)", fontSize: "0.9rem" }}
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
        <Link className="dropdown-item d-flex align-items-center gap-2 py-2 text-danger" to="/login">
          <i className="fas fa-right-from-bracket fa-fw opacity-75"></i>
          Logout
        </Link>
      </li>
    </ul>
  );
}

export default function TopNav({ onToggleSidebar }) {
  const { theme, setTheme } = useTheme();
  const { user } = useCurrentUser();
  const isDark = theme === "dark";
  const [mobileControlsOpen, setMobileControlsOpen] = useState(false);
  const navRef = useRef(null);

  const toggleTheme = () => {
    setTheme(isDark ? "light" : "dark");
  };

  // This project's fixed-navbar layout (body.sb-nav-fixed) hardcodes a
  // 56px offset for the page content, matching the navbar's old fixed
  // single-row height. Now that the navbar can grow taller on mobile
  // (the quick-actions row below), that hardcoded offset would leave a
  // gap where the navbar has no background and the page content
  // underneath shows through / overlaps it. We measure the navbar's
  // real height here and publish it as --topnav-offset, which
  // custom.scss uses instead of the old hardcoded 56px.
  useEffect(() => {
    const navEl = navRef.current;
    if (!navEl) return undefined;

    const updateOffset = () => {
      document.documentElement.style.setProperty("--topnav-offset", `${navEl.offsetHeight}px`);
    };

    updateOffset();

    const resizeObserver = new ResizeObserver(updateOffset);
    resizeObserver.observe(navEl);
    window.addEventListener("resize", updateOffset);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", updateOffset);
    };
  }, [mobileControlsOpen]);

  return (
    <nav
      ref={navRef}
      className={`sb-topnav navbar navbar-expand flex-wrap ${isDark ? "navbar-dark bg-dark" : "navbar-light bg-white"} border-bottom px-2 px-md-3`}
    >
      {/* Row 1: brand, sidebar toggle, desktop controls / mobile "more" toggle.
          This is its own position:relative wrapper so the absolutely-centered
          mobile brand (see .nav-brand-mobile in custom.scss) centers within
          row 1's own height only — not the whole <nav>, which grows taller
          once row 2 (mobile quick-actions) is revealed below. */}
      <div className="d-flex align-items-center w-100 position-relative">
        {/* Navbar Brand*/}
        <Link
          className="nav-brand-mobile navbar-brand ps-1 ps-md-3 d-flex justify-content-center justify-content-md-start align-items-center gap-2"
          to="/"
        >
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
        <button className="nav-icon-btn me-1 me-lg-0 ms-0 ms-md-3 ms-lg-4" id="sidebarToggle" onClick={onToggleSidebar}>
          <i className="fas fa-bars"></i>
        </button>

        {/* Desktop Navigation Controls */}
        <div className="d-none d-md-flex align-items-center ms-auto gap-1 gap-md-2">
          <button type="button" className="nav-icon-btn" onClick={toggleTheme} aria-label="Toggle theme">
            <i className={`fas ${isDark ? "fa-moon" : "fa-sun"}`}></i>
          </button>

          <ul className="navbar-nav">
            <li className="nav-item dropdown">
              <NotificationsTrigger id="navbarNotificationsDropdown" />
              <NotificationsMenu id="navbarNotificationsDropdown" />
            </li>
          </ul>

          <ul className="navbar-nav">
            <li className="nav-item dropdown">
              <UserTrigger id="navbarDropdown" user={user} />
              <UserMenu id="navbarDropdown" user={user} />
            </li>
          </ul>
        </div>

        {/* Mobile "more" toggle — reveals the quick-actions row below */}
        <button
          type="button"
          className="nav-icon-btn d-md-none ms-auto"
          onClick={() => setMobileControlsOpen((open) => !open)}
          aria-expanded={mobileControlsOpen}
          aria-controls="topnavMobileControls"
          aria-label="Toggle quick actions"
        >
          <i className="fas fa-ellipsis"></i>
        </button>
      </div>

      {/* Mobile quick-actions row (theme, notifications, user) */}
      {mobileControlsOpen && (
        <div
          id="topnavMobileControls"
          className="nav-mobile-controls d-flex d-md-none align-items-center justify-content-between w-100 mt-2 pt-2 gap-2"
        >
          <div className="d-flex align-items-center gap-2">
            <button type="button" className="nav-icon-btn" onClick={toggleTheme} aria-label="Toggle theme">
              <i className={`fas ${isDark ? "fa-moon" : "fa-sun"}`}></i>
            </button>

            <div className="dropdown">
              <NotificationsTrigger id="navbarNotificationsDropdownMobile" />
              <NotificationsMenu id="navbarNotificationsDropdownMobile" align="start" />
            </div>
          </div>

          <div className="dropdown">
            <UserTrigger id="navbarDropdownMobile" user={user} nameClassName="d-inline" />
            <UserMenu id="navbarDropdownMobile" user={user} />
          </div>
        </div>
      )}
    </nav>
  );
}
