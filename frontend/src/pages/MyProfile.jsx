import { useEffect, useState } from "react";
import { DataCard, BtnPrimary, FormField, PageHeader } from "../components/ui/index.jsx";
import { useCurrentUser } from "../context/CurrentUserContext.jsx";

const AVATAR_COLORS = ["#1a1a1a", "#0d6efd", "#198754", "#dc3545", "#997404", "#6f42c1"];

function initialsOf(name = "") {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0].toUpperCase())
    .join("");
}

export default function MyProfile() {
  const { user, updateUser } = useCurrentUser();

  const [form, setForm] = useState({ name: user.name, email: user.email });
  const [avatarImage, setAvatarImage] = useState(user.avatarImage);
  const [avatarColor, setAvatarColor] = useState(user.avatarColor);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!saved) return;
    const timer = setTimeout(() => setSaved(false), 4000);
    return () => clearTimeout(timer);
  }, [saved]);

  function handleChange(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  function handlePhotoChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setAvatarImage(reader.result);
    reader.readAsDataURL(file);
  }

  function handleRemovePhoto() {
    setAvatarImage(null);
  }

  function handleSave(e) {
    e.preventDefault();
    if (!form.name || !form.email) return;
    updateUser({ ...form, avatarImage, avatarColor });
    setSaved(true);
  }

  return (
    <>
      {/* ========================================================== */}
      {/* DIVISION 1: HEADER                                         */}
      {/* ========================================================== */}
      <section>
        <div className="mt-4">
          <PageHeader title="My Profile" description="Manage your own account details." />
        </div>
      </section>

      {/* LINE DIVIDER */}
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

        {/* ========================================================== */}
        {/* DIVISION 2: PROFILE PHOTO                                  */}
        {/* ========================================================== */}
        <section className="mb-3">
          <DataCard title="Profile Photo">
            <div className="card-body d-flex align-items-center gap-4 flex-wrap">
              <div className="position-relative flex-shrink-0">
                {avatarImage ? (
                  <img
                    src={avatarImage}
                    alt="Profile"
                    className="rounded-circle"
                    style={{ width: 72, height: 72, objectFit: "cover" }}
                  />
                ) : (
                  <div
                    className="d-flex align-items-center justify-content-center rounded-circle text-white fw-semibold"
                    style={{ width: 72, height: 72, fontSize: "1.4rem", background: avatarColor }}
                  >
                    {initialsOf(form.name)}
                  </div>
                )}
              </div>

              <div className="flex-grow-1">
                <input
                  type="file"
                  id="avatar-file-input"
                  className="d-none"
                  accept=".jpg,.jpeg,.png"
                  onChange={handlePhotoChange}
                />
                <div className="d-flex gap-2 mb-3">
                  <button
                    type="button"
                    className="btn btn-outline-secondary btn-sm d-inline-flex align-items-center gap-2"
                    onClick={() => document.getElementById("avatar-file-input").click()}
                  >
                    <i className="fas fa-upload"></i> Upload Photo
                  </button>
                  {avatarImage && (
                    <button
                      type="button"
                      className="btn btn-outline-danger btn-sm"
                      onClick={handleRemovePhoto}
                    >
                      Remove
                    </button>
                  )}
                </div>

                {!avatarImage && (
                  <div>
                    <div
                      className="text-uppercase text-muted fw-semibold mb-2"
                      style={{ fontSize: 11, letterSpacing: 0.5 }}
                    >
                      Or pick a color for your initials
                    </div>
                    <div className="d-flex gap-2">
                      {AVATAR_COLORS.map((color) => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => setAvatarColor(color)}
                          title={color}
                          className="rounded-circle p-0"
                          style={{
                            width: 26,
                            height: 26,
                            background: color,
                            border:
                              avatarColor === color ? "2px solid var(--bs-body-color)" : "2px solid transparent",
                          }}
                        ></button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </DataCard>
        </section>

        {/* ========================================================== */}
        {/* DIVISION 3: PERSONAL INFORMATION                           */}
        {/* ========================================================== */}
        <section className="mb-3">
          <DataCard title="Personal Information">
            <div className="card-body row g-3">
              <div className="col-12 col-md-6">
                <FormField label="Full Name">
                  <input
                    type="text"
                    className="form-control"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    required
                  />
                </FormField>
              </div>
              <div className="col-12 col-md-6">
                <FormField label="Email">
                  <input
                    type="email"
                    className="form-control"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    required
                  />
                </FormField>
              </div>
              <div className="col-12 col-md-6">
                <FormField label="Role">
                  <input type="text" className="form-control" value={user.role} disabled readOnly />
                </FormField>
                <div className="text-muted" style={{ fontSize: 11.5 }}>
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
    </>
  );
}
