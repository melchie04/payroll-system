// The three dropdown menus: row actions, export and the filter funnel.

import { IconBtn } from "./Buttons.jsx";

// The row kebab menu; falsy items are dropped so callers can use conditionals.
export function ActionsMenu({ items }) {
  return (
    <div className="dropdown">
      <IconBtn title="More" data-bs-toggle="dropdown" aria-expanded="false">
        <i className="fas fa-ellipsis-vertical"></i>
      </IconBtn>
      <ul className="dropdown-menu dropdown-menu-end shadow-sm py-2" style={{ minWidth: 190, maxWidth: "calc(100vw - 2rem)" }}>
        {items.map((item, i) =>
          item.divider ? (
            <li key={`divider-${i}`}>
              <hr className="dropdown-divider" />
            </li>
          ) : (
            <li key={item.label}>
              <button
                type="button"
                className={`dropdown-item d-flex align-items-center gap-2 py-2 ${item.danger ? "text-danger" : ""} ${item.disabled ? "disabled" : ""}`}
                onClick={item.onClick}
                disabled={item.disabled}
                title={item.title}
                data-bs-toggle={item.modalTarget && !item.disabled ? "modal" : undefined}
                data-bs-target={item.modalTarget && !item.disabled ? `#${item.modalTarget}` : undefined}
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

// Offers the current list as CSV or as a printed PDF.
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

// A dropdown of extra filters, applied only when Apply is pressed.
export function FilterMenu({ children, onReset, onApply }) {
  return (
    <div className="dropdown">
      <button
        type="button"
        className="btn btn-outline-secondary text-muted d-flex align-items-center justify-content-center flex-shrink-0"
        title="Filter Options"
        data-bs-toggle="dropdown"
        aria-expanded="false"
        style={{
          width: "31px",
          height: "31px",
          borderRadius: "6px",
          fontSize: "var(--app-fs-2)",
        }}
      >
        <i className="fas fa-filter"></i>
      </button>
      <div className="dropdown-menu dropdown-menu-end shadow-sm p-3" style={{ minWidth: 240, maxWidth: "calc(100vw - 2rem)" }}>
        <div onClick={(e) => e.stopPropagation()}>
          <div className="app-label mb-2 small">Filter Options</div>
          <div className="d-flex flex-column gap-3">{children}</div>
        </div>
        <hr className="my-3" />
        <div className="d-flex justify-content-between gap-2">
          <button type="button" className="btn btn-sm btn-outline-secondary w-50" onClick={onReset}>
            Reset
          </button>
          <button type="button" className="btn btn-sm btn-app-primary w-50" onClick={onApply}>
            Apply
          </button>
        </div>
      </div>
    </div>
  );
}

// A group of filter options, as checkboxes or as radios when single is set.
export function FilterCheckGroup({ label, options, selected, onToggle, single }) {
  const controlled = typeof onToggle === "function";
  const chosen = Array.isArray(selected) ? selected : selected ? [selected] : [];
  return (
    <div>
      <div className="app-label mb-1">{label}</div>
      {options.map((opt) => (
        <div className="form-check" key={opt}>
          <input
            className="form-check-input"
            type={single ? "radio" : "checkbox"}
            name={single ? `chk-${label}`.replace(/\s+/g, "-") : undefined}
            id={`chk-${label}-${opt}`.replace(/\s+/g, "-")}
            {...(controlled ? { checked: chosen.includes(opt), onChange: () => onToggle(opt) } : {})}
          />
          <label className="form-check-label small" htmlFor={`chk-${label}-${opt}`.replace(/\s+/g, "-")}>
            {opt}
          </label>
        </div>
      ))}
    </div>
  );
}
