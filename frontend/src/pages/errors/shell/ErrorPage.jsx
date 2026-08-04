// Shared shell the three error pages are built from.

import { Link } from "react-router";

// Lays out the disc, code, title and action shared by all three error pages.
export default function ErrorPage({ code, icon, tone = "neutral", title, description, children }) {
  return (
    <>
      <div className={`error-mark error-mark--${tone} d-inline-flex align-items-center justify-content-center rounded-circle mb-2`}>
        <i className={`fas ${icon}`}></i>
      </div>

      <div className="error-code mb-2">{code}</div>

      <h1 className="error-title mb-2">{title}</h1>
      <p className="error-description mb-4">{description}</p>

      {children}
    </>
  );
}

// The link back to the dashboard shown under an error.
export function BackToDashboardLink() {
  return (
    <Link to="/" className="btn btn-app-primary centered-submit px-4 fw-normal">
      <i className="fas fa-house me-2"></i>
      Back to dashboard
    </Link>
  );
}
