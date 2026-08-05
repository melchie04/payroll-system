// The collapsible sidebar holding the main navigation.

import { NavLink } from "react-router";

const NAV_ITEMS = [
  { to: "/", label: "Dashboard", icon: "fa-table-cells-large", end: true },
  { to: "/payroll", label: "Payroll", icon: "fa-sack-dollar" },
  { to: "/billing", label: "Billing", icon: "fa-receipt" },
  { to: "/timesheet", label: "Timesheet", icon: "fa-cloud-arrow-up" },
  { to: "/employees", label: "Employees", icon: "fa-users" },
  { to: "/clients", label: "Clients", icon: "fa-building" },
];

// Renders the nav items, marking the one matching the current route.
export default function SideNav({ onNavItemSelect }) {
  // Adds the active class when React Router says this link is the current page.
  function navLinkClass({ isActive }) {
    const baseClasses = "nav-link mx-2 rounded py-2 py-md-3";
    return isActive ? `${baseClasses} active` : `${baseClasses} collapsed`;
  }

  return (
    <nav className="sb-sidenav accordion border-end" id="sidenavAccordion">
      <div className="sb-sidenav-menu">
        <div className="nav">
          <div className="sb-sidenav-menu-heading">Menu</div>
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
        <div className="help-footer-btn d-flex align-items-center w-100 text-decoration-none" title="Help">
          <div className="sb-nav-link-icon me-2 d-flex align-items-center" style={{ minWidth: "1.5rem" }}>
            <i className="far fa-circle-question fa-fw"></i>
          </div>
          <span>Help</span>
        </div>
      </div>
    </nav>
  );
}
