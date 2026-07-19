import { Link } from "react-router-dom";

// ErrorPage — shared shell for the error pages.
export default function ErrorPage({ code, icon, accent = "#1a1a1a", title, description, children }) {
  return (
    <>
      <div
        className="d-inline-flex align-items-center justify-content-center rounded-circle mb-2"
        style={{
          width: 72,
          height: 72,
          background: `${accent}1a`,
          color: accent,
          fontSize: "1.75rem",
        }}
      >
        <i className={`fas ${icon}`}></i>
      </div>

      <div
        className="fw-bold mb-2"
        style={{
          fontSize: "4.5rem",
          lineHeight: 1,
          letterSpacing: "-0.02em",
          color: "#1a1a1a",
        }}
      >
        {code}
      </div>

      <h1 className="h4 fw-semibold mb-2">{title}</h1>
      <p className="text-muted mb-4" style={{ maxWidth: 420, fontSize: "0.95rem" }}>
        {description}
      </p>

      {children}
    </>
  );
}

// BackToDashboardLink — link back to the dashboard.
export function BackToDashboardLink() {
  return (
    <Link to="/" className="btn btn-dark rounded-pill px-4 py-2 fw-medium shadow-sm">
      <i className="fas fa-house me-2"></i>
      Back to Dashboard
    </Link>
  );
}
