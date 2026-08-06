// Settings page: the header, the three tabs and the shared message banner.

import { useEffect, useState } from "react";
import { AppAlert, PageHeader, TabsNav } from "../../components/ui/index.jsx";
import { systemUsers, roles as initialRoles } from "../../assets/data/index.js";
import SettingsGeneralTab from "./tabs/SettingsGeneralTab.jsx";
import SettingsRolesTab from "./tabs/SettingsRolesTab.jsx";
import SettingsUsersTab from "./tabs/SettingsUsersTab.jsx";

// Holds the company, users and roles tabs and the state they share.
export default function Settings() {
  const [users, setUsers] = useState(systemUsers);
  const [roleList, setRoleList] = useState(initialRoles);
  const [tab, setTab] = useState("General");
  const [notice, setNotice] = useState(null);

  // Success messages clear themselves; errors stay until dismissed or fixed.
  useEffect(() => {
    if (!notice || notice.tone !== "success") return;
    const timer = setTimeout(() => setNotice(null), 4000);
    return () => clearTimeout(timer);
  }, [notice]);

  // Raises one message above the cards.
  function notify(tone, message) {
    setNotice({ tone, message });
    document.querySelector("main")?.scrollTo({ top: 0, behavior: "smooth" });
  }

  // Switches tab and clears any message left over from the other one.
  function changeTab(next) {
    setTab(next);
    setNotice(null);
  }

  return (
    <>
      <section>
        <div className="mt-4">
          <PageHeader title="Settings" description="Manage your company profile, users, and roles." />
        </div>
      </section>

      <hr className="my-3" />

      <section>
        <TabsNav
          tabs={[
            { key: "General", label: "General" },
            { key: "Users", label: "Users" },
            { key: "Roles", label: "Roles" },
          ]}
          active={tab}
          onChange={changeTab}
        />
      </section>

      {notice && (
        <section className="mb-3">
          <AppAlert tone={notice.tone} message={notice.message} onDismiss={() => setNotice(null)} />
        </section>
      )}

      {tab === "General" && <SettingsGeneralTab notify={notify} />}
      {tab === "Users" && <SettingsUsersTab users={users} setUsers={setUsers} roleList={roleList} notify={notify} />}
      {tab === "Roles" && <SettingsRolesTab roleList={roleList} setRoleList={setRoleList} notify={notify} />}
    </>
  );
}
