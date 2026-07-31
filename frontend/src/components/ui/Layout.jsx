// Page furniture: the page header, tab strip and modal shell.

export function PageHeader({ title, description, actions }) {
  return (
    <div className="d-flex flex-wrap justify-content-between align-items-start mb-4 gap-2">
      <div>
        <h1 className="h4 fw-bold mb-1">{title}</h1>
        {description && <p className="text-muted small mb-0">{description}</p>}
      </div>
      {actions && <div className="d-flex gap-2">{actions}</div>}
    </div>
  );
}

// TabsNav — page tab navigation; styling and states live in _tabs.scss.

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
            {t.badge ? <span className="badge rounded-pill bg-danger">{t.badge}</span> : null}
          </button>
        );
      })}
    </div>
  );
}

// ActionsMenu — per-row "..." dropdown menu.

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

// SectionHeading — groups a set of form fields. Deliberately outranks the
// FormField label, which is uppercase, muted and 11px.

// BrandMark — the P square used in the top bar, on the auth pages and as the favicon.
// Colour comes from tokens so it inverts with the theme without any JS.
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
