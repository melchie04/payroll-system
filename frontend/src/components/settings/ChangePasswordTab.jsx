import { DataCard, BtnPrimary, FormField } from "../ui/index.jsx";
import { RequirementRow } from "./RequirementRow.jsx";

// `self` groups all the derived/validation state for this tab so the call
// site in Settings.jsx doesn't have to pass ten separate props.
export function ChangePasswordTab({ self, onChange, onSubmit, onToggleShowPassword }) {
  const { form, touched, success, showPassword, hasLength, hasCase, hasNumber, hasSpecial, matches, canSubmit } = self;

  return (
    <section className="mb-3">
      <DataCard title="Change Password">
        <form id="selfChangePasswordForm" className="card-body row g-1" onSubmit={onSubmit}>
          {success && (
            <div className="col-12 mb-3">
              <div className="alert alert-success py-2 small d-flex align-items-center gap-2 mb-0">
                <i className="fas fa-circle-check"></i>
                Your password has been updated.
              </div>
            </div>
          )}

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
          </div>

          <div className="d-none d-lg-block col-lg-6"></div>

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

          <div className="col-12 mb-3">
            <div className="bg-light rounded-3 px-3 py-2 row row-cols-1 row-cols-md-2 g-1">
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

          {touched && !canSubmit && (
            <div className="col-12">
              <div className="text-danger small mb-0">Please enter your current password and meet all the requirements above before continuing.</div>
            </div>
          )}

          <div className="col-12">
            <BtnPrimary type="submit">
              <i className="fas fa-key"></i> Update Password
            </BtnPrimary>
          </div>
        </form>
      </DataCard>
    </section>
  );
}
