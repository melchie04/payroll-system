// The signed-in shell: top bar, sidebar, page content and footer.

import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router";
import TopNav from "../components/TopNav.jsx";
import SideNav from "../components/SideNav.jsx";
import Footer from "../components/Footer.jsx";

const OVERLAY_SIDEBAR_QUERY = "(max-width: 991.98px)";

// Assembles the signed-in shell and tracks whether the sidebar is collapsed.
export default function DashboardLayout({ fixed = true }) {
  const [toggled, setToggled] = useState(false);
  const [overlay, setOverlay] = useState(() => window.matchMedia(OVERLAY_SIDEBAR_QUERY).matches);
  const location = useLocation();
  const [lastPath, setLastPath] = useState(location.pathname);

  useEffect(() => {
    document.body.classList.toggle("sb-nav-fixed", fixed);
    return () => document.body.classList.remove("sb-nav-fixed");
  }, [fixed]);

  useEffect(() => {
    document.body.classList.toggle("sb-sidenav-toggled", toggled);
  }, [toggled]);

  // Follows the viewport, so the sidebar only behaves as an overlay on small screens.
  useEffect(() => {
    const query = window.matchMedia(OVERLAY_SIDEBAR_QUERY);
    const handleChange = (e) => setOverlay(e.matches);
    query.addEventListener("change", handleChange);
    return () => query.removeEventListener("change", handleChange);
  }, []);

  // Closes the overlay sidebar whenever the page behind it changes, however that happened.
  // Adjusted during render rather than in an effect, which would cascade an extra commit.
  if (lastPath !== location.pathname) {
    setLastPath(location.pathname);
    if (overlay && toggled) {
      setToggled(false);
    }
  }

  // Closes the sidebar as soon as an item is tapped, without waiting for the route to change.
  function handleNavItemSelect() {
    if (overlay) {
      setToggled(false);
    }
  }

  return (
    <>
      <TopNav onToggleSidebar={() => setToggled((t) => !t)} />
      <div id="layoutSidenav">
        <div id="layoutSidenav_nav">
          <SideNav onNavItemSelect={handleNavItemSelect} />
        </div>
        <div id="layoutSidenav_content">
          <main>
            <div className="container-fluid app-page">
              <Outlet />
            </div>
            <Footer />
          </main>
        </div>
      </div>
    </>
  );
}
