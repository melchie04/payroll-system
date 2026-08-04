// Status badges and the avatar header used on profile pages.

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

// Shows a status word tinted by what that status means.
export function Badge({ status }) {
  const variant = statusVariant[status] || "secondary";
  return <span className={`badge rounded-pill status-badge status-badge-${variant}`}>{status}</span>;
}

const statusDotColor = {
  Active: "var(--app-status-success)",
  Ready: "var(--app-status-success)",
  Paid: "var(--app-status-success)",
  "On Leave": "var(--app-status-warning)",
  "At Risk": "var(--app-status-warning)",
  Pending: "var(--app-status-warning)",
  Inactive: "var(--app-status-neutral)",
  Overdue: "var(--app-status-danger)",
};

// The avatar, name and subtitle at the top of a profile.
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
          style={{ width: "var(--app-icon-lg)", height: "var(--app-icon-lg)", fontSize: "var(--app-fs-6)" }}
        >
          {initials}
        </div>
        <span
          className="position-absolute bottom-0 end-0 rounded-circle border border-2 border-white"
          style={{
            width: 15,
            height: 15,
            background: statusDotColor[status] || "var(--app-status-neutral)",
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
