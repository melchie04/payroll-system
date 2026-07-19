import { TabsNav } from "../ui/index.jsx";

const TABS = [
  { key: "general", label: "General", icon: "fa-building" },
  { key: "users", label: "Users", icon: "fa-users" },
  { key: "roles", label: "Roles & Permissions", icon: "fa-shield-halved" },
  { key: "password", label: "Change Password", icon: "fa-key" },
];

// SettingsTabsNav — tab navigation for the Settings page.
export function SettingsTabsNav({ tab, onSwitch }) {
  return <TabsNav tabs={TABS} active={tab} onChange={onSwitch} />;
}
