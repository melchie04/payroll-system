import { useState } from "react";

// --- status -> Bootstrap color mapping -------------------------------------
const statusVariant = {
  Ready: "success",
  Active: "success",
  Paid: "success",
  "On Track": "success",
  Extracted: "success",
  Pending: "warning",
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

export function Badge({ status }) {
  const variant = statusVariant[status] || "secondary";
  const textClass = variant === "warning" ? "text-dark" : "";
  return (
    <span className={`badge rounded-pill bg-${variant} ${textClass}`}>
      {status}
    </span>
  );
}

export function BtnPrimary({
  children,
  onClick,
  type = "button",
  className = "",
  ...rest
}) {
  return (
    <button
      type={type}
      className={`btn btn-dark btn-sm d-inline-flex align-items-center gap-2 ${className}`}
      onClick={onClick}
      {...rest}
    >
      {children}
    </button>
  );
}

export function BtnSecondary({
  children,
  onClick,
  type = "button",
  className = "",
  ...rest
}) {
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

export function IconBtn({ children, title, onClick, className = "", ...rest }) {
  return (
    <button
      type="button"
      className={`btn btn-sm btn-link text-muted p-1 ${className}`}
      title={title}
      onClick={onClick}
      {...rest}
    >
      {children}
    </button>
  );
}

export function StatCard({ label, value, sub, valueColor, subColor }) {
  return (
    <div className="card h-100">
      <div className="card-body">
        <div
          className="text-uppercase text-muted fw-semibold mb-1 small"
          style={{ fontSize: 11, letterSpacing: 0.5 }}
        >
          {label}
        </div>
        <div
          className="fs-4 fw-bold"
          style={valueColor ? { color: valueColor } : undefined}
        >
          {value}
        </div>
        {sub && (
          <div
            className="small mt-1"
            style={{ color: subColor || "var(--bs-secondary-color)" }}
          >
            {sub}
          </div>
        )}
      </div>
    </div>
  );
}

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

export function Table({ headers, children }) {
  return (
    <div className="table-responsive">
      <table className="table table-hover mb-0 align-middle">
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
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

export function Tr({ children }) {
  return <tr className="small">{children}</tr>;
}

export function Td({ children, bold, className = "" }) {
  return (
    <td
      className={`${bold ? "fw-semibold" : ""} small py-3 py-md-2 ${className}`}
    >
      {children}
    </td>
  );
}

export function Pagination({ current = 1, total = 1, label }) {
  const [page, setPage] = useState(current);
  const pages = Array.from({ length: Math.min(total, 5) }, (_, i) => i + 1);

  return (
    <div className="d-flex flex-column flex-md-row align-items-center justify-content-between flex-wrap gap-2 px-3 py-2 border-top small">
      <span className="small text-muted">{label}</span>
      <nav aria-label="Pagination">
        <ul className="pagination pagination-sm mb-0">
          <li className={`page-item ${page === 1 ? "disabled" : ""}`}>
            <button
              className="page-link"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              &lsaquo;
            </button>
          </li>
          {pages.map((n) => (
            <li className={`page-item ${n === page ? "active" : ""}`} key={n}>
              <button className="page-link" onClick={() => setPage(n)}>
                {n}
              </button>
            </li>
          ))}
          <li className={`page-item ${page === total ? "disabled" : ""}`}>
            <button
              className="page-link"
              onClick={() => setPage((p) => Math.min(total, p + 1))}
            >
              &rsaquo;
            </button>
          </li>
        </ul>
      </nav>
    </div>
  );
}

export function FilterSelect({ label, children }) {
  return (
    <div>
      {label && (
        <label
          className="form-label text-uppercase text-muted fw-semibold mb-1 d-block"
          style={{ fontSize: 11, letterSpacing: 0.5 }}
        >
          {label}
        </label>
      )}
      <select className="form-select form-select-sm">{children}</select>
    </div>
  );
}

export function SearchInput({ placeholder }) {
  return (
    <div className="input-group input-group-sm w-100">
      <span className="input-group-text bg-white">
        <i className="fas fa-search text-muted"></i>
      </span>
      <input type="text" className="form-control" placeholder={placeholder} />
    </div>
  );
}

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

export function ActionsMenu({ items }) {
  return (
    <div className="dropdown">
      <IconBtn title="More" data-bs-toggle="dropdown" aria-expanded="false">
        <i className="fas fa-ellipsis-vertical"></i>
      </IconBtn>
      <ul
        className="dropdown-menu dropdown-menu-end shadow-sm"
        style={{ fontSize: "0.85rem" }}
      >
        {items.map((item, i) =>
          item.divider ? (
            <li key={`divider-${i}`}>
              <hr className="dropdown-divider" />
            </li>
          ) : (
            <li key={item.label}>
              <button
                type="button"
                className={`dropdown-item d-flex align-items-center gap-2 ${
                  item.danger ? "text-danger" : ""
                }`}
                onClick={item.onClick}
                data-bs-toggle={item.modalTarget ? "modal" : undefined}
                data-bs-target={
                  item.modalTarget ? `#${item.modalTarget}` : undefined
                }
              >
                {item.icon && (
                  <i className={`fas ${item.icon} fa-fw opacity-75`}></i>
                )}
                {item.label}
              </button>
            </li>
          ),
        )}
      </ul>
    </div>
  );
}

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
      <div
        className="dropdown-menu dropdown-menu-end shadow-sm p-3"
        style={{ minWidth: 240 }}
      >
        <div
          className="text-uppercase text-muted fw-semibold mb-2 small"
          style={{ fontSize: 11, letterSpacing: 0.5 }}
        >
          Filter Options
        </div>
        <div className="d-flex flex-column gap-3">{children}</div>
        <hr className="my-3" />
        <div className="d-flex justify-content-between gap-2">
          <button
            type="button"
            className="btn btn-sm btn-outline-secondary w-50"
            onClick={onReset}
          >
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

export function FilterCheckGroup({ label, options }) {
  return (
    <div>
      <div
        className="text-uppercase text-muted fw-semibold mb-1"
        style={{ fontSize: 10.5, letterSpacing: 0.5 }}
      >
        {label}
      </div>
      {options.map((opt) => (
        <div className="form-check" key={opt}>
          <input
            className="form-check-input"
            type="checkbox"
            id={`chk-${label}-${opt}`.replace(/\s+/g, "-")}
          />
          <label
            className="form-check-label small"
            htmlFor={`chk-${label}-${opt}`.replace(/\s+/g, "-")}
          >
            {opt}
          </label>
        </div>
      ))}
    </div>
  );
}

export function Modal({ id, title, children, footer, size = "" }) {
  return (
    <div
      className="modal fade"
      id={id}
      tabIndex="-1"
      aria-labelledby={`${id}Label`}
      aria-hidden="true"
    >
      <div className={`modal-dialog modal-dialog-centered ${size}`}>
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title fw-semibold" id={`${id}Label`}>
              {title}
            </h5>
            <button
              type="button"
              className="btn-close"
              data-bs-dismiss="modal"
              aria-label="Close"
            ></button>
          </div>
          <div className="modal-body">{children}</div>
          {footer && <div className="modal-footer">{footer}</div>}
        </div>
      </div>
    </div>
  );
}

export function FormField({ label, children }) {
  return (
    <div className="mb-3">
      <label
        className="form-label text-uppercase text-muted fw-semibold mb-1 d-block"
        style={{ fontSize: 11, letterSpacing: 0.5 }}
      >
        {label}
      </label>
      {children}
    </div>
  );
}
