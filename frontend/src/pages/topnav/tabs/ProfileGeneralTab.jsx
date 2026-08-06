// The General tab: the profile photo card and the personal information card.

import { useState } from "react";
import { BtnPrimary, DataCard, FormField } from "../../../components/ui/index.jsx";
import { useActivity, useCurrentUser } from "../../../context/hooks.js";

const AVATAR_COLORS = ["#121212", "#495057", "#2e7d32", "#0f6b5c", "#2f5f8f", "#6d4c8f", "#b0392f", "#9a6b1f"];
const MAX_PHOTO_BYTES = 2 * 1024 * 1024;
const PHOTO_TYPES = ["image/jpeg", "image/png"];

// Takes the first letter of the first two words of a name.
function initialsOf(name = "") {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0].toUpperCase())
    .join("");
}

// The Profile Photo card. Photo and colour changes apply straight away.
function ProfilePhotoCard({ user, updateUser, notify }) {
  // Checks the chosen file, then stores it as the avatar.
  function handlePhotoChange(e) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!PHOTO_TYPES.includes(file.type)) {
      notify("error", "That file type isn't supported. Choose a JPG or PNG.");
      return;
    }
    if (file.size > MAX_PHOTO_BYTES) {
      notify("error", "That photo is over 2 MB. Choose a smaller file.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      updateUser({ avatarImage: reader.result });
      notify("success", "Your profile photo has been updated.");
    };
    reader.readAsDataURL(file);
  }

  // Drops the photo and returns to coloured initials.
  function handleRemovePhoto() {
    updateUser({ avatarImage: null });
    notify("success", "Your profile photo has been removed.");
  }

  // Stores the colour used behind the initials.
  function handleColorPick(color) {
    updateUser({ avatarColor: color });
  }

  return (
    <section className="mb-3">
      <DataCard title="Profile Photo">
        <div className="card-body profile-photo-body d-flex align-items-center gap-4 flex-wrap">
          <div className="flex-shrink-0">
            {user.avatarImage ? (
              <img
                src={user.avatarImage}
                alt="Profile"
                className="app-avatar rounded-circle"
                style={{ width: "var(--app-icon-lg)", height: "var(--app-icon-lg)", objectFit: "cover" }}
              />
            ) : (
              <div
                className="profile-avatar app-avatar d-flex align-items-center justify-content-center rounded-circle"
                style={{ background: user.avatarColor }}
              >
                {initialsOf(user.name)}
              </div>
            )}
          </div>

          <div className="profile-photo-controls flex-grow-1">
            <input type="file" id="avatar-file-input" className="d-none" accept=".jpg,.jpeg,.png" onChange={handlePhotoChange} />
            <div className="profile-photo-actions d-flex gap-2 mb-3">
              <button
                type="button"
                className="btn btn-outline-secondary btn-sm d-inline-flex align-items-center gap-2"
                onClick={() => document.getElementById("avatar-file-input").click()}
              >
                <i className="fas fa-upload"></i> Upload photo
              </button>
              {user.avatarImage && (
                <button type="button" className="btn btn-outline-danger btn-sm" onClick={handleRemovePhoto}>
                  Remove
                </button>
              )}
            </div>

            {!user.avatarImage && (
              <>
                <div className="app-label mb-2">Or pick a colour for your initials</div>
                <div className="profile-swatches d-flex gap-2">
                  {AVATAR_COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => handleColorPick(color)}
                      title={color}
                      aria-label={`Use ${color} behind your initials`}
                      className={`profile-swatch rounded-circle p-0${user.avatarColor === color ? " is-selected" : ""}`}
                      style={{ background: color }}
                    ></button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </DataCard>
    </section>
  );
}

// The Personal Information card, holding the only fields that need saving.
function PersonalInformationCard({ user, updateUser, logActivity, notify }) {
  const [form, setForm] = useState({ name: user.name, email: user.email });
  const [syncedUser, setSyncedUser] = useState(user);

  if (syncedUser !== user) {
    setSyncedUser(user);
    setForm({ name: user.name, email: user.email });
  }

  // Keeps the profile form in step with what is typed.
  function handleChange(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  // Saves the name and email, then reports the outcome.
  function handleSave(e) {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim()) {
      notify("error", "Enter both your full name and your email address.");
      return;
    }
    updateUser({ ...form });
    logActivity({ action: "Updated profile", detail: "Updated their own profile details", module: "Settings" });
    notify("success", "Your profile has been updated.");
  }

  return (
    <section className="mb-3">
      <DataCard title="Personal Information">
        <form className="card-body row g-3" onSubmit={handleSave}>
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
            <div className="profile-hint">Your role is managed by an administrator in Settings.</div>
          </div>

          <div className="col-12">
            <BtnPrimary type="submit" className="app-submit-btn">
              <i className="fas fa-floppy-disk"></i> Save changes
            </BtnPrimary>
          </div>
        </form>
      </DataCard>
    </section>
  );
}

// Renders both General cards, sharing the page's message banner.
export default function ProfileGeneralTab({ notify }) {
  const { user, updateUser } = useCurrentUser();
  const { logActivity } = useActivity();

  return (
    <>
      <ProfilePhotoCard user={user} updateUser={updateUser} notify={notify} />
      <PersonalInformationCard user={user} updateUser={updateUser} logActivity={logActivity} notify={notify} />
    </>
  );
}
