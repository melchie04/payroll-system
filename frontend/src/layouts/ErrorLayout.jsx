// Centred layout for the 404, 403 and 500 pages.

import { Outlet } from "react-router";
import Footer from "../components/Footer.jsx";

// Centres an error page on its plane and adds the footer.
export default function ErrorLayout() {
  return (
    <div id="layoutError" className="bg-body centered-bg d-flex flex-column" style={{ minHeight: "100vh" }}>
      <div className="flex-grow-1 d-flex align-items-center">
        <div className="container p-5">
          <div className="row justify-content-center text-center">
            <div className="col-12 col-md-8 col-lg-6 d-flex flex-column align-items-center centered-animate">
              <Outlet />
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
