// Card containers and the label/value rows shown inside them.

import { ProfileHeader } from "./Status.jsx";

// Shows one headline figure with its label and a supporting line.
export function StatCard({ label, value, sub, valueColor, subColor, icon }) {
  return (
    <div className="card h-100">
      <div className="card-body">
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
          <span className="app-label">{label}</span>
        </div>
        <div className="fw-bold lh-1" style={{ fontSize: "var(--app-fs-7)", ...(valueColor ? { color: valueColor } : null) }}>
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

// A titled card; anything passed as children becomes its body.
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

// Groups DetailRows and draws the hairlines between them.
export function DetailList({ children }) {
  return (
    <div className="border rounded-3 overflow-hidden">
      <div className="list-group list-group-flush">{children}</div>
    </div>
  );
}

// One label and value, stacking on top of each other on small screens.
export function DetailRow({ icon, label, children }) {
  return (
    <div
      className="list-group-item d-flex flex-column flex-sm-row flex-wrap align-items-sm-center gap-1 gap-sm-3 py-2 px-3"
      style={{ rowGap: "0.25rem" }}
    >
      <div className="detail-row-label d-flex align-items-center gap-2 text-muted flex-shrink-0">
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

// Lays out the earnings and deductions of a payslip.
export function PayslipDetails({ employeeName, subtitle, status, period, summaryRows, deductionRows, netPay }) {
  return (
    <div>
      <ProfileHeader name={employeeName} subtitle={subtitle} subtitleIcon="fa-briefcase" status={status} />
      <div className="text-muted mb-2" style={{ fontSize: "var(--app-fs-2)" }}>
        Pay Period: {period}
      </div>
      <DetailList>
        {summaryRows.map((r) => (
          <DetailRow key={r.label} icon={r.icon} label={r.label}>
            {r.value}
          </DetailRow>
        ))}
      </DetailList>
      <div className="app-label mt-3 mb-2">Deductions</div>
      <DetailList>
        {deductionRows.map((r) => (
          <DetailRow key={r.label} icon={r.icon} label={r.label}>
            {r.value}
          </DetailRow>
        ))}
      </DetailList>
      <div className="d-flex justify-content-between align-items-center border-top pt-3 mt-3">
        <span className="fw-semibold">Net Pay</span>
        <span className="fw-bold" style={{ fontSize: "var(--app-fs-5)" }}>
          {netPay}
        </span>
      </div>
    </div>
  );
}
