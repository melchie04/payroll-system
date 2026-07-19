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
                <BtnSecondary onClick={markAllRead} className="w-100 w-sm-auto">
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
              <div className={`list-group-item d-flex align-items-start gap-2 gap-sm-3 py-3 ${!n.read ? "bg-light" : ""}`} key={n.id}>
                <div
                  className="d-flex align-items-center justify-content-center flex-shrink-0 border rounded-2 bg-white text-secondary"
                  style={{ width: 32, height: 32, fontSize: 13 }}
                >
                  {n.icon}
                </div>
                <div className="flex-grow-1 min-w-0">
                  <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start gap-1 gap-sm-2 mb-1.5">
                    <div className="small text-dark lh-sm text-wrap word-break">
                      <span>{n.title} </span>
                      <strong className="fw-semibold">{n.bold}</strong> <span>{n.sub}</span>
                    </div>
                    <div className="text-muted text-sm-end mt-0.5 mt-sm-0" style={{ fontSize: "11px", minWidth: "75px" }}>
                      {n.time}
                    </div>
                  </div>
                  <div className="d-flex align-items-center flex-wrap gap-2">
                    <span className="badge rounded-pill bg-secondary bg-opacity-10 text-secondary fw-normal py-1">{n.type}</span>
                    {!n.read && (
                      <button
                        type="button"
                        className="btn btn-sm btn-link p-0 text-decoration-none fw-medium"
                        style={{ fontSize: 12 }}
                        onClick={() => markOneRead(n.id)}
                      >
                        Mark as read
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </DataCard>
      </section>
    </>
  );
}
