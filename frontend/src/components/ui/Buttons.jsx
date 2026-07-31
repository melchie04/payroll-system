// Primary, danger, secondary and icon buttons.

export function BtnPrimary({ children, onClick, type = "button", className = "", ...rest }) {
  return (
    <button type={type} className={`btn btn-dark btn-sm d-inline-flex align-items-center gap-2 ${className}`} onClick={onClick} {...rest}>
      {children}
    </button>
  );
}

// BtnDanger — destructive action button.

export function BtnDanger({ children, onClick, type = "button", className = "", ...rest }) {
  return (
    <button type={type} className={`btn btn-danger btn-sm d-inline-flex align-items-center gap-2 ${className}`} onClick={onClick} {...rest}>
      {children}
    </button>
  );
}

// BtnSecondary — outlined secondary action button.

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

// IconBtn — small icon-only button.

export function IconBtn({ children, title, onClick, className = "", ...rest }) {
  return (
    <button type="button" className={`btn btn-sm btn-link text-muted p-1 ${className}`} title={title} onClick={onClick} {...rest}>
      {children}
    </button>
  );
}

// StatCard — summary metric card.
