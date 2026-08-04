// Page-level building blocks: header, tabs, modal and the brand lockup.

// The page title, its description and any action buttons.
export function PageHeader({ title, description, actions }) {
  return (
    <div className="d-flex flex-wrap justify-content-between align-items-start mb-4 gap-2">
      <div>
        <h1 className="page-title fw-bold mb-1">{title}</h1>
        {description && <p className="page-description text-muted mb-0">{description}</p>}
      </div>
      {actions && <div className="d-flex gap-2">{actions}</div>}
    </div>
  );
}

// The tab tray; reports the chosen tab back through onChange.
export function TabsNav({ tabs, active, onChange }) {
  return (
    <div className="tabs-nav">
      {tabs.map((t) => {
        const isActive = active === t.key;
        return (
          <button
            key={t.key}
            type="button"
            className={`tabs-nav-item ${isActive ? "active" : ""}`}
            aria-current={isActive ? "page" : undefined}
            onClick={() => onChange(t.key)}
          >
            {t.icon && <i className={`fas ${t.icon} opacity-75`}></i>}
            <span>{t.label}</span>
            {t.badge ? <span className="tabs-nav-badge badge rounded-pill">{t.badge}</span> : null}
          </button>
        );
      })}
    </div>
  );
}

// A dialog driven by Bootstrap's own modal behaviour.
export function Modal({ id, title, children, footer, size = "" }) {
  return (
    <div className="modal fade" id={id} tabIndex="-1" aria-labelledby={`${id}Label`} aria-hidden="true">
      <div className={`modal-dialog modal-dialog-centered ${size}`}>
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title fw-semibold" id={`${id}Label`}>
              {title}
            </h5>
            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div className="modal-body">{children}</div>
          {footer && <div className="modal-footer">{footer}</div>}
        </div>
      </div>
    </div>
  );
}

// The rounded square holding the brand letter.
export function BrandMark({ size = 40, className = "" }) {
  return (
    <span
      className={`app-brand-mark d-inline-flex align-items-center justify-content-center fw-bold ${className}`}
      style={{ width: size, height: size, fontSize: "var(--app-fs-6)" }}
      aria-hidden="true"
    >
      P
    </span>
  );
}

// The brand mark and wordmark side by side.
export function BrandLockup({ className = "" }) {
  return (
    <div className={`d-flex align-items-center justify-content-center gap-2 ${className}`}>
      <BrandMark size={26} />
      <span className="app-brand-name">PAYROLL</span>
    </div>
  );
}
