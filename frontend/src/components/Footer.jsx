export default function Footer() {
  return (
    <footer className="py-3 bg-light mt-auto border-top">
      <div className="container-fluid px-4">
        <div
          className="d-flex flex-column flex-sm-row align-items-center justify-content-between gap-1 text-center text-sm-start"
          style={{ fontSize: "calc(0.75rem + 0.15vw)" }}
        >
          <div className="text-muted fs-7 fs-sm-6">Copyright &copy; Payroll System 2026</div>
          <div className="d-flex align-items-center gap-1 justify-content-center fs-7 fs-sm-6">
            <a href="#" className="text-decoration-none">
              Privacy Policy
            </a>
            <span className="text-muted">&middot;</span>
            <a href="#" className="text-decoration-none">
              Terms &amp; Conditions
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
