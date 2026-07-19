import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useTheme } from "../context/ThemeContext.jsx";
import { useCurrentUser } from "../context/CurrentUserContext.jsx";
import { useNotifications } from "../context/NotificationsContext.jsx";

// Returns up to two uppercase initials from a full name.
function initialsOf(name = "") {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0].toUpperCase())
    .join("");
}

// NotificationsMenu — notifications dropdown shared by the desktop and mobile triggers.
function NotificationsMenu({ id, align = "end" }) {
  const { notifications } = useNotifications();
  const recent = notifications.slice(0, 3);

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
      {recent.length === 0 && (
        <li>
          <div className="dropdown-item-text py-2 text-muted small">No notifications yet.</div>
        </li>
      )}
      {recent.map((n, i) => (
        <li key={n.id}>
          <Link
            className={`dropdown-item py-2 text-wrap ${i < recent.length - 1 ? "border-bottom border-light-subtle" : ""}`}
            to="/notifications"
            style={{
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            <span className={!n.read ? "fw-semibold" : ""}>
              {n.title} {n.bold} {n.sub}
            </span>
          </Link>
        </li>
      ))}
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

// NotificationsTrigger — notification bell icon button.
function NotificationsTrigger({ id }) {
  const { unreadCount } = useNotifications();

  return (
    <a className="nav-icon-btn text-decoration-none" id={id} href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
      <span className="position-relative d-inline-block">
        <i className="fas fa-bell"></i>
        {unreadCount > 0 && (
          <span
            className="position-absolute top-0 start-100 translate-middle rounded-circle"
            style={{ width: 8, height: 8, background: "#ff9c55", border: "1.5px solid var(--bs-body-bg)" }}
          >
            <span className="visually-hidden">New notifications</span>
          </span>
        )}
      </span>
    </a>
  );
}

// UserTrigger — user avatar + name dropdown trigger.
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

// UserMenu — user dropdown with profile, settings, activity log, and logout.
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

// TopNav — fixed top navbar with brand, sidebar toggle, theme switch, notifications, and user menu.
export default function TopNav({ onToggleSidebar }) {
  const { theme, setTheme } = useTheme();
  const { user } = useCurrentUser();
  const isDark = theme === "dark";
  const [mobileControlsOpen, setMobileControlsOpen] = useState(false);
  const navRef = useRef(null);

  const toggleTheme = () => {
    setTheme(isDark ? "light" : "dark");
  };

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
      <div className="d-flex align-items-center w-100 position-relative">
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

        <button className="nav-icon-btn me-1 me-lg-0 ms-0 ms-md-3 ms-lg-4" id="sidebarToggle" onClick={onToggleSidebar}>
          <i className="fas fa-bars"></i>
        </button>

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
