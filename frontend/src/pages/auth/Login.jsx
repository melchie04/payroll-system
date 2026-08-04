// Sign-in page.

import { useState } from "react";
import { BrandLockup } from "../../components/ui/index.jsx";
import { useNavigate } from "react-router";
import { useCurrentUser } from "../../context/hooks.js";

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
      <BrandLockup />
      <hr className="auth-divider" />
      <h1 className="auth-heading text-center mb-1">Sign in</h1>
      <p className="auth-subtitle text-center mb-4">Enter your details to continue</p>

      <form onSubmit={handleSubmit} noValidate>
        <div className="mb-3 position-relative">
          <div className="input-group auth-field">
            <span className="input-group-text pe-0">
              <i className="fas fa-envelope"></i>
            </span>
            <input type="email" className="form-control fw-light" style={{ outline: "none" }} id="email" placeholder="Username" required />
          </div>
        </div>

        <div className="mb-4 position-relative">
          <div className="input-group auth-field">
            <span className="input-group-text pe-0">
              <i className="fas fa-lock"></i>
            </span>
            <input
              type={showPassword ? "text" : "password"}
              className="form-control fw-light"
              style={{ outline: "none" }}
              id="password"
              placeholder="Password"
              required
            />
            <button className="btn" type="button" tabIndex={-1} onClick={() => setShowPassword((s) => !s)} aria-label={showPassword ? "Hide password" : "Show password"}>
              <i className={`fas ${showPassword ? "fa-eye-slash" : "fa-eye"}`}></i>
            </button>
          </div>
        </div>

        <button type="submit" className="btn btn-app-primary centered-submit w-100 text-white fw-normal">
          Sign in
        </button>
      </form>
    </div>
  );
}
