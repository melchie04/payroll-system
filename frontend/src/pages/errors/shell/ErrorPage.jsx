import { Link } from "react-router";

// ErrorPage — shared shell for the error pages.
export default function ErrorPage({ code, icon, tone = "neutral", title, description, children }) {
  return (
    <>
      <div
        className={`error-mark error-mark--${tone} d-inline-flex align-items-center justify-content-center rounded-circle mb-2`}
        style={{ width: "var(--app-icon-xl)", height: "var(--app-icon-xl)", fontSize: "var(--app-fs-8)" }}
      >
        <i className={`fas ${icon}`}></i>
      </div>

      <div
        className="error-code fw-bold mb-2"
        style={{ fontSize: "var(--app-fs-display)", lineHeight: 1, letterSpacing: "-0.02em" }}
      >
        {code}
      </div>

      <h1 className="fw-semibold mb-2" style={{ fontSize: "var(--app-fs-7)", lineHeight: 1.2 }}>
        {title}
      </h1>
      <p className="text-muted mb-4" style={{ maxWidth: 420, fontSize: "var(--app-fs-4)" }}>
        {description}
      </p>

      {children}
    </>
  );
}

// BackToDashboardLink — link back to the dashboard.
export function BackToDashboardLink() {
  return (
    <Link to="/" className="btn btn-app-primary rounded-pill px-4 py-2 fw-normal shadow-sm">
      <i className="fas fa-house me-2"></i>
      Back to Dashboard
    </Link>
  );
}
