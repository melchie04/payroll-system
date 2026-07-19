import { Modal, BtnSecondary, BtnPrimary, FormField } from "../ui/index.jsx";
import { RequirementRow } from "./RequirementRow.jsx";

// ResetPasswordModal — modal for resetting a user's password.
export function ResetPasswordModal({
  target,
  form,
  showPassword,
  touched,
  canSubmit,
  hasLength,
  hasCase,
  hasNumber,
  hasSpecial,
  matches,
  onChange,
  onToggleShowPassword,
  onSubmit,
}) {
  return (
    <Modal
      id="resetPasswordModal"
      title="Reset Password"
      footer={
        <>
          <BtnSecondary data-bs-dismiss="modal">Cancel</BtnSecondary>
          <BtnPrimary type="submit" form="resetPasswordForm">
            <i className="fas fa-key"></i> Reset Password
          </BtnPrimary>
        </>
      }
    >
      <p className="text-muted small mb-3">
        Set a new password for <strong>{target?.name}</strong>. They will be asked to sign in again with this password.
      </p>
      <form id="resetPasswordForm" onSubmit={onSubmit}>
        <FormField label="New Password">
          <div className="input-group">
            <input
              type={showPassword ? "text" : "password"}
              className="form-control"
              name="password"
              value={form.password}
              onChange={onChange}
              placeholder="Enter new password"
              required
            />
            <button type="button" className="btn btn-outline-secondary" onClick={onToggleShowPassword}>
              <i className={`fas ${showPassword ? "fa-eye-slash" : "fa-eye"}`}></i>
            </button>
          </div>
        </FormField>
        <FormField label="Confirm Password">
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
        <div className="bg-light rounded-3 px-3 py-2 mb-2">
          <RequirementRow met={hasLength} label="At least 8 characters" />
          <RequirementRow met={hasCase} label="Contains uppercase and lowercase letters" />
          <RequirementRow met={hasNumber} label="Contains a number" />
          <RequirementRow met={hasSpecial} label="Contains a special character" />
          <RequirementRow met={matches} label="Passwords match" />
        </div>
        {touched && !canSubmit && <div className="text-danger small mb-0">Please meet all the requirements above before continuing.</div>}
      </form>
    </Modal>
  );
}
