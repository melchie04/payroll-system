// The app's button components in their four roles.

// The page's main action, filled in the accent colour.
export function BtnPrimary({ children, onClick, type = "button", className = "", ...rest }) {
  return (
    <button type={type} className={`btn btn-app-primary btn-sm d-inline-flex align-items-center gap-2 ${className}`} onClick={onClick} {...rest}>
      {children}
    </button>
  );
}

// A destructive action, filled red.
export function BtnDanger({ children, onClick, type = "button", className = "", ...rest }) {
  return (
    <button type={type} className={`btn btn-danger btn-sm d-inline-flex align-items-center gap-2 ${className}`} onClick={onClick} {...rest}>
      {children}
    </button>
  );
}

// A supporting action, outlined rather than filled.
export function BtnSecondary({ children, onClick, type = "button", className = "", ...rest }) {
  return (
    <button
      type={type}
      className={`btn btn-outline-secondary btn-sm d-inline-flex align-items-center gap-2 ${className}`}
      onClick={onClick}
      {...rest}
    >
      {children}
    </button>
  );
}

// A button carrying only an icon, used inside rows and menus.
export function IconBtn({ children, title, onClick, className = "", ...rest }) {
  return (
    <button type="button" className={`app-icon-btn btn btn-sm btn-link text-muted p-1 ${className}`} title={title} onClick={onClick} {...rest}>
      {children}
    </button>
  );
}
