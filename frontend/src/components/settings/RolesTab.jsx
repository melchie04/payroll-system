import { DataCard, BtnPrimary, IconBtn } from "../ui/index.jsx";

// RolesTab — roles & permissions table tab.
export function RolesTab({ roleList, onEditRole, onDeleteRole }) {
  return (
    <section className="mb-3">
      <DataCard
        title="Roles & Permissions"
        action={
          <BtnPrimary data-bs-toggle="modal" data-bs-target="#createRoleModal">
            <i className="fas fa-plus"></i> Create Role
          </BtnPrimary>
        }
      >
        <div className="card-body row g-3">
          {roleList.map((r) => (
            <div className="col-12 col-md-6" key={r.id}>
              <div className="border rounded-3 p-3 h-100">
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <div>
                    <div className="fw-semibold">{r.name}</div>
                    <div className="text-muted small">
                      {r.users} user{r.users === 1 ? "" : "s"}
                    </div>
                  </div>
                  <div className="d-flex gap-1">
                    <IconBtn title="Edit role" onClick={() => onEditRole(r)}>
                      <i className="fas fa-pen text-muted opacity-75"></i>
                    </IconBtn>
                    <IconBtn title="Delete role" data-bs-toggle="modal" data-bs-target="#deleteRoleModal" onClick={() => onDeleteRole(r)}>
                      <i className="fas fa-trash text-danger opacity-75"></i>
                    </IconBtn>
                  </div>
                </div>
                <p className="text-muted small mb-2">{r.description}</p>
                <div className="d-flex flex-wrap gap-1">
                  {r.permissions.map((p) => (
                    <span key={p} className="badge rounded-pill bg-secondary bg-opacity-10 text-secondary fw-normal">
                      {p}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </DataCard>
    </section>
  );
}
