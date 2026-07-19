import { useState } from "react";
import { DataCard, BtnSecondary, PageHeader, TabsNav } from "../components/ui/index.jsx";
import { useNotifications } from "../context/NotificationsContext.jsx";

// Notifications — notification list with all/unread filters and mark-as-read actions.
export default function Notifications() {
  const { notifications, unreadCount, markAllRead, markOneRead } = useNotifications();
  const [filter, setFilter] = useState("All");

  const visible = filter === "All" ? notifications : notifications.filter((n) => !n.read);

  return (
    <>
      <section>
        <div className="mt-4">
          <PageHeader
            title="Notifications"
            description={`You have ${unreadCount} unread notification${unreadCount === 1 ? "" : "s"}.`}
            actions={
              <div className="mt-2 mt-sm-0">
                <BtnSecondary onClick={markAllRead} disabled={unreadCount === 0} className="w-100 w-sm-auto">
                  <i className="fas fa-check-double me-1"></i> Mark all as read
                </BtnSecondary>
              </div>
            }
          />
        </div>
      </section>

      <hr className="my-3 opacity-25" />

      <section>
        <TabsNav
          tabs={[
            { key: "All", label: "All" },
            { key: "Unread", label: "Unread", badge: unreadCount > 0 ? unreadCount : null },
          ]}
          active={filter}
          onChange={setFilter}
        />
      </section>

      <section className="mb-3">
        <DataCard>
          <div className="list-group list-group-flush">
            {visible.length === 0 && <div className="text-center text-muted py-5 small">You're all caught up!</div>}
            {visible.map((n) => (
              <div className={`list-group-item d-flex align-items-start gap-3 px-3 py-3 ${!n.read ? "bg-light" : ""}`} key={n.id}>
                <div
                  className="d-flex align-items-center justify-content-center flex-shrink-0 border rounded-3 bg-white text-secondary"
                  style={{ width: 40, height: 40, fontSize: 16 }}
                >
                  {n.icon}
                </div>

                <div className="flex-grow-1" style={{ minWidth: 0 }}>
                  <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start gap-1 gap-sm-4 mb-2">
                    <div className="text-dark lh-base" style={{ fontSize: "0.9375rem", overflowWrap: "anywhere" }}>
                      <span>{n.title} </span>
                      <strong className="fw-semibold">{n.bold}</strong> <span>{n.sub}</span>
                    </div>
                    <div className="text-muted text-nowrap" style={{ fontSize: 12 }}>
                      {n.time}
                    </div>
                  </div>

                  <div className="d-flex align-items-center flex-wrap gap-2">
                    <span className="badge rounded-pill bg-secondary bg-opacity-10 text-secondary fw-normal py-1">{n.type}</span>
                    {!n.read && (
                      <>
                        <span className="text-muted" style={{ fontSize: 12 }}>
                          &middot;
                        </span>
                        <button
                          type="button"
                          className="btn btn-sm btn-link p-0 text-decoration-none"
                          style={{ fontSize: 12 }}
                          onClick={() => markOneRead(n.id)}
                        >
                          Mark as read
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {!n.read && (
                  <span className="rounded-circle flex-shrink-0 mt-2" style={{ width: 8, height: 8, background: "#ff9c55" }}>
                    <span className="visually-hidden">Unread</span>
                  </span>
                )}
              </div>
            ))}
          </div>
        </DataCard>
      </section>
    </>
  );
}
