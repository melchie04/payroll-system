// The Security tab: the change password form.

import { useState } from "react";
import { BtnPrimary, DataCard, FormField, RequirementRow, SectionHeading } from "../../../components/ui/index.jsx";

// Renders the change password form, reporting outcomes through the page banner.
export default function SecurityTab({ notify }) {
  const [form, setForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [showPassword, setShowPassword] = useState(false);

  const hasLength = form.newPassword.length >= 8;
  const hasCase = /[a-z]/.test(form.newPassword) && /[A-Z]/.test(form.newPassword);
  const hasNumber = /[0-9]/.test(form.newPassword);
  const hasSpecial = /[^A-Za-z0-9]/.test(form.newPassword);
  const matches = form.newPassword.length > 0 && form.newPassword === form.confirmPassword;
  const canSubmit = form.currentPassword.length > 0 && hasLength && hasCase && hasNumber && hasSpecial && matches;

  // Keeps the password form in step with what is typed.
  function onChange(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  // Shows or hides the characters in the password fields.
  function onToggleShowPassword() {
    setShowPassword((v) => !v);
  }

  // Accepts the new password once every rule passes.
  function onSubmit(e) {
    e.preventDefault();
    if (!canSubmit) {
      notify("error", "Enter your current password and meet every requirement before continuing.");
      return;
    }
    setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    notify("success", "Your password has been updated.");
  }

  return (
    <section className="mb-3">
      <DataCard title="Change Password">
        <form id="selfChangePasswordForm" className="card-body" onSubmit={onSubmit}>
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
                    <button type="button" className="btn input-toggle" onClick={onToggleShowPassword}>
                      <i className={`fas ${showPassword ? "fa-eye-slash" : "fa-eye"}`}></i>
                    </button>
                  </div>
                </FormField>
                <div className="profile-hint">Confirm it's you before setting a new password.</div>
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
                <div className="auth-requirements">
                  <div className="auth-requirements-label mb-2">Password requirements</div>
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

          <BtnPrimary type="submit">
            <i className="fas fa-key"></i> Update password
          </BtnPrimary>
        </form>
      </DataCard>
    </section>
  );
}
