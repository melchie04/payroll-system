import { useState } from "react";
import { Link, useParams } from "react-router-dom";

function RequirementRow({ met, label }) {
  return (
    <div className="d-flex align-items-center gap-2 mb-1">
      <i
        className={`fas ${met ? "fa-circle-check text-success" : "fa-circle text-muted"}`}
        style={{ fontSize: "0.7rem", opacity: met ? 1 : 0.4 }}
      ></i>
      <span className={met ? "text-dark" : "text-muted"} style={{ fontSize: "0.8rem" }}>
        {label}
      </span>
    </div>
  );
}

export default function ResetPassword() {
  const { token } = useParams();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [touched, setTouched] = useState(false);
  const [done, setDone] = useState(false);

  const hasLength = password.length >= 8;
  const hasCase = /[a-z]/.test(password) && /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);
  const matches = password.length > 0 && password === confirmPassword;
  const canSubmit = hasLength && hasCase && hasNumber && hasSpecial && matches;

  function handleSubmit(e) {
    e.preventDefault();
    setTouched(true);
    if (!canSubmit) return;
    setDone(true);
  }

  if (done) {
    return (
      <div className="w-100 text-center" style={{ maxWidth: 360 }}>
        <div
          className="d-inline-flex align-items-center justify-content-center rounded-circle bg-light text-success mb-3"
          style={{ width: 56, height: 56, fontSize: "1.4rem" }}
        >
          <i className="fas fa-circle-check"></i>
        </div>
        <h1 className="fw-normal text-secondary mb-2" style={{ fontSize: "1.35rem", color: "#777777" }}>
          Password reset
        </h1>
        <p className="text-muted mb-4" style={{ fontSize: "0.9rem" }}>
          Your password has been updated. You can now sign in with your new password.
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
        Reset Password
      </h1>
      <p className="text-center text-muted mb-4" style={{ fontSize: "0.85rem" }}>
        Choose a new password for your account.
      </p>

      <form onSubmit={handleSubmit} noValidate>
        {/* New Password Input Group */}
        <div className="mb-3 position-relative">
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
                <i className="fas fa-lock"></i>
              </div>
            </span>
            <input
              type={showPassword ? "text" : "password"}
              className="form-control border-start-0 border-end-0 py-2.5 fs-6 fw-light"
              style={{ borderColor: "#cccccc", outline: "none" }}
              id="password"
              placeholder="New password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              className="btn btn-outline-secondary border-start-0 rounded-end-pill bg-transparent text-muted px-3"
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              style={{ borderColor: "#cccccc" }}
            >
              <div
                className="d-flex align-items-center justify-content-center border rounded-circle text-muted"
                style={{
                  width: "24px",
                  height: "24px",
                  fontSize: "0.75rem",
                  borderColor: "#cccccc",
                }}
              >
                <i className={`fas ${showPassword ? "fa-eye-slash" : "fa-eye"}`}></i>
              </div>
            </button>
          </div>
        </div>

        {/* Confirm Password Input Group */}
        <div className="mb-3 position-relative">
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
                <i className="fas fa-lock"></i>
              </div>
            </span>
            <input
              type={showConfirm ? "text" : "password"}
              className="form-control border-start-0 border-end-0 py-2.5 fs-6 fw-light"
              style={{ borderColor: "#cccccc", outline: "none" }}
              id="confirmPassword"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            <button
              className="btn btn-outline-secondary border-start-0 rounded-end-pill bg-transparent text-muted px-3"
              type="button"
              onClick={() => setShowConfirm((s) => !s)}
              style={{ borderColor: "#cccccc" }}
            >
              <div
                className="d-flex align-items-center justify-content-center border rounded-circle text-muted"
                style={{
                  width: "24px",
                  height: "24px",
                  fontSize: "0.75rem",
                  borderColor: "#cccccc",
                }}
              >
                <i className={`fas ${showConfirm ? "fa-eye-slash" : "fa-eye"}`}></i>
              </div>
            </button>
          </div>
        </div>

        {/* Live requirement checklist instead of a static caption */}
        <div className="bg-light rounded-3 px-3 py-2 mb-4">
          <RequirementRow met={hasLength} label="At least 8 characters" />
          <RequirementRow met={hasCase} label="Contains uppercase and lowercase letters" />
          <RequirementRow met={hasNumber} label="Contains a number" />
          <RequirementRow met={hasSpecial} label="Contains a special character" />
          <RequirementRow met={matches} label="Passwords match" />
        </div>

        {touched && !canSubmit && (
          <div className="text-danger text-center mb-3" style={{ fontSize: "0.8rem" }}>
            Please meet both requirements above before continuing.
          </div>
        )}

        {/* Dark Custom Submit Button */}
        <button type="submit" className="btn btn-dark rounded-pill w-100 text-white py-2 fw-normal shadow-sm" style={{ fontSize: "0.95rem" }}>
          Reset Password
        </button>

        {/* Back to Sign In Link */}
        <div className="text-center mt-3">
          <Link to="/login" className="auth-link text-decoration-none text-muted" style={{ fontSize: "0.85rem" }}>
            <i className="fas fa-arrow-left me-1"></i>
            Back to Sign In
          </Link>
        </div>
      </form>

      {/* Dev-only preview of the token carried by the emailed link.
          Remove this block once a real API validates the token. */}
      {token && (
        <div className="text-center mt-3">
          <span className="badge bg-white border text-muted fw-normal" style={{ fontSize: "0.7rem" }}>
            Dev preview — token: {token}
          </span>
        </div>
      )}
    </div>
  );
}
