import { Outlet } from "react-router-dom";
import Footer from "../components/Footer.jsx";

export default function AuthLayout() {
  return (
    <div id="layoutAuthentication" className="bg-body">
      <div id="layoutAuthentication_content">
        <main
          className="d-flex align-items-center"
          style={{ minHeight: "100%" }}
        >
          <div className="container p-5">
            <div className="row justify-content-center">
              <div className="col-12 d-flex flex-column align-items-center">
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
