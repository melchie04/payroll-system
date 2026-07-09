const TABS = [
  { key: "general", label: "General", icon: "fa-building" },
  { key: "users", label: "Users", icon: "fa-users" },
  { key: "roles", label: "Roles & Permissions", icon: "fa-shield-halved" },
  { key: "password", label: "Change Password", icon: "fa-key" },
];

export function SettingsTabsNav({ tab, onSwitch }) {
  return (
    <ul className="nav nav-tabs mb-4">
      {TABS.map((t) => (
        <li className="nav-item" key={t.key}>
          <button type="button" className={`nav-link ${tab === t.key ? "active fw-semibold" : "text-muted"}`} onClick={() => onSwitch(t.key)}>
            <i className={`fas ${t.icon} me-2 opacity-75`}></i>
            {t.label}
          </button>
        </li>
      ))}
    </ul>
  );
}
