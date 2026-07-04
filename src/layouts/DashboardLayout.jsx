import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import TopNav from "../components/TopNav.jsx";
import SideNav from "../components/SideNav.jsx";
import Footer from "../components/Footer.jsx";

export default function DashboardLayout({ fixed = true }) {
  const [toggled, setToggled] = useState(false);

  useEffect(() => {
    document.body.classList.toggle("sb-nav-fixed", fixed);
    return () => document.body.classList.remove("sb-nav-fixed");
  }, [fixed]);

  useEffect(() => {
    document.body.classList.toggle("sb-sidenav-toggled", toggled);
  }, [toggled]);

  return (
    <>
      <TopNav onToggleSidebar={() => setToggled((t) => !t)} />
      <div id="layoutSidenav">
        <div id="layoutSidenav_nav">
          <SideNav />
        </div>
        <div id="layoutSidenav_content">
          <main>
            <div className="container-fluid px-4">
              <Outlet />
            </div>
          </main>
          <Footer />
        </div>
      </div>
    </>
  );
}
