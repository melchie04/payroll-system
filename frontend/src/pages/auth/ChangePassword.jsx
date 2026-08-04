// First-run page that forces a password change before entering the app.

import { useState } from "react";
import { BrandLockup } from "../../components/ui/index.jsx";
import { useNavigate } from "react-router";
import { useCurrentUser } from "../../context/hooks.js";

// One password rule, ticked once it is satisfied.
function RequirementRow({ met, label }) {
  return (
    <div className={`auth-rule d-flex align-items-center gap-2 mb-1${met ? " is-met" : ""}`}>
      <i className={`auth-rule-icon ${met ? "fas fa-circle-check" : "far fa-circle"}`}></i>
      <span>{label}</span>
    </div>
  );
}

// Forces a new password before the app can be entered.
export default function ChangePassword() {
  const navigate = useNavigate();
  const { updateUser } = useCurrentUser();

  const [shown, setShown] = useState({
    tempPassword: false,
    newPassword: false,
    confirmPassword: false,
  });
  // Shows or hides the typed text of one password field.
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
  const allMet = hasLength && hasCase && hasNumber && hasSpecial && matches;
  const canSubmit = form.tempPassword.length > 0 && allMet;

  // Keeps the form state in step with what is typed.
  function handleChange(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  // Accepts the new password once every rule passes.
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
          style={{
            width: "var(--app-icon-lg)",
            height: "var(--app-icon-lg)",
            fontSize: "var(--app-fs-7)",
            background: "var(--app-auth-panel)",
            color: "var(--app-accent-ink)",
          }}
        >
          <i className="fas fa-circle-check"></i>
        </div>
        <h1 className="auth-heading mb-2">Password set</h1>
        <p className="auth-subtitle mb-4">Your password has been updated. You're all set to continue.</p>
        <button type="button" className="btn btn-app-primary centered-submit w-100 text-white fw-normal" onClick={() => navigate("/")}>
          Continue to dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="w-100" style={{ maxWidth: 360 }}>
      <BrandLockup />
      <hr className="auth-divider" />
      <h1 className="auth-heading text-center mb-1">Change password</h1>
      <p className="auth-subtitle text-center mb-4">Enter the temporary password from your administrator, then choose a new one.</p>

      <form onSubmit={handleSubmit} noValidate>
        <div className="mb-3 position-relative">
          <div className="input-group auth-field">
            <span className="input-group-text pe-0">
              <i className="fas fa-key"></i>
            </span>
            <input
              type={shown.tempPassword ? "text" : "password"}
              className="form-control fw-light"
              style={{ outline: "none" }}
              id="tempPassword"
              name="tempPassword"
              placeholder="Temporary password"
              value={form.tempPassword}
              onChange={handleChange}
              required
            />
            <button
              className="btn"
              type="button"
              tabIndex={-1}
              onClick={() => toggleShown("tempPassword")}
              aria-label={shown.tempPassword ? "Hide password" : "Show password"}
            >
              <i className={`fas ${shown.tempPassword ? "fa-eye-slash" : "fa-eye"}`}></i>
            </button>
          </div>
        </div>

        <div className="mb-3 position-relative">
          <div className="input-group auth-field">
            <span className="input-group-text pe-0">
              <i className="fas fa-lock"></i>
            </span>
            <input
              type={shown.newPassword ? "text" : "password"}
              className="form-control fw-light"
              style={{ outline: "none" }}
              id="newPassword"
              name="newPassword"
              placeholder="New password"
              value={form.newPassword}
              onChange={handleChange}
              required
            />
            <button
              className="btn"
              type="button"
              tabIndex={-1}
              onClick={() => toggleShown("newPassword")}
              aria-label={shown.newPassword ? "Hide password" : "Show password"}
            >
              <i className={`fas ${shown.newPassword ? "fa-eye-slash" : "fa-eye"}`}></i>
            </button>
          </div>
        </div>

        <div className="mb-3 position-relative">
          <div className="input-group auth-field">
            <span className="input-group-text pe-0">
              <i className="fas fa-lock"></i>
            </span>
            <input
              type={shown.confirmPassword ? "text" : "password"}
              className="form-control fw-light"
              style={{ outline: "none" }}
              id="confirmPassword"
              name="confirmPassword"
              placeholder="Confirm new password"
              value={form.confirmPassword}
              onChange={handleChange}
              required
            />
            <button
              className="btn"
              type="button"
              tabIndex={-1}
              onClick={() => toggleShown("confirmPassword")}
              aria-label={shown.confirmPassword ? "Hide password" : "Show password"}
            >
              <i className={`fas ${shown.confirmPassword ? "fa-eye-slash" : "fa-eye"}`}></i>
            </button>
          </div>
        </div>

        <div className={`auth-requirements mb-4${allMet ? " is-complete" : ""}`}>
          <p className="auth-requirements-label mb-2">{allMet ? "All requirements met" : "Password must contain"}</p>
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

        <button type="submit" className="btn btn-app-primary centered-submit w-100 text-white fw-normal">
          Set new password
        </button>
      </form>
    </div>
  );
}
