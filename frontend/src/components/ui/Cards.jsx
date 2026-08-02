import { ProfileHeader } from "./Status.jsx";

// Card surfaces: stat tiles, titled panels, detail lists and the payslip block.

export function StatCard({ label, value, sub, valueColor, subColor, icon }) {
  return (
    <div className="card h-100">
      <div className="card-body">
        {/* Icon sits with the label rather than floating opposite it, so the figure
            below is the only thing competing for attention. */}
        <div className="d-flex align-items-center gap-2 mb-3">
          {icon && (
            <span
              className="app-stat-icon d-inline-flex align-items-center justify-content-center rounded-2 flex-shrink-0"
              style={{ width: 26, height: 26, fontSize: "var(--app-fs-2)" }}
              aria-hidden="true"
            >
              <i className={`fas ${icon}`}></i>
            </span>
          )}
          <span className="text-uppercase text-muted fw-semibold" style={{ fontSize: "var(--app-fs-1)", letterSpacing: 0.6 }}>
            {label}
          </span>
        </div>
        <div className="fw-bold lh-1" style={{ fontSize: "var(--app-fs-8)", ...(valueColor ? { color: valueColor } : null) }}>
          {value}
        </div>
        {sub && (
          <div className="mt-2" style={{ fontSize: "var(--app-fs-2)", color: subColor || "var(--bs-secondary-color)" }}>
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

export function DetailList({ children }) {
  return (
    <div className="border rounded-3 overflow-hidden">
      <div className="list-group list-group-flush">{children}</div>
    </div>
  );
}

// DetailRow — icon + label + value detail row. The row wraps so a value too long
// for the space left drops onto its own full-width line instead of being squeezed.

export function DetailRow({ icon, label, children }) {
  return (
    <div
      className="list-group-item d-flex flex-column flex-sm-row flex-wrap align-items-sm-center gap-1 gap-sm-3 py-2 px-3"
      style={{ rowGap: "0.25rem" }}
    >
      <div className="d-flex align-items-center gap-2 text-muted flex-shrink-0" style={{ minWidth: 170 }}>
        <span
          className="d-inline-flex align-items-center justify-content-center rounded-circle bg-light text-secondary flex-shrink-0"
          style={{ width: "var(--app-icon-sm)", height: "var(--app-icon-sm)", fontSize: "var(--app-fs-3)" }}
        >
          <i className={`fas ${icon} fa-fw`}></i>
        </span>
        <span style={{ fontSize: "var(--app-fs-3)" }}>{label}</span>
      </div>
      <div className="fw-semibold" style={{ fontSize: "var(--app-fs-3)", minWidth: 0 }}>
        {children}
      </div>
    </div>
  );
}

export function PayslipDetails({ employeeName, subtitle, status, period, summaryRows, deductionRows, netPay }) {
  return (
    <div>
      <ProfileHeader name={employeeName} subtitle={subtitle} subtitleIcon="fa-briefcase" status={status} />
      <div className="text-muted mb-2" style={{ fontSize: "var(--app-fs-2)" }}>Pay Period: {period}</div>
      <DetailList>
        {summaryRows.map((r) => (
          <DetailRow key={r.label} icon={r.icon} label={r.label}>
            {r.value}
          </DetailRow>
        ))}
      </DetailList>
      <div className="text-uppercase text-muted fw-semibold mt-3 mb-2" style={{ fontSize: "var(--app-fs-1)", letterSpacing: 0.5 }}>
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
        <span className="fw-bold" style={{ fontSize: "var(--app-fs-6)" }}>{netPay}</span>
      </div>
    </div>
  );
}
