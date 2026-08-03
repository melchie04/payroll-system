// Small building blocks used only by the timesheet review form.

export function SuggestField({ label, value, onChange, options, disabled, hint, flagged, children }) {
  return (
    <div className="ts-field">
      <label className="form-label text-uppercase text-muted fw-semibold mb-1 d-block" style={{ fontSize: "var(--app-fs-1)", letterSpacing: 0.5 }}>
        {label}
      </label>
      <div className="dropdown ts-suggest">
        <input
          type="text"
          className={`form-control ${flagged ? "ts-cell-flagged" : ""}`}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          autoComplete="off"
        />
        <button
          type="button"
          className="ts-suggest-toggle"
          data-bs-toggle="dropdown"
          aria-expanded="false"
          aria-label={`Choose ${label}`}
          disabled={disabled}
        >
          <i className="fas fa-chevron-down"></i>
        </button>
        <ul className="dropdown-menu dropdown-menu-end shadow-sm py-2" style={{ fontSize: "var(--app-fs-3)" }}>
          {options.map((o) => (
            <li key={o}>
              <button
                type="button"
                className={`dropdown-item d-flex align-items-center gap-2 py-2 ${o === value ? "active" : ""}`}
                onClick={() => onChange(o)}
              >
                {o}
              </button>
            </li>
          ))}
        </ul>
      </div>
      {hint && <div className="ts-field-hint text-muted">{hint}</div>}
      {children}
    </div>
  );
}

// SignatureItem — whether ink was detected in one signature box.
export function SignatureItem({ signed, label }) {
  return (
    <div className="col-12 col-sm-4">
      <div className="border rounded-3 bg-light p-2 px-3 h-100 d-flex flex-column justify-content-between">
        <div className="text-muted fw-semibold" style={{ fontSize: "var(--app-fs-2)" }}>
          {label}
        </div>
        <div className={`fw-semibold mt-auto d-flex align-items-center gap-2 ${signed ? "text-success" : "text-danger"}`}>
          <i className={`fas ${signed ? "fa-circle-check" : "fa-circle-xmark"}`} style={{ fontSize: "var(--app-fs-3)" }}></i>
          <span style={{ fontSize: "var(--app-fs-3)" }}>{signed ? "Signed" : "Not detected"}</span>
        </div>
      </div>
    </div>
  );
}

// TotalItem — a calculated total, with the handwritten figure beneath it.
export function TotalItem({ label, value, written }) {
  const mismatch = written != null && String(written) !== String(value);
  return (
    <div className="col-6 col-md-3">
      <div className="border rounded-3 bg-light p-2 px-3 h-100 d-flex flex-column justify-content-between">
        <div className="text-muted fw-semibold" style={{ fontSize: "var(--app-fs-2)" }}>
          {label}
        </div>
        <div className="fs-4 fw-bold mt-auto" style={mismatch ? { color: "var(--app-status-warning)" } : undefined}>
          {value}
        </div>
        {written != null && (
          <div className={mismatch ? "ts-warn" : "text-muted"} style={{ fontSize: "var(--app-fs-1)" }}>
            {mismatch && <i className="fas fa-triangle-exclamation me-1"></i>}
            Sheet says {written}
          </div>
        )}
      </div>
    </div>
  );
}
