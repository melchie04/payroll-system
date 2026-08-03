import { useState } from "react";
import { DataCard, BtnSecondary, PageHeader, TabsNav } from "../../components/ui/index.jsx";
import { useNotifications } from "../../context/NotificationsContext.jsx";

// How many rows the list starts with, and how many each press of Load more adds.
const PAGE_SIZE = 10;

// Notifications — notification list with all/unread filters and mark-as-read actions.
export default function Notifications() {
  const { notifications, unreadCount, markAllRead, markOneRead } = useNotifications();
  const [filter, setFilter] = useState("All");
  const [shownCount, setShownCount] = useState(PAGE_SIZE);

  const matching = filter === "All" ? notifications : notifications.filter((n) => !n.read);
  const visible = matching.slice(0, shownCount);
  const remaining = matching.length - visible.length;

  // Switching tab starts the list from the top again, so the count under the card
  // never describes a longer list than the one being shown.
  function changeFilter(next) {
    setFilter(next);
    setShownCount(PAGE_SIZE);
  }

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
          onChange={changeFilter}
        />
      </section>

      <section className="mb-3">
        <DataCard>
          <div className="list-group list-group-flush">
            {visible.length === 0 && <div className="text-center text-muted py-5 small">You're all caught up!</div>}
            {visible.map((n) => (
              <div className={`notif-row list-group-item d-flex align-items-start gap-3 px-3 ${!n.read ? "notif-row-unread" : ""}`} key={n.id}>
                <div className="flex-grow-1" style={{ minWidth: 0 }}>
                  <div className="text-dark lh-base mb-2" style={{ fontSize: "var(--app-fs-4)", overflowWrap: "anywhere" }}>
                    <span>{n.title} </span>
                    <strong className="fw-semibold">{n.bold}</strong> <span>{n.sub}</span>
                  </div>

                  <div className="d-flex align-items-center flex-wrap gap-2">
                    <span className="app-chip badge rounded-pill py-1">{n.type}</span>
                    <span className="text-muted text-nowrap" style={{ fontSize: "var(--app-fs-2)" }}>
                      {n.time}
                    </span>
                    {!n.read && (
                      <>
                        <span className="text-muted" style={{ fontSize: "var(--app-fs-2)" }}>
                          &middot;
                        </span>
                        <button
                          type="button"
                          className="btn btn-sm btn-link p-0 text-decoration-none"
                          style={{ fontSize: "var(--app-fs-2)" }}
                          onClick={() => markOneRead(n.id)}
                        >
                          Mark as read
                        </button>
                      </>
                    )}
                  </div>
                </div>

                <span className={`notif-dot flex-shrink-0 ${n.read ? "is-read" : ""}`}>
                  {!n.read && <span className="visually-hidden">Unread</span>}
                </span>
              </div>
            ))}

            {remaining > 0 && (
              <button type="button" className="notif-more list-group-item" onClick={() => setShownCount((c) => c + PAGE_SIZE)}>
                Load more
                <i className="fas fa-chevron-down ms-2"></i>
              </button>
            )}
          </div>
        </DataCard>

        {matching.length > 0 && (
          <div className="text-muted mt-2" style={{ fontSize: "var(--app-fs-2)" }}>
            Showing {visible.length} of {matching.length} notification{matching.length === 1 ? "" : "s"}
          </div>
        )}
      </section>
    </>
  );
}
