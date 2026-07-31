import { useEffect, useState } from "react";
import { DataCard, BtnPrimary, FormField, RequirementRow, SectionHeading } from "../../components/ui/index.jsx";

// ChangePasswordCard — self-service password change. It owns its own state, so it can
// sit on the profile page without a parent having to hold the form for it.
export function ChangePasswordCard() {
  const [form, setForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [touched, setTouched] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const hasLength = form.newPassword.length >= 8;
  const hasCase = /[a-z]/.test(form.newPassword) && /[A-Z]/.test(form.newPassword);
  const hasNumber = /[0-9]/.test(form.newPassword);
  const hasSpecial = /[^A-Za-z0-9]/.test(form.newPassword);
  const matches = form.newPassword.length > 0 && form.newPassword === form.confirmPassword;
  const canSubmit = form.currentPassword.length > 0 && hasLength && hasCase && hasNumber && hasSpecial && matches;

  useEffect(() => {
    if (!success) return;
    const timer = setTimeout(() => setSuccess(false), 4000);
    return () => clearTimeout(timer);
  }, [success]);

  function onChange(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    setSuccess(false);
  }

  function onToggleShowPassword() {
    setShowPassword((v) => !v);
  }

  function onSubmit(e) {
    e.preventDefault();
    setTouched(true);
    if (!canSubmit) return;
    setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    setTouched(false);
    setSuccess(true);
  }

  return (
    <section className="mb-3">
      <DataCard title="Change Password">
        <form id="selfChangePasswordForm" className="card-body" onSubmit={onSubmit}>
          {success && (
            <div className="alert alert-success py-2 small d-flex align-items-center gap-2 mb-3">
              <i className="fas fa-circle-check"></i>
              Your password has been updated.
            </div>
          )}

          <div className="mb-4">
            <SectionHeading>Verify it's you</SectionHeading>
            <div className="row g-3">
              <div className="col-12 col-lg-6">
                <FormField label="Current Password">
                  <div className="input-group">
                    <input
                      type={showPassword ? "text" : "password"}
                      className="form-control"
                      name="currentPassword"
                      value={form.currentPassword}
                      onChange={onChange}
                      placeholder="Enter your current password"
                      required
                    />
                    <button type="button" className="btn btn-outline-secondary" onClick={onToggleShowPassword}>
                      <i className={`fas ${showPassword ? "fa-eye-slash" : "fa-eye"}`}></i>
                    </button>
                  </div>
                </FormField>
                <div className="text-muted" style={{ fontSize: "var(--app-fs-1)" }}>
                  Confirm it's you before setting a new password.
                </div>
              </div>
            </div>
          </div>

          <div className="mb-4">
            <SectionHeading>Choose a new password</SectionHeading>
            <div className="row g-3">
              <div className="col-12 col-md-6">
                <FormField label="New Password">
                  <input
                    type={showPassword ? "text" : "password"}
                    className="form-control"
                    name="newPassword"
                    value={form.newPassword}
                    onChange={onChange}
                    placeholder="Enter new password"
                    required
                  />
                </FormField>
              </div>

              <div className="col-12 col-md-6">
                <FormField label="Confirm New Password">
                  <input
                    type={showPassword ? "text" : "password"}
                    className="form-control"
                    name="confirmPassword"
                    value={form.confirmPassword}
                    onChange={onChange}
                    placeholder="Re-enter new password"
                    required
                  />
                </FormField>
              </div>

              <div className="col-12">
                <div className="bg-light rounded-3 px-3 py-3">
                  <div className="text-uppercase text-muted fw-semibold mb-2" style={{ fontSize: "var(--app-fs-1)", letterSpacing: 0.5 }}>
                    Password Requirements
                  </div>
                  <div className="row row-cols-1 row-cols-md-2 g-2">
                    <div className="col">
                      <RequirementRow met={hasLength} label="At least 8 characters" />
                    </div>
                    <div className="col">
                      <RequirementRow met={hasCase} label="Contains uppercase and lowercase letters" />
                    </div>
                    <div className="col">
                      <RequirementRow met={hasNumber} label="Contains a number" />
                    </div>
                    <div className="col">
                      <RequirementRow met={hasSpecial} label="Contains a special character" />
                    </div>
                    <div className="col">
                      <RequirementRow met={matches} label="Passwords match" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {touched && !canSubmit && (
            <div className="alert alert-danger py-2 small d-flex align-items-start gap-2 mb-3">
              <i className="fas fa-circle-exclamation mt-1"></i>
              Please enter your current password and meet all the requirements above before continuing.
            </div>
          )}

          <BtnPrimary type="submit">
            <i className="fas fa-key"></i> Update Password
          </BtnPrimary>
        </form>
      </DataCard>
    </section>
  );
}
