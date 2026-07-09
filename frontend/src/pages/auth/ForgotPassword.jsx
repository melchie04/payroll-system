import { useState } from "react";
import { Link } from "react-router-dom";

export default function ForgotPassword() {
  const [submitted, setSubmitted] = useState(false);
  const [email, setEmail] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="w-100 text-center" style={{ maxWidth: 360 }}>
        <div
          className="d-inline-flex align-items-center justify-content-center rounded-circle bg-light text-success mb-3"
          style={{ width: 56, height: 56, fontSize: "1.4rem" }}
        >
          <i className="fas fa-envelope-circle-check"></i>
        </div>
        <h1 className="fw-normal text-secondary mb-2" style={{ fontSize: "1.35rem", color: "#777777" }}>
          Check your email
        </h1>
        <p className="text-muted mb-4" style={{ fontSize: "0.9rem" }}>
          If an account exists for <strong>{email}</strong>, we&rsquo;ve sent a link to reset your password.
        </p>
        <Link to="/login" className="btn btn-dark rounded-pill w-100 text-white py-2 fw-normal shadow-sm" style={{ fontSize: "0.95rem" }}>
          Back to Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="w-100" style={{ maxWidth: 360 }}>
      {/* Minimalist Heading */}
      <h1
        className="text-center fw-normal text-secondary mb-2 tracking-wide text-uppercase"
        style={{
          fontSize: "1.35rem",
          color: "#777777",
          letterSpacing: "0.08em",
        }}
      >
        Forgot Password
      </h1>
      <p className="text-center text-muted mb-4" style={{ fontSize: "0.85rem" }}>
        Enter your email to reset your password.
      </p>

      <form onSubmit={handleSubmit} noValidate>
        {/* Email Input Group */}
        <div className="mb-4 position-relative">
          <div className="input-group">
            <span className="input-group-text bg-white border-end-0 rounded-start-pill text-muted px-3" style={{ borderColor: "#cccccc" }}>
              <div
                className="d-flex align-items-center justify-content-center border rounded-circle text-muted"
                style={{
                  width: "24px",
                  height: "24px",
                  fontSize: "0.75rem",
                  borderColor: "#cccccc",
                }}
              >
                <i className="fas fa-envelope"></i>
              </div>
            </span>
            <input
              type="email"
              className="form-control border-start-0 rounded-end-pill py-2.5 fs-6 fw-light"
              style={{ borderColor: "#cccccc", outline: "none" }}
              id="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
        </div>

        {/* Dark Custom Submit Button */}
        <button type="submit" className="btn btn-dark rounded-pill w-100 text-white py-2 fw-normal shadow-sm" style={{ fontSize: "0.95rem" }}>
          Send Reset Link
        </button>

        {/* Back to Sign In Link */}
        <div className="text-center mt-3">
          <Link to="/login" className="auth-link text-decoration-none text-muted" style={{ fontSize: "0.85rem" }}>
            <i className="fas fa-arrow-left me-1"></i>
            Back to Sign In
          </Link>
        </div>
      </form>
    </div>
  );
}
