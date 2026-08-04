// My Profile page: personal details, avatar and password change.

import { useEffect, useState } from "react";
import { DataCard, BtnPrimary, FormField, PageHeader, RequirementRow, SectionHeading } from "../../components/ui/index.jsx";
import { useCurrentUser } from "../../context/CurrentUserContext.jsx";
import { useActivity } from "../../context/ActivityContext.jsx";

const AVATAR_COLORS = ["#121212", "#0d6efd", "#198754", "#dc3545", "#997404", "#6f42c1"];

// Takes the first letter of the first two words of a name.
function initialsOf(name = "") {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0].toUpperCase())
    .join("");
}

// The password change form, which keeps its own state.
function ChangePasswordCard() {
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

  // Keeps the password form in step with what is typed.
  function onChange(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    setSuccess(false);
  }

  // Shows or hides the characters in one password field.
  function onToggleShowPassword() {
    setShowPassword((v) => !v);
  }

  // Accepts the new password once every rule passes.
  function onSubmit(e) {
    e.preventDefault();
    setTouched(true);
    if (!canSubmit) return;
    setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    setTouched(false);
    setSuccess(true);
  }

  return (
    <>
      {success && (
        <section>
          <div className="alert alert-success py-2 small d-flex align-items-center gap-2 mb-3">
            <i className="fas fa-circle-check"></i>
            Your password has been updated.
          </div>
        </section>
      )}

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
                    <div className="app-label mb-2">
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
    </>
  );
}

// The signed-in user's own details, avatar and password.
export default function MyProfile() {
  const { user, updateUser } = useCurrentUser();
  const { logActivity } = useActivity();

  const [form, setForm] = useState({ name: user.name, email: user.email });
  const [avatarImage, setAvatarImage] = useState(user.avatarImage);
  const [avatarColor, setAvatarColor] = useState(user.avatarColor);
  const [saved, setSaved] = useState(false);
  const [syncedUser, setSyncedUser] = useState(user);

  if (syncedUser !== user) {
    setSyncedUser(user);
    setForm({ name: user.name, email: user.email });
    setAvatarImage(user.avatarImage);
    setAvatarColor(user.avatarColor);
  }

  useEffect(() => {
    if (!saved) return;
    const timer = setTimeout(() => setSaved(false), 4000);
    return () => clearTimeout(timer);
  }, [saved]);

  // Keeps the profile form in step with what is typed.
  function handleChange(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  // Reads the chosen image and uses it as the avatar.
  function handlePhotoChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setAvatarImage(reader.result);
    reader.readAsDataURL(file);
  }

  // Drops the photo and returns to coloured initials.
  function handleRemovePhoto() {
    setAvatarImage(null);
  }

  // Saves the profile and shows the confirmation.
  function handleSave(e) {
    e.preventDefault();
    if (!form.name || !form.email) return;
    updateUser({ ...form, avatarImage, avatarColor });
    logActivity({ action: "Updated profile", detail: "Updated their own profile details", module: "Settings" });
    setSaved(true);
  }

  return (
    <>
      <section>
        <div className="mt-4">
          <PageHeader title="My Profile" description="Manage your own account details." />
        </div>
      </section>

      <hr className="my-3 opacity-25" />

      <form onSubmit={handleSave}>
        {saved && (
          <section>
            <div className="alert alert-success py-2 small d-flex align-items-center gap-2 mb-3">
              <i className="fas fa-circle-check"></i>
              Your profile has been updated.
            </div>
          </section>
        )}

        <section className="mb-3">
          <DataCard title="Personal Information">
            
            <div className="card-body d-flex align-items-center gap-4 flex-wrap">
              <div className="position-relative flex-shrink-0">
                {avatarImage ? (
                  <img
                    src={avatarImage}
                    alt="Profile"
                    className="rounded-circle"
                    style={{ width: "var(--app-icon-lg)", height: "var(--app-icon-lg)", objectFit: "cover" }}
                  />
                ) : (
                  <div
                    className="d-flex align-items-center justify-content-center rounded-circle text-white fw-semibold"
                    style={{ width: "var(--app-icon-lg)", height: "var(--app-icon-lg)", fontSize: "var(--app-fs-6)", background: avatarColor }}
                  >
                    {initialsOf(form.name)}
                  </div>
                )}
              </div>

              <div className="flex-grow-1">
                <input type="file" id="avatar-file-input" className="d-none" accept=".jpg,.jpeg,.png" onChange={handlePhotoChange} />
                <div className="d-flex gap-2 mb-3">
                  <button
                    type="button"
                    className="btn btn-outline-secondary btn-sm d-inline-flex align-items-center gap-2"
                    onClick={() => document.getElementById("avatar-file-input").click()}
                  >
                    <i className="fas fa-upload"></i> Upload Photo
                  </button>
                  {avatarImage && (
                    <button type="button" className="btn btn-outline-danger btn-sm" onClick={handleRemovePhoto}>
                      Remove
                    </button>
                  )}
                </div>

                {!avatarImage && (
                  <div>
                    <div className="app-label mb-2">
                      Or pick a color for your initials
                    </div>
                    
                    <div className="d-flex gap-2 mb-2">
                      {AVATAR_COLORS.map((color) => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => setAvatarColor(color)}
                          title={color}
                          className="rounded-circle p-0"
                          style={{
                            width: "var(--app-icon-xs)",
                            height: "var(--app-icon-xs)",
                            background: color,
                            border: avatarColor === color ? "2px solid var(--bs-body-color)" : "2px solid transparent",
                          }}
                        ></button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="card-body row g-3 border-top">
              <div className="col-12 col-md-6">
                <FormField label="Full Name">
                  <input type="text" className="form-control" name="name" value={form.name} onChange={handleChange} required />
                </FormField>
              </div>
              <div className="col-12 col-md-6">
                <FormField label="Email">
                  <input type="email" className="form-control" name="email" value={form.email} onChange={handleChange} required />
                </FormField>
              </div>
              <div className="col-12 col-md-6">
                <FormField label="Role">
                  <input type="text" className="form-control" value={user.role} disabled readOnly />
                </FormField>
                <div className="text-muted" style={{ fontSize: "var(--app-fs-1)" }}>
                  Your role is managed by an administrator in Settings.
                </div>
              </div>

              <div className="col-12">
                <BtnPrimary type="submit">
                  <i className="fas fa-floppy-disk"></i> Save Changes
                </BtnPrimary>
              </div>
            </div>
          </DataCard>
        </section>
      </form>

      <ChangePasswordCard />
    </>
  );
}
