// Status displays: the pill badge and the profile header, each with its own colour lookup.

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
  Rejected: "danger",
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
          style={{ width: 60, height: 60, fontSize: "var(--app-fs-6)" }}
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
          <div className="text-muted d-flex align-items-center gap-1" style={{ fontSize: "var(--app-fs-3)" }}>
            {subtitleIcon && <i className={`fas ${subtitleIcon}`} style={{ fontSize: "var(--app-fs-2)" }}></i>}
            {subtitle}
          </div>
        )}
      </div>
    </div>
  );
}

// PayslipDetails — payslip breakdown with summary, deductions, and net pay.
