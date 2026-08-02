import { NavLink } from "react-router";
import { useTheme } from "../context/ThemeContext";

const NAV_ITEMS = [
  { to: "/", label: "Dashboard", icon: "fa-table-cells-large", end: true },
  { to: "/payroll", label: "Payroll", icon: "fa-sack-dollar" },
  { to: "/billing", label: "Billing", icon: "fa-receipt" },
  { to: "/timesheet", label: "Timesheet", icon: "fa-cloud-arrow-up" },
  { to: "/employees", label: "Employees", icon: "fa-users" },
  { to: "/clients", label: "Clients", icon: "fa-building" },
];

// SideNav — sidebar navigation menu with a Help footer.
export default function SideNav({ onNavItemSelect }) {
  const { theme } = useTheme();

  function navLinkClass({ isActive }) {
    const baseClasses = "nav-link mx-2 rounded py-2 py-md-3";
    return isActive ? `${baseClasses} active` : `${baseClasses} collapsed`;
  }

  return (
    <nav className={`sb-sidenav accordion sb-sidenav-${theme} border-end`} id="sidenavAccordion">
      <div className="sb-sidenav-menu">
        <div className="nav">
          <div className="sb-sidenav-menu-heading text-uppercase">Menu</div>
          {NAV_ITEMS.map((item) => (
            <NavLink className={navLinkClass} to={item.to} end={item.end} key={item.to} title={item.label} onClick={onNavItemSelect}>
              {() => (
                <>
                  <div className="sb-nav-link-icon me-2" style={{ minWidth: "1.5rem" }}>
                    <i className={`fas ${item.icon} fa-fw`}></i>{" "}
                  </div>
                  <span className="text-wrap">{item.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </div>

      <div className="sb-sidenav-footer">
        <div
          className={`d-flex align-items-center w-100 text-decoration-none ${theme === "light" ? "help-footer-btn-light" : "help-footer-btn-dark"}`}
          style={{
            cursor: "pointer",
            transition: "color 0.15s ease-in-out",
          }}
          title="Help"
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
