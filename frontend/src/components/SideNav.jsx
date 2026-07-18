import { NavLink } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";

const NAV_ITEMS = [
  { to: "/", label: "Dashboard", icon: "fa-gauge-high", end: true },
  { to: "/payroll", label: "Payroll", icon: "fa-money-check-dollar" },
  { to: "/billing", label: "Billing", icon: "fa-file-invoice-dollar" },
  { to: "/timesheet", label: "Timesheet Upload", icon: "fa-file-import" },
  { to: "/employees", label: "Employees", icon: "fa-users" },
  { to: "/clients", label: "Clients", icon: "fa-building" },
];

export default function SideNav() {
  const { theme } = useTheme();

  function navLinkClass({ isActive }) {
    const baseClasses = "nav-link mx-2 rounded fs-7 fs-md-6 py-2 py-md-3";
    if (!isActive) return `${baseClasses} collapsed`;
    return theme === "light"
      ? `${baseClasses} active text-reset bg-secondary bg-opacity-10`
      : `${baseClasses} active text-reset bg-white bg-opacity-10`;
  }

  return (
    <nav className={`sb-sidenav accordion sb-sidenav-${theme} border-end`} id="sidenavAccordion">
      {/* Sidebar Menu */}
      <div className="sb-sidenav-menu">
        <div className="nav">
          <div className="sb-sidenav-menu-heading fs-8 fs-md-7 text-uppercase tracking-wider">Menu</div>
          {NAV_ITEMS.map((item) => (
            <NavLink className={navLinkClass} to={item.to} end={item.end} key={item.to}>
              {({ isActive }) => (
                <>
                  <div className={`sb-nav-link-icon me-2 ${isActive ? "text-secondary text-opacity-75" : ""}`} style={{ minWidth: "1.5rem" }}>
                    <i className={`fas ${item.icon} fa-fw`}></i>{" "}
                  </div>
                  <span className="text-wrap">{item.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </div>

      {/* Footer Element */}
      <div className="sb-sidenav-footer">
        <div
          className={`d-flex align-items-center w-100 text-reset text-decoration-none ${theme === "light" ? "help-footer-btn-light" : "help-footer-btn-dark"} fs-7 fs-md-6`}
          style={{
            cursor: "pointer",
            transition: "color 0.15s ease-in-out",
          }}
          onClick={() => console.log("Help clicked")}
        >
          <div className="sb-nav-link-icon me-2 d-flex align-items-center" style={{ minWidth: "1.5rem" }}>
            <i className="far fa-circle-question fa-fw"></i>
          </div>
          <span>Help</span>
        </div>
      </div>
    </nav>
  );
}
