import { useState } from "react";
import { BrandLockup } from "../../components/ui/index.jsx";
import { useNavigate } from "react-router";
import { useCurrentUser } from "../../context/CurrentUserContext.jsx";

// RequirementRow — password requirement checklist row.
function RequirementRow({ met, label }) {
  return (
    <div className="d-flex align-items-center gap-2 mb-1">
      <i
        className={met ? "fas fa-circle-check" : "far fa-circle"}
        style={{ fontSize: "var(--app-fs-1)", color: met ? "var(--app-accent-ink)" : "var(--app-auth-icon-off)" }}
      ></i>
      <span style={{ fontSize: "var(--app-fs-3)", color: met ? "var(--bs-body-color)" : "var(--app-auth-placeholder)" }}>
        {label}
      </span>
    </div>
  );
}

// ChangePassword — forced password change form with live requirement checks.
export default function ChangePassword() {
  const navigate = useNavigate();
  const { updateUser } = useCurrentUser();

  // One flag per field, keyed by the same names the form uses, so revealing one
  // password never reveals the others.
  const [shown, setShown] = useState({
    tempPassword: false,
    newPassword: false,
    confirmPassword: false,
  });
  const toggleShown = (field) => setShown((s) => ({ ...s, [field]: !s[field] }));
  const [form, setForm] = useState({
    tempPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [touched, setTouched] = useState(false);
  const [done, setDone] = useState(false);

  const hasLength = form.newPassword.length >= 8;
  const hasCase = /[a-z]/.test(form.newPassword) && /[A-Z]/.test(form.newPassword);
  const hasNumber = /[0-9]/.test(form.newPassword);
  const hasSpecial = /[^A-Za-z0-9]/.test(form.newPassword);
  const matches = form.newPassword.length > 0 && form.newPassword === form.confirmPassword;
  const canSubmit = form.tempPassword.length > 0 && hasLength && hasCase && hasNumber && hasSpecial && matches;

  function handleChange(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    setTouched(true);
    if (!canSubmit) return;
    updateUser({ mustChangePassword: false });
    setDone(true);
  }

  if (done) {
    return (
      <div className="w-100 text-center" style={{ maxWidth: 360 }}>
        <div
          className="d-inline-flex align-items-center justify-content-center rounded-circle mb-3"
          style={{ width: 56, height: 56, fontSize: "var(--app-fs-7)", background: "var(--app-auth-panel)", color: "var(--app-accent-ink)" }}
        >
          <i className="fas fa-circle-check"></i>
        </div>
        <h1 className="fw-normal text-secondary mb-2" style={{ fontSize: "var(--app-fs-6)", color: "var(--app-auth-heading)" }}>
          Password set
        </h1>
        <p className="text-muted mb-4" style={{ fontSize: "var(--app-fs-4)" }}>
          Your password has been updated. You're all set to continue.
        </p>
        <button
          type="button"
          className="btn btn-app-primary rounded-pill w-100 text-white py-2 fw-normal shadow-sm"
          style={{ fontSize: "var(--app-fs-5)" }}
          onClick={() => navigate("/")}
        >
          Continue to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="w-100" style={{ maxWidth: 360 }}>
      <BrandLockup className="mb-2" />
      <hr className="mx-auto mb-3 opacity-25" style={{ maxWidth: 200 }} />
      <h1
        className="text-center fw-normal text-secondary mb-2 tracking-wide text-uppercase"
        style={{
          fontSize: "var(--app-fs-6)",
          color: "var(--app-auth-heading)",
          letterSpacing: "0.08em",
        }}
      >
        Change Password
      </h1>
      <p className="text-center text-muted mb-4" style={{ fontSize: "var(--app-fs-3)" }}>
        Enter the temporary password from your administrator, then choose a new one.
      </p>

      <form onSubmit={handleSubmit} noValidate>
        <div className="mb-3 position-relative">
          <div className="input-group">
            <span className="input-group-text border-end-0 rounded-start-pill text-muted px-3">
              <div
                className="d-flex align-items-center justify-content-center border rounded-circle"
                style={{
                  width: "24px",
                  height: "24px",
                  fontSize: "var(--app-fs-2)",
                  borderColor: "var(--app-auth-icon)",
                  color: "var(--app-auth-icon)",
                }}
              >
                <i className="fas fa-key"></i>
              </div>
            </span>
            <input
              type={shown.tempPassword ? "text" : "password"}
              className="form-control border-start-0 border-end-0 py-2.5 fs-6 fw-light"
              style={{ outline: "none" }}
              id="tempPassword"
              name="tempPassword"
              placeholder="Temporary password"
              value={form.tempPassword}
              onChange={handleChange}
              required
            />
            <button
              className="btn btn-outline-secondary border-start-0 rounded-end-pill bg-transparent text-muted px-3"
              type="button"
              tabIndex={-1}
              onClick={() => toggleShown("tempPassword")}
            >
              <div
                className="d-flex align-items-center justify-content-center border rounded-circle text-muted"
                style={{
                  width: "24px",
                  height: "24px",
                  fontSize: "var(--app-fs-2)",
                  borderColor: "var(--app-auth-field-border)",
                }}
              >
                <i className={`fas ${shown.tempPassword ? "fa-eye-slash" : "fa-eye"}`}></i>
              </div>
            </button>
          </div>
        </div>

        <div className="mb-3 position-relative">
          <div className="input-group">
            <span className="input-group-text border-end-0 rounded-start-pill text-muted px-3">
              <div
                className="d-flex align-items-center justify-content-center border rounded-circle"
                style={{
                  width: "24px",
                  height: "24px",
                  fontSize: "var(--app-fs-2)",
                  borderColor: "var(--app-auth-icon)",
                  color: "var(--app-auth-icon)",
                }}
              >
                <i className="fas fa-lock"></i>
              </div>
            </span>
            <input
              type={shown.newPassword ? "text" : "password"}
              className="form-control border-start-0 border-end-0 py-2.5 fs-6 fw-light"
              style={{ outline: "none" }}
              id="newPassword"
              name="newPassword"
              placeholder="New password"
              value={form.newPassword}
              onChange={handleChange}
              required
            />
            <button
              className="btn btn-outline-secondary border-start-0 rounded-end-pill bg-transparent text-muted px-3"
              type="button"
              tabIndex={-1}
              onClick={() => toggleShown("newPassword")}
            >
              <div
                className="d-flex align-items-center justify-content-center border rounded-circle text-muted"
                style={{
                  width: "24px",
                  height: "24px",
                  fontSize: "var(--app-fs-2)",
                  borderColor: "var(--app-auth-field-border)",
                }}
              >
                <i className={`fas ${shown.newPassword ? "fa-eye-slash" : "fa-eye"}`}></i>
              </div>
            </button>
          </div>
        </div>

        <div className="mb-3 position-relative">
          <div className="input-group">
            <span className="input-group-text border-end-0 rounded-start-pill text-muted px-3">
              <div
                className="d-flex align-items-center justify-content-center border rounded-circle"
                style={{
                  width: "24px",
                  height: "24px",
                  fontSize: "var(--app-fs-2)",
                  borderColor: "var(--app-auth-icon)",
                  color: "var(--app-auth-icon)",
                }}
              >
                <i className="fas fa-lock"></i>
              </div>
            </span>
            <input
              type={shown.confirmPassword ? "text" : "password"}
              className="form-control border-start-0 border-end-0 py-2.5 fs-6 fw-light"
              style={{ outline: "none" }}
              id="confirmPassword"
              name="confirmPassword"
              placeholder="Confirm new password"
              value={form.confirmPassword}
              onChange={handleChange}
              required
            />
            <button
              className="btn btn-outline-secondary border-start-0 rounded-end-pill bg-transparent text-muted px-3"
              type="button"
              tabIndex={-1}
              onClick={() => toggleShown("confirmPassword")}
            >
              <div
                className="d-flex align-items-center justify-content-center border rounded-circle text-muted"
                style={{
                  width: "24px",
                  height: "24px",
                  fontSize: "var(--app-fs-2)",
                  borderColor: "var(--app-auth-field-border)",
                }}
              >
                <i className={`fas ${shown.confirmPassword ? "fa-eye-slash" : "fa-eye"}`}></i>
              </div>
            </button>
          </div>
        </div>

        <div className="auth-requirements rounded-3 px-3 py-2 mb-4">
          <RequirementRow met={hasLength} label="At least 8 characters" />
          <RequirementRow met={hasCase} label="Contains uppercase and lowercase letters" />
          <RequirementRow met={hasNumber} label="Contains a number" />
          <RequirementRow met={hasSpecial} label="Contains a special character" />
          <RequirementRow met={matches} label="Passwords match" />
        </div>

        {touched && !canSubmit && (
          <div className="text-danger text-center mb-3" style={{ fontSize: "var(--app-fs-3)" }}>
            Enter your temporary password and meet all the requirements above before continuing.
          </div>
        )}

        <button type="submit" className="btn btn-app-primary rounded-pill w-100 text-white py-2 fw-normal shadow-sm" style={{ fontSize: "var(--app-fs-5)" }}>
          Set New Password
        </button>
      </form>
    </div>
  );
}
