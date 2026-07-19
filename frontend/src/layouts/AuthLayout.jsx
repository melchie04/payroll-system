import { Outlet } from "react-router-dom";
import Footer from "../components/Footer.jsx";

// AuthLayout — centered layout for the auth pages.
export default function AuthLayout() {
  return (
    <div id="layoutAuthentication" className="bg-body auth-bg d-flex flex-column" style={{ minHeight: "100vh" }}>
      <div id="layoutAuthentication_content" className="d-flex flex-column flex-grow-1">
        <main className="d-flex align-items-center justify-content-center flex-grow-1">
          <div className="container p-5">
            <div className="row justify-content-center">
              <div className="col-12 d-flex flex-column align-items-center auth-animate">
                <Outlet />
              </div>
            </div>
          </div>
        </main>
      </div>
      <div id="layoutAuthentication_footer">
        <Footer />
      </div>
    </div>
  );
}
