// The footer bar shown at the bottom of every layout.

// Set to false to remove the developer credit before handing the project to a client.
const SHOW_CREDIT = true;

// Renders the copyright line, the optional developer credit and the policy links.
export default function Footer() {
  return (
    <footer className="app-footer mt-auto">
      <div className="container-fluid px-4">
        <div className="d-flex flex-column flex-sm-row align-items-center justify-content-between gap-1 text-center text-sm-start">
          <div>
            Copyright &copy; Payroll System 2026
            {SHOW_CREDIT && (
              <>
                <span className="app-footer-sep"> &middot; </span>
                <span className="app-footer-credit">Designed &amp; developed by Melchor Callos</span>
              </>
            )}
          </div>
          <div className="app-footer-links d-flex align-items-center gap-1 justify-content-center">
            <a href="#" className="text-decoration-none">
              Privacy Policy
            </a>
            <span aria-hidden="true">&middot;</span>
            <a href="#" className="text-decoration-none">
              Terms &amp; Conditions
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
