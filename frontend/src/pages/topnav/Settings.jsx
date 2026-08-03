import { useEffect, useState } from "react";
import { PageHeader, TabsNav } from "../../components/ui/index.jsx";
import { systemUsers, roles as initialRoles } from "../../assets/data/index.js";

import { GeneralTab } from "./tabs/GeneralTab.jsx";
import { UsersTab } from "./tabs/UsersTab.jsx";
import { RolesTab } from "./tabs/RolesTab.jsx";

const TABS = [
  { key: "general", label: "General", icon: "fa-building" },
  { key: "users", label: "Users", icon: "fa-users" },
  { key: "roles", label: "Roles & Permissions", icon: "fa-shield-halved" },
];

// Settings — wires the General, Users, and Roles & Permissions tabs together.
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

  function switchTab(nextTab) {
    setGeneralSaved(false);
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

    </>
  );
}
