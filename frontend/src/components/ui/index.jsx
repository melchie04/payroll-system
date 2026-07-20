import { Children, cloneElement, createContext, isValidElement, useContext, useEffect, useState } from "react";

// Shared UI building blocks used across all pages.
const statusVariant = {
  Ready: "success",
  Active: "success",
  Paid: "success",
  "On Track": "success",
  Extracted: "success",
  Approved: "success",
  Covered: "success",
  Pending: "warning",
  "Needs Review": "warning",
  "Not Covered": "danger",
  "At Risk": "warning",
  "Partially Paid": "warning",
  "On Leave": "warning",
  Overdue: "danger",
  Delayed: "danger",
  Failed: "danger",
  Inactive: "danger",
  Sent: "primary",
  Processing: "primary",
  Completed: "secondary",
};

// Badge — status pill colored by status value.
export function Badge({ status }) {
  const variant = statusVariant[status] || "secondary";
  return <span className={`badge rounded-pill status-badge status-badge-${variant}`}>{status}</span>;
}

// BtnPrimary — dark primary action button.
export function BtnPrimary({ children, onClick, type = "button", className = "", ...rest }) {
  return (
    <button type={type} className={`btn btn-dark btn-sm d-inline-flex align-items-center gap-2 ${className}`} onClick={onClick} {...rest}>
      {children}
    </button>
  );
}

// BtnDanger — destructive action button.
export function BtnDanger({ children, onClick, type = "button", className = "", ...rest }) {
  return (
    <button type={type} className={`btn btn-danger btn-sm d-inline-flex align-items-center gap-2 ${className}`} onClick={onClick} {...rest}>
      {children}
    </button>
  );
}

// BtnSecondary — outlined secondary action button.
export function BtnSecondary({ children, onClick, type = "button", className = "", ...rest }) {
  return (
    <button
      type={type}
      className={`btn btn-outline-secondary btn-sm d-inline-flex align-items-center gap-2 ${className}`}
      onClick={onClick}
      {...rest}
    >
      {children}
    </button>
  );
}

// IconBtn — small icon-only button.
export function IconBtn({ children, title, onClick, className = "", ...rest }) {
  return (
    <button type="button" className={`btn btn-sm btn-link text-muted p-1 ${className}`} title={title} onClick={onClick} {...rest}>
      {children}
    </button>
  );
}

// StatCard — summary metric card.
export function StatCard({ label, value, sub, valueColor, subColor }) {
  return (
    <div className="card h-100">
      <div className="card-body">
        <div className="text-uppercase text-muted fw-semibold mb-1 small" style={{ fontSize: 11, letterSpacing: 0.5 }}>
          {label}
        </div>
        <div className="fs-4 fw-bold" style={valueColor ? { color: valueColor } : undefined}>
          {value}
        </div>
        {sub && (
          <div className="small mt-1" style={{ color: subColor || "var(--bs-secondary-color)" }}>
            {sub}
          </div>
        )}
      </div>
    </div>
  );
}

// DataCard — card with an optional header title and action.
export function DataCard({ title, action, children }) {
  return (
    <div className="card h-100">
      {title && (
        <div className="card-header d-flex align-items-center justify-content-between">
          <span className="fw-semibold">{title}</span>
          {action}
        </div>
      )}
      {children}
    </div>
  );
}

// Tracks the breakpoint where tables switch to their stacked layout (see _table.scss).
const STACKED_TABLE_QUERY = "(max-width: 767.98px)";

function useStackedTable() {
  const [stacked, setStacked] = useState(() => window.matchMedia(STACKED_TABLE_QUERY).matches);

  useEffect(() => {
    const query = window.matchMedia(STACKED_TABLE_QUERY);
    const handleChange = (e) => setStacked(e.matches);
    query.addEventListener("change", handleChange);
    return () => query.removeEventListener("change", handleChange);
  }, []);

  return stacked;
}

// Column headers, shared with Tr so each cell can label itself on mobile.
const TableHeadersContext = createContext([]);

// Table — responsive table that stacks into cards on mobile and paginates itself.
export function Table({ headers, children, pageSize = 20, mobilePageSize = 5, itemLabel = "records" }) {
  const rows = Children.toArray(children);
  const stacked = useStackedTable();
  const [page, setPage] = useState(1);

  const perPage = stacked ? mobilePageSize : pageSize;
  const totalPages = Math.max(1, Math.ceil(rows.length / perPage));
  if (page > totalPages) setPage(totalPages);

  const paginated = rows.length > perPage;
  const start = (page - 1) * perPage;
  const visible = paginated ? rows.slice(start, start + perPage) : rows;

  return (
    <TableHeadersContext.Provider value={headers}>
      <div className="table-responsive">
        <table className="table table-hover table-stack mb-0 align-middle">
          <thead className="table-light">
            <tr>
              {headers.map((h, i) => (
                <th
                  key={i}
                  className={`text-uppercase text-muted small fw-semibold text-nowrap ${h.props?.className || ""}`}
                  style={{ fontSize: 11, letterSpacing: 0.5 }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>{visible}</tbody>
        </table>
      </div>
      {paginated && (
        <Pagination
          page={page}
          totalPages={totalPages}
          onChange={setPage}
          label={`Showing ${start + 1} to ${Math.min(start + perPage, rows.length)} of ${rows.length} ${itemLabel}`}
        />
      )}
    </TableHeadersContext.Provider>
  );
}

// Tr — table row; passes each column header down to its cells.
export function Tr({ children }) {
  const headers = useContext(TableHeadersContext);

  return (
    <tr className="small">
      {Children.map(children, (child, i) =>
        isValidElement(child) ? cloneElement(child, { label: typeof headers[i] === "string" ? headers[i] : undefined }) : child,
      )}
    </tr>
  );
}

// Td — table cell.
export function Td({ children, bold, className = "", label }) {
  return (
    <td className={`${bold ? "fw-semibold" : ""} small py-md-2 ${className}`} data-label={label}>
      {children}
    </td>
  );
}

// Pagination — table footer pager, rendered by Table when the rows overflow one page.
function Pagination({ page, totalPages, onChange, label }) {
  const windowSize = 5;
  let first = Math.max(1, page - Math.floor(windowSize / 2));
  const last = Math.min(totalPages, first + windowSize - 1);
  first = Math.max(1, last - windowSize + 1);
  const pages = Array.from({ length: last - first + 1 }, (_, i) => first + i);

  return (
    <div className="d-flex flex-column flex-md-row align-items-center justify-content-between flex-wrap gap-2 px-3 py-2 border-top small">
      <span className="small text-muted">{label}</span>
      <nav aria-label="Pagination">
        <ul className="pagination pagination-sm mb-0">
          <li className={`page-item ${page === 1 ? "disabled" : ""}`}>
            <button className="page-link" onClick={() => onChange(Math.max(1, page - 1))}>
              &lsaquo;
            </button>
          </li>
          {pages.map((n) => (
            <li className={`page-item ${n === page ? "active" : ""}`} key={n}>
              <button className="page-link" onClick={() => onChange(n)}>
                {n}
              </button>
            </li>
          ))}
          <li className={`page-item ${page === totalPages ? "disabled" : ""}`}>
            <button className="page-link" onClick={() => onChange(Math.min(totalPages, page + 1))}>
              &rsaquo;
            </button>
          </li>
        </ul>
      </nav>
    </div>
  );
}

// FilterSelect — labeled select dropdown for filters.
export function FilterSelect({ label, children, ...rest }) {
  return (
    <div>
      {label && (
        <label className="form-label text-uppercase text-muted fw-semibold mb-1 d-block" style={{ fontSize: 11, letterSpacing: 0.5 }}>
          {label}
        </label>
      )}
      <select className="form-select form-select-sm" {...rest}>
        {children}
      </select>
    </div>
  );
}

// SearchInput — search box with a leading icon.
export function SearchInput({ label, placeholder }) {
  return (
    <div className="w-100">
      {label && (
        <label className="form-label text-uppercase text-muted fw-semibold mb-1 d-block" style={{ fontSize: 11, letterSpacing: 0.5 }}>
          {label}
        </label>
      )}
      <div className="input-group input-group-sm w-100">
        <span className="input-group-text bg-white">
          <i className="fas fa-search text-muted"></i>
        </span>
        <input type="text" className="form-control" placeholder={placeholder} />
      </div>
    </div>
  );
}

// PageHeader — page title, description, and action buttons.
export function PageHeader({ title, description, actions }) {
  return (
    <div className="d-flex flex-wrap justify-content-between align-items-start mb-4 gap-2">
      <div>
        <h1 className="h4 fw-bold mb-1">{title}</h1>
        {description && <p className="text-muted small mb-0">{description}</p>}
      </div>
      {actions && <div className="d-flex gap-2">{actions}</div>}
    </div>
  );
}

// TabsNav — page tab navigation; styling and states live in _tabs.scss.
export function TabsNav({ tabs, active, onChange }) {
  return (
    <div className="tabs-nav">
      {tabs.map((t) => {
        const isActive = active === t.key;
        return (
          <button
            key={t.key}
            type="button"
            className={`tabs-nav-item ${isActive ? "active" : ""}`}
            aria-current={isActive ? "page" : undefined}
            onClick={() => onChange(t.key)}
          >
            {t.icon && <i className={`fas ${t.icon} opacity-75`}></i>}
            <span>{t.label}</span>
            {t.badge ? <span className="badge rounded-pill bg-danger">{t.badge}</span> : null}
          </button>
        );
      })}
    </div>
  );
}

// ActionsMenu — per-row "..." dropdown menu.
export function ActionsMenu({ items }) {
  return (
    <div className="dropdown">
      <IconBtn title="More" data-bs-toggle="dropdown" aria-expanded="false">
        <i className="fas fa-ellipsis-vertical"></i>
      </IconBtn>
      <ul className="dropdown-menu dropdown-menu-end shadow-sm py-2" style={{ fontSize: "0.85rem", minWidth: 190 }}>
        {items.map((item, i) =>
          item.divider ? (
            <li key={`divider-${i}`}>
              <hr className="dropdown-divider" />
            </li>
          ) : (
            <li key={item.label}>
              <button
                type="button"
                className={`dropdown-item d-flex align-items-center gap-2 py-2 ${item.danger ? "text-danger" : ""}`}
                onClick={item.onClick}
                data-bs-toggle={item.modalTarget ? "modal" : undefined}
                data-bs-target={item.modalTarget ? `#${item.modalTarget}` : undefined}
              >
                {item.icon && <i className={`fas ${item.icon} fa-fw opacity-75`}></i>}
                <span className="text-nowrap">{item.label}</span>
              </button>
            </li>
          ),
        )}
      </ul>
    </div>
  );
}

// ExportMenu — CSV export / print dropdown.
export function ExportMenu({ onExportCsv, label = "Export" }) {
  return (
    <div className="dropdown">
      <button
        type="button"
        className="btn btn-outline-secondary btn-sm d-inline-flex align-items-center gap-2"
        data-bs-toggle="dropdown"
        aria-expanded="false"
      >
        <i className="fas fa-download"></i> {label}
      </button>
      <ul className="dropdown-menu dropdown-menu-end shadow-sm">
        <li>
          <button type="button" className="dropdown-item d-flex align-items-center gap-2" onClick={onExportCsv}>
            <i className="fas fa-file-csv fa-fw opacity-75"></i> Export as CSV
          </button>
        </li>
        <li>
          <button type="button" className="dropdown-item d-flex align-items-center gap-2" onClick={() => window.print()}>
            <i className="fas fa-file-pdf fa-fw opacity-75"></i> Print / Save as PDF
          </button>
        </li>
      </ul>
    </div>
  );
}

// FilterMenu — filter options dropdown panel with reset/apply.
export function FilterMenu({ children, onReset }) {
  return (
    <div className="dropdown">
      <button
        type="button"
        className="btn btn-outline-secondary bg-white text-muted d-flex align-items-center justify-content-center flex-shrink-0"
        title="Filter Options"
        data-bs-toggle="dropdown"
        aria-expanded="false"
        style={{
          width: "31px",
          height: "31px",
          borderRadius: "6px",
          borderColor: "#d1d5db",
          fontSize: "12px",
        }}
      >
        <i className="fas fa-filter"></i>
      </button>
      <div className="dropdown-menu dropdown-menu-end shadow-sm p-3" style={{ minWidth: 240 }}>
        <div className="text-uppercase text-muted fw-semibold mb-2 small" style={{ fontSize: 11, letterSpacing: 0.5 }}>
          Filter Options
        </div>
        <div className="d-flex flex-column gap-3">{children}</div>
        <hr className="my-3" />
        <div className="d-flex justify-content-between gap-2">
          <button type="button" className="btn btn-sm btn-outline-secondary w-50" onClick={onReset}>
            Reset
          </button>
          <button type="button" className="btn btn-sm btn-dark w-50">
            Apply
          </button>
        </div>
      </div>
    </div>
  );
}

// FilterCheckGroup — labeled checkbox group inside FilterMenu.
export function FilterCheckGroup({ label, options }) {
  return (
    <div>
      <div className="text-uppercase text-muted fw-semibold mb-1" style={{ fontSize: 10.5, letterSpacing: 0.5 }}>
        {label}
      </div>
      {options.map((opt) => (
        <div className="form-check" key={opt}>
          <input className="form-check-input" type="checkbox" id={`chk-${label}-${opt}`.replace(/\s+/g, "-")} />
          <label className="form-check-label small" htmlFor={`chk-${label}-${opt}`.replace(/\s+/g, "-")}>
            {opt}
          </label>
        </div>
      ))}
    </div>
  );
}

// RequirementRow — password requirement checklist row.
export function RequirementRow({ met, label }) {
  return (
    <div className="d-flex align-items-center gap-2">
      <i
        className={`fas ${met ? "fa-circle-check text-success" : "fa-circle text-muted"}`}
        style={{ fontSize: "0.7rem", opacity: met ? 1 : 0.4 }}
      ></i>
      <span className={met ? "text-dark" : "text-muted"} style={{ fontSize: "0.8rem" }}>
        {label}
      </span>
    </div>
  );
}

// Modal — Bootstrap modal wrapper with title, body, and footer.
export function Modal({ id, title, children, footer, size = "" }) {
  return (
    <div className="modal fade" id={id} tabIndex="-1" aria-labelledby={`${id}Label`} aria-hidden="true">
      <div className={`modal-dialog modal-dialog-centered ${size}`}>
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title fw-semibold" id={`${id}Label`}>
              {title}
            </h5>
            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div className="modal-body">{children}</div>
          {footer && <div className="modal-footer">{footer}</div>}
        </div>
      </div>
    </div>
  );
}

// SectionHeading — groups a set of form fields. Deliberately outranks the
// FormField label, which is uppercase, muted and 11px.
export function SectionHeading({ children }) {
  return (
    <div className="fw-semibold text-body mb-3 pb-2 border-bottom" style={{ fontSize: "0.8125rem" }}>
      {children}
    </div>
  );
}

// FormField — labeled form field wrapper.
export function FormField({ label, children }) {
  return (
    <div className="mb-3">
      <label className="form-label text-uppercase text-muted fw-semibold mb-1 d-block" style={{ fontSize: 11, letterSpacing: 0.5 }}>
        {label}
      </label>
      {children}
    </div>
  );
}

// DetailList — bordered list of detail rows.
export function DetailList({ children }) {
  return (
    <div className="border rounded-3 overflow-hidden">
      <div className="list-group list-group-flush">{children}</div>
    </div>
  );
}

// DetailRow — icon + label + value detail row.
export function DetailRow({ icon, label, children }) {
  return (
    <div className="list-group-item d-flex flex-column flex-sm-row align-items-sm-center gap-1 gap-sm-3 py-2 px-3">
      <div className="d-flex align-items-center gap-2 text-muted flex-shrink-0" style={{ minWidth: 170 }}>
        <span
          className="d-inline-flex align-items-center justify-content-center rounded-circle bg-light text-secondary flex-shrink-0"
          style={{ width: 28, height: 28, fontSize: "0.8rem" }}
        >
          <i className={`fas ${icon} fa-fw`}></i>
        </span>
        <span style={{ fontSize: "0.82rem" }}>{label}</span>
      </div>
      <div className="fw-semibold" style={{ fontSize: "0.92rem" }}>
        {children}
      </div>
    </div>
  );
}

const statusDotColor = {
  Active: "#198754",
  Ready: "#198754",
  Paid: "#198754",
  "On Leave": "#997404",
  "At Risk": "#997404",
  Pending: "#997404",
  Inactive: "#6c757d",
  Overdue: "#dc3545",
};

// ProfileHeader — avatar initials, name, and status dot header.
export function ProfileHeader({ name, subtitle, subtitleIcon, status }) {
  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0].toUpperCase())
    .join("");

  return (
    <div className="d-flex align-items-center gap-3 pb-3 mb-3 border-bottom">
      <div className="position-relative flex-shrink-0">
        <div
          className="d-flex align-items-center justify-content-center rounded-circle bg-dark text-white fw-semibold"
          style={{ width: 60, height: 60, fontSize: "1.2rem" }}
        >
          {initials}
        </div>
        <span
          className="position-absolute bottom-0 end-0 rounded-circle border border-2 border-white"
          style={{
            width: 15,
            height: 15,
            background: statusDotColor[status] || "#6c757d",
          }}
        ></span>
      </div>
      <div>
        <div className="fw-bold fs-5 mb-0">{name}</div>
        {subtitle && (
          <div className="text-muted d-flex align-items-center gap-1" style={{ fontSize: "0.85rem" }}>
            {subtitleIcon && <i className={`fas ${subtitleIcon}`} style={{ fontSize: "0.75rem" }}></i>}
            {subtitle}
          </div>
        )}
      </div>
    </div>
  );
}

// PayslipDetails — payslip breakdown with summary, deductions, and net pay.
export function PayslipDetails({ employeeName, subtitle, status, period, summaryRows, deductionRows, netPay }) {
  return (
    <div>
      <ProfileHeader name={employeeName} subtitle={subtitle} subtitleIcon="fa-briefcase" status={status} />
      <div className="text-muted small mb-2">Pay Period: {period}</div>
      <DetailList>
        {summaryRows.map((r) => (
          <DetailRow key={r.label} icon={r.icon} label={r.label}>
            {r.value}
          </DetailRow>
        ))}
      </DetailList>
      <div className="text-uppercase text-muted fw-semibold mt-3 mb-2" style={{ fontSize: 11, letterSpacing: 0.5 }}>
        Deductions
      </div>
      <DetailList>
        {deductionRows.map((r) => (
          <DetailRow key={r.label} icon={r.icon} label={r.label}>
            {r.value}
          </DetailRow>
        ))}
      </DetailList>
      <div className="d-flex justify-content-between align-items-center border-top pt-3 mt-3">
        <span className="fw-semibold">Net Pay</span>
        <span className="fw-bold fs-5">{netPay}</span>
      </div>
    </div>
  );
}
