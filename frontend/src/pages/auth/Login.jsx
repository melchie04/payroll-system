import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCurrentUser } from "../../context/CurrentUserContext.jsx";

// Login — sign-in form; redirects to Change Password when a password change is required.
export default function Login() {
  const navigate = useNavigate();
  const { user } = useCurrentUser();
  const [showPassword, setShowPassword] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    navigate(user.mustChangePassword ? "/change-password" : "/");
  }

  return (
    <div className="w-100" style={{ maxWidth: 360 }}>
      <h1
        className="text-center fw-normal text-secondary mb-4 tracking-wide text-uppercase"
        style={{
          fontSize: "1.35rem",
          color: "#777777",
          letterSpacing: "0.08em",
        }}
      >
        Sign In
      </h1>

      <form onSubmit={handleSubmit} noValidate>
        <div className="mb-3 position-relative">
          <div className="input-group">
            <span className="input-group-text bg-white border-end-0 rounded-start-pill text-muted px-3" style={{ borderColor: "#cccccc" }}>
              <div
                className="d-flex align-items-center justify-content-center border rounded-circle text-muted"
                style={{
                  width: "24px",
                  height: "24px",
                  fontSize: "0.75rem",
                  borderColor: "#cccccc",
                }}
              >
                <i className="fas fa-envelope"></i>
              </div>
            </span>
            <input
              type="email"
              className="form-control border-start-0 rounded-end-pill py-2.5 fs-6 fw-light"
              style={{ borderColor: "#cccccc", outline: "none" }}
              id="email"
              placeholder="Username"
              required
            />
          </div>
        </div>

        <div className="mb-4 position-relative">
          <div className="input-group">
            <span className="input-group-text bg-white border-end-0 rounded-start-pill text-muted px-3" style={{ borderColor: "#cccccc" }}>
              <div
                className="d-flex align-items-center justify-content-center border rounded-circle text-muted"
                style={{
                  width: "24px",
                  height: "24px",
                  fontSize: "0.75rem",
                  borderColor: "#cccccc",
                }}
              >
                <i className="fas fa-lock"></i>
              </div>
            </span>
            <input
              type={showPassword ? "text" : "password"}
              className="form-control border-start-0 border-end-0 py-2.5 fs-6 fw-light"
              style={{ borderColor: "#cccccc", outline: "none" }}
              id="password"
              placeholder="Password"
              required
            />
            <button
              className="btn btn-outline-secondary border-start-0 rounded-end-pill bg-transparent text-muted px-3"
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              style={{ borderColor: "#cccccc" }}
            >
              <div
                className="d-flex align-items-center justify-content-center border rounded-circle text-muted"
                style={{
                  width: "24px",
                  height: "24px",
                  fontSize: "0.75rem",
                  borderColor: "#cccccc",
                }}
              >
                <i className={`fas ${showPassword ? "fa-eye-slash" : "fa-eye"}`}></i>
              </div>
            </button>
          </div>
        </div>

        <button
          type="submit"
          className="btn btn-dark rounded-pill w-100 text-white py-2 fw-normal shadow-sm"
          style={{
            fontSize: "0.95rem",
          }}
        >
          Login
        </button>
      </form>
    </div>
  );
}
