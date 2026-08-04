// Sign-in page.

import { useState } from "react";
import { BrandLockup } from "../../components/ui/index.jsx";
import { useNavigate } from "react-router";
import { useCurrentUser } from "../../context/CurrentUserContext.jsx";

// Renders the sign-in form.
export default function Login() {
  const navigate = useNavigate();
  const { user } = useCurrentUser();
  const [showPassword, setShowPassword] = useState(false);

  // Signs the user in and sends them to the dashboard.
  function handleSubmit(e) {
    e.preventDefault();
    navigate(user.mustChangePassword ? "/change-password" : "/");
  }

  return (
    <div className="w-100" style={{ maxWidth: 360 }}>
      <BrandLockup className="mb-2" />
      <hr className="mx-auto mb-3 opacity-25" style={{ maxWidth: 200 }} />
      <h1 className="auth-heading text-center mb-4 text-uppercase">Sign In</h1>

      <form onSubmit={handleSubmit} noValidate>
        <div className="mb-3 position-relative">
          <div className="input-group">
            <span className="input-group-text border-end-0 rounded-start-pill text-muted px-3">
              <div
                className="d-flex align-items-center justify-content-center border rounded-circle"
                style={{
                  width: "var(--app-icon-xs)",
                  height: "var(--app-icon-xs)",
                  fontSize: "var(--app-fs-2)",
                  borderColor: "var(--app-auth-icon)",
                  color: "var(--app-auth-icon)",
                }}
              >
                <i className="fas fa-envelope"></i>
              </div>
            </span>
            <input
              type="email"
              className="form-control border-start-0 rounded-end-pill py-2.5 fw-light"
              style={{ outline: "none" }}
              id="email"
              placeholder="Username"
              required
            />
          </div>
        </div>

        <div className="mb-4 position-relative">
          <div className="input-group">
            <span className="input-group-text border-end-0 rounded-start-pill text-muted px-3">
              <div
                className="d-flex align-items-center justify-content-center border rounded-circle"
                style={{
                  width: "var(--app-icon-xs)",
                  height: "var(--app-icon-xs)",
                  fontSize: "var(--app-fs-2)",
                  borderColor: "var(--app-auth-icon)",
                  color: "var(--app-auth-icon)",
                }}
              >
                <i className="fas fa-lock"></i>
              </div>
            </span>
            <input
              type={showPassword ? "text" : "password"}
              className="form-control border-start-0 border-end-0 py-2.5 fw-light"
              style={{ outline: "none" }}
              id="password"
              placeholder="Password"
              required
            />
            <button
              className="btn btn-outline-secondary border-start-0 rounded-end-pill bg-transparent text-muted px-3"
              type="button"
              tabIndex={-1}
              onClick={() => setShowPassword((s) => !s)}
            >
              <div
                className="d-flex align-items-center justify-content-center border rounded-circle text-muted"
                style={{
                  width: "var(--app-icon-xs)",
                  height: "var(--app-icon-xs)",
                  fontSize: "var(--app-fs-2)",
                  borderColor: "var(--app-auth-field-border)",
                }}
              >
                <i className={`fas ${showPassword ? "fa-eye-slash" : "fa-eye"}`}></i>
              </div>
            </button>
          </div>
        </div>

        <button
          type="submit"
          className="btn btn-app-primary rounded-pill w-100 text-white py-2 fw-normal shadow-sm"
          style={{
            fontSize: "var(--app-fs-5)",
          }}
        >
          Login
        </button>
      </form>
    </div>
  );
}
