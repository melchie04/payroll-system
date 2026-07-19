import { useEffect, useState } from "react";
import { PageHeader, TabsNav } from "../components/ui/index.jsx";
import { systemUsers, roles as initialRoles } from "../assets/data/index.js";

import { GeneralTab } from "../components/settings/GeneralTab.jsx";
import { UsersTab } from "../components/settings/UsersTab.jsx";
import { RolesTab } from "../components/settings/RolesTab.jsx";
import { ChangePasswordTab } from "../components/settings/ChangePasswordTab.jsx";

const TABS = [
  { key: "general", label: "General", icon: "fa-building" },
  { key: "users", label: "Users", icon: "fa-users" },
  { key: "roles", label: "Roles & Permissions", icon: "fa-shield-halved" },
  { key: "password", label: "Change Password", icon: "fa-key" },
];

// Settings — wires the General, Users, Roles & Permissions, and Change Password tabs together.
export default function Settings() {
  const [tab, setTab] = useState("users");
  const [users, setUsers] = useState(systemUsers);
  const [roleList, setRoleList] = useState(initialRoles);

  const [generalSaved, setGeneralSaved] = useState(false);

  useEffect(() => {
    if (!generalSaved) return;
    const timer = setTimeout(() => setGeneralSaved(false), 4000);
    return () => clearTimeout(timer);
  }, [generalSaved]);

  function handleSaveGeneral(e) {
    e.preventDefault();
    setGeneralSaved(true);
  }

  const [selfForm, setSelfForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [selfTouched, setSelfTouched] = useState(false);
  const [selfSuccess, setSelfSuccess] = useState(false);
  const [showSelfPassword, setShowSelfPassword] = useState(false);

  const selfHasLength = selfForm.newPassword.length >= 8;
  const selfHasCase = /[a-z]/.test(selfForm.newPassword) && /[A-Z]/.test(selfForm.newPassword);
  const selfHasNumber = /[0-9]/.test(selfForm.newPassword);
  const selfHasSpecial = /[^A-Za-z0-9]/.test(selfForm.newPassword);
  const selfMatches = selfForm.newPassword.length > 0 && selfForm.newPassword === selfForm.confirmPassword;
  const selfCanSubmit = selfForm.currentPassword.length > 0 && selfHasLength && selfHasCase && selfHasNumber && selfHasSpecial && selfMatches;

  useEffect(() => {
    if (!selfSuccess) return;
    const timer = setTimeout(() => setSelfSuccess(false), 4000);
    return () => clearTimeout(timer);
  }, [selfSuccess]);

  function handleSelfChange(e) {
    setSelfForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    setSelfSuccess(false);
  }

  function handleSelfSubmit(e) {
    e.preventDefault();
    setSelfTouched(true);
    if (!selfCanSubmit) return;
    setSelfForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    setSelfTouched(false);
    setSelfSuccess(true);
  }

  function switchTab(nextTab) {
    setGeneralSaved(false);
    setSelfSuccess(false);
    setTab(nextTab);
  }

  return (
    <>
      <section>
        <div className="mt-4">
          <PageHeader title="Settings" description="Manage your company profile, users, and roles." />
        </div>
      </section>

      <hr className="my-3 opacity-25" />

      <section>
        <TabsNav tabs={TABS} active={tab} onChange={switchTab} />
      </section>

      {tab === "general" && <GeneralTab generalSaved={generalSaved} onSave={handleSaveGeneral} />}

      {tab === "users" && <UsersTab users={users} setUsers={setUsers} roleList={roleList} />}

      {tab === "roles" && <RolesTab roleList={roleList} setRoleList={setRoleList} />}

      {tab === "password" && (
        <ChangePasswordTab
          self={{
            form: selfForm,
            touched: selfTouched,
            success: selfSuccess,
            showPassword: showSelfPassword,
            hasLength: selfHasLength,
            hasCase: selfHasCase,
            hasNumber: selfHasNumber,
            hasSpecial: selfHasSpecial,
            matches: selfMatches,
            canSubmit: selfCanSubmit,
          }}
          onChange={handleSelfChange}
          onSubmit={handleSelfSubmit}
          onToggleShowPassword={() => setShowSelfPassword((s) => !s)}
        />
      )}
    </>
  );
}
