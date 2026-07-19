import { Outlet } from "react-router-dom";
import Footer from "../components/Footer.jsx";

// ErrorLayout — centered layout for the error pages.
export default function ErrorLayout() {
  return (
    <div
      id="layoutError"
      className="bg-body d-flex flex-column"
      style={{ minHeight: "100vh" }}
    >
      <div className="flex-grow-1 d-flex align-items-center">
        <div className="container py-5">
          <div className="row justify-content-center text-center">
            <div className="col-12 col-md-8 col-lg-6 d-flex flex-column align-items-center">
              <Outlet />
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
