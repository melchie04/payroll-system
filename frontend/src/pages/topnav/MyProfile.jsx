// My Profile page: the header, the two tabs and the shared message banner.

import { useEffect, useState } from "react";
import { AppAlert, PageHeader, TabsNav } from "../../components/ui/index.jsx";
import ProfileGeneralTab from "./tabs/ProfileGeneralTab.jsx";
import ProfileSecurityTab from "./tabs/ProfileSecurityTab.jsx";

// The signed-in user's own details, split into General and Security tabs.
export default function MyProfile() {
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
          <PageHeader title="My Profile" description="Manage your own account details." />
        </div>
      </section>

      <hr className="my-3" />

      <section>
        <TabsNav
          tabs={[
            { key: "General", label: "General" },
            { key: "Security", label: "Security" },
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

      {tab === "General" ? <ProfileGeneralTab notify={notify} /> : <ProfileSecurityTab notify={notify} />}
    </>
  );
}
