// Form and filter inputs, plus the headings and requirement rows that sit beside them.

export function FilterSelect({ label, children, ...rest }) {
  return (
    <div>
      {label && (
        <label className="form-label text-uppercase text-muted fw-semibold mb-1 d-block" style={{ fontSize: "var(--app-fs-1)", letterSpacing: 0.5 }}>
          {label}
        </label>
      )}
      <select className="form-select form-select-sm" {...rest}>
        {children}
      </select>
    </div>
  );
}

// SearchInput — search box with a leading icon. Pass value and onChange to filter
// with it; left out, it behaves exactly as before.

export function SearchInput({ label, placeholder, value, onChange, ...rest }) {
  return (
    <div className="w-100">
      {label && (
        <label className="form-label text-uppercase text-muted fw-semibold mb-1 d-block" style={{ fontSize: "var(--app-fs-1)", letterSpacing: 0.5 }}>
          {label}
        </label>
      )}
      <div className="input-group input-group-sm w-100">
        <span className="input-group-text bg-white">
          <i className="fas fa-search text-muted"></i>
        </span>
        <input type="text" className="form-control" placeholder={placeholder} value={value} onChange={onChange} {...rest} />
      </div>
    </div>
  );
}

// PageHeader — page title, description, and action buttons.

export function RequirementRow({ met, label }) {
  return (
    <div className="d-flex align-items-center gap-2">
      <i
        className={`fas ${met ? "fa-circle-check text-success" : "fa-circle text-muted"}`}
        style={{ fontSize: "var(--app-fs-1)", opacity: met ? 1 : 0.4 }}
      ></i>
      <span className={met ? "text-dark" : "text-muted"} style={{ fontSize: "var(--app-fs-3)" }}>
        {label}
      </span>
    </div>
  );
}

// Modal — Bootstrap modal wrapper with title, body, and footer.

export function SectionHeading({ children }) {
  return (
    <div className="fw-semibold text-body mb-3 pb-2 border-bottom" style={{ fontSize: "var(--app-fs-3)" }}>
      {children}
    </div>
  );
}

// FormField — labeled form field wrapper.

export function FormField({ label, children }) {
  return (
    <div className="mb-3">
      <label className="form-label text-uppercase text-muted fw-semibold mb-1 d-block" style={{ fontSize: "var(--app-fs-1)", letterSpacing: 0.5 }}>
        {label}
      </label>
      {children}
    </div>
  );
}

// DetailList — bordered list of detail rows.
