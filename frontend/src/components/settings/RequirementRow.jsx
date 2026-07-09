export function RequirementRow({ met, label }) {
  return (
    <div className="d-flex align-items-center gap-2 mb-1">
      <i
        className={`fas ${met ? "fa-circle-check text-success" : "fa-circle text-muted"}`}
        style={{ fontSize: "0.7rem", opacity: met ? 1 : 0.4 }}
      ></i>
      <span className={met ? "text-dark" : "text-muted"} style={{ fontSize: "0.8rem" }}>
        {label}
      </span>
    </div>
  );
}
