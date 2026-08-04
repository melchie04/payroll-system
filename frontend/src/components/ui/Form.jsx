// Form and filter inputs, plus the labels and headings that sit beside them.

import { Children, isValidElement } from "react";

// A dropdown built from markup rather than a native select, so it can be themed.
export function FilterSelect({ label, value, onChange, children, id, ...rest }) {
  const options = Children.toArray(children)
    .filter(isValidElement)
    .map((child) => {
      const text = Array.isArray(child.props.children) ? child.props.children.join("") : String(child.props.children ?? "");
      return { value: child.props.value ?? text, label: text };
    });

  const current = options.find((o) => o.value === value);

  return (
    <div>
      {label && (
        <label className="app-label form-label mb-1 d-block">
          {label}
        </label>
      )}

      
      <div className="dropdown app-select">
        <button
          type="button"
          className="app-select-toggle"
          data-bs-toggle="dropdown"
          aria-expanded="false"
          aria-haspopup="listbox"
          aria-label={label}
          id={id}
          {...rest}
        >
          <span className="app-select-value">{current ? current.label : value}</span>
          <i className="fas fa-chevron-down app-select-caret" aria-hidden="true"></i>
        </button>

        <ul className="dropdown-menu app-select-menu" role="listbox">
          {options.map((o) => (
            <li key={o.value} role="none">
              <button
                type="button"
                role="option"
                aria-selected={o.value === value}
                className={`dropdown-item app-select-option ${o.value === value ? "is-selected" : ""}`}
                onClick={() => onChange?.({ target: { value: o.value } })}
              >
                <span>{o.label}</span>
                {o.value === value && <i className="fas fa-check" aria-hidden="true"></i>}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

// A text field with a magnifier, used to filter a list.
export function SearchInput({ label, placeholder, value, onChange, ...rest }) {
  return (
    <div className="w-100">
      {label && (
        <label className="app-label form-label mb-1 d-block">
          {label}
        </label>
      )}
      <div className="input-group input-group-sm w-100">
        <span className="input-group-text">
          <i className="fas fa-search text-muted"></i>
        </span>
        <input type="text" className="form-control" placeholder={placeholder} value={value} onChange={onChange} {...rest} />
      </div>
    </div>
  );
}

// One password rule, ticked once it is satisfied.
export function RequirementRow({ met, label }) {
  return (
    <div className="d-flex align-items-center gap-2">
      <i
        className={`fas ${met ? "fa-circle-check text-success" : "fa-circle text-muted"}`}
        style={{ fontSize: "var(--app-fs-1)", opacity: met ? 1 : 0.4 }}
      ></i>
      <span className={met ? "text-dark" : "text-muted"} style={{ fontSize: "var(--app-fs-3)" }}>
        {label}
      </span>
    </div>
  );
}

// A small heading that divides a form into groups.
export function SectionHeading({ children }) {
  return (
    <div className="fw-semibold text-body mb-3 pb-2 border-bottom" style={{ fontSize: "var(--app-fs-3)" }}>
      {children}
    </div>
  );
}

// Pairs a label with whatever control is passed as children.
export function FormField({ label, children }) {
  return (
    <div className="mb-3">
      <label className="app-label form-label mb-1 d-block">
        {label}
      </label>
      {children}
    </div>
  );
}
