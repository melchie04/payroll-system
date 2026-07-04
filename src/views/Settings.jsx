import { useState } from "react";
import {
  DataCard,
  Table,
  Tr,
  Td,
  Badge,
  BtnPrimary,
  BtnSecondary,
  IconBtn,
  ActionsMenu,
  Modal,
  FormField,
  PageHeader,
} from "../components/ui/index.jsx";
import { systemUsers, roles as initialRoles } from "../data/index.js";

const MODULES = [
  "Dashboard",
  "Payroll",
  "Billing",
  "Timesheet",
  "Employees",
  "Clients",
  "Settings",
];

export default function Settings() {
  const [tab, setTab] = useState("users");
  const [users, setUsers] = useState(systemUsers);
  const [roleList, setRoleList] = useState(initialRoles);

  const [userForm, setUserForm] = useState({
    name: "",
    email: "",
    role: roleList[0]?.name || "",
    status: "Active",
  });
  const [roleForm, setRoleForm] = useState({
    name: "",
    description: "",
    permissions: [],
  });

  function handleUserChange(e) {
    setUserForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  function handleCreateUser(e) {
    e.preventDefault();
    if (!userForm.name || !userForm.email) return;
    setUsers((prev) => [...prev, { id: Date.now(), ...userForm }]);
    setUserForm({
      name: "",
      email: "",
      role: roleList[0]?.name || "",
      status: "Active",
    });
    document.getElementById("createUserModalClose")?.click();
  }

  function handleRoleChange(e) {
    setRoleForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  function togglePermission(mod) {
    setRoleForm((f) => ({
      ...f,
      permissions: f.permissions.includes(mod)
        ? f.permissions.filter((m) => m !== mod)
        : [...f.permissions, mod],
    }));
  }

  function handleCreateRole(e) {
    e.preventDefault();
    if (!roleForm.name) return;
    setRoleList((prev) => [...prev, { id: Date.now(), users: 0, ...roleForm }]);
    setRoleForm({ name: "", description: "", permissions: [] });
    document.getElementById("createRoleModalClose")?.click();
  }

  function deleteUser(id) {
    setUsers((prev) => prev.filter((u) => u.id !== id));
  }

  function deleteRole(id) {
    setRoleList((prev) => prev.filter((r) => r.id !== id));
  }

  return (
    <>
      {/* ========================================================== */}
      {/* DIVISION 1: HEADER                                         */}
      {/* ========================================================== */}
      <section>
        <div className="mt-4">
          <PageHeader
            title="Settings"
            description="Manage your company profile, users, and roles."
          />
        </div>
      </section>

      {/* LINE DIVIDER */}
      <hr className="my-3 opacity-25" />

      {/* ========================================================== */}
      {/* DIVISION 2: TABS                                           */}
      {/* ========================================================== */}
      <section>
        <ul className="nav nav-tabs mb-4">
          {[
            { key: "general", label: "General", icon: "fa-building" },
            { key: "users", label: "Users", icon: "fa-users" },
            {
              key: "roles",
              label: "Roles & Permissions",
              icon: "fa-shield-halved",
            },
          ].map((t) => (
            <li className="nav-item" key={t.key}>
              <button
                type="button"
                className={`nav-link ${tab === t.key ? "active fw-semibold" : "text-muted"}`}
                onClick={() => setTab(t.key)}
              >
                <i className={`fas ${t.icon} me-2 opacity-75`}></i>
                {t.label}
              </button>
            </li>
          ))}
        </ul>
      </section>

      {/* ========================================================== */}
      {/* DIVISION 3: GENERAL TAB                                    */}
      {/* ========================================================== */}
      {tab === "general" && (
        <section className="mb-3">
          <DataCard title="Company Profile">
            <form className="card-body row g-3">
              <div className="col-12 col-md-6">
                <FormField label="Company Name">
                  <input
                    type="text"
                    className="form-control"
                    defaultValue="Payroll System Inc."
                  />
                </FormField>
              </div>
              <div className="col-12 col-md-6">
                <FormField label="Support Email">
                  <input
                    type="email"
                    className="form-control"
                    defaultValue="support@payrollsys.com"
                  />
                </FormField>
              </div>
              <div className="col-12 col-md-6">
                <FormField label="Default Currency">
                  <select className="form-select" defaultValue="PHP">
                    <option value="PHP">₱ Philippine Peso (PHP)</option>
                    <option value="USD">$ US Dollar (USD)</option>
                  </select>
                </FormField>
              </div>
              <div className="col-12 col-md-6">
                <FormField label="Pay Schedule">
                  <select className="form-select" defaultValue="semi-monthly">
                    <option value="semi-monthly">Semi-Monthly</option>
                    <option value="monthly">Monthly</option>
                    <option value="weekly">Weekly</option>
                  </select>
                </FormField>
              </div>
              <div className="col-12">
                <BtnPrimary type="submit">
                  <i className="fas fa-floppy-disk"></i> Save Changes
                </BtnPrimary>
              </div>
            </form>
          </DataCard>
        </section>
      )}

      {/* ========================================================== */}
      {/* DIVISION 4: USERS TAB                                      */}
      {/* ========================================================== */}
      {tab === "users" && (
        <section className="mb-3">
          <DataCard
            title="System Users"
            action={
              <BtnPrimary
                data-bs-toggle="modal"
                data-bs-target="#createUserModal"
              >
                <i className="fas fa-user-plus"></i> Create User
              </BtnPrimary>
            }
          >
            <Table headers={["Name", "Email", "Role", "Status", "Actions"]}>
              {users.map((u) => (
                <Tr key={u.id}>
                  <Td bold>{u.name}</Td>
                  <Td>{u.email}</Td>
                  <Td>{u.role}</Td>
                  <Td>
                    <Badge status={u.status} />
                  </Td>
                  <Td>
                    <ActionsMenu
                      items={[
                        { label: "Edit User", icon: "fa-pen" },
                        { label: "Reset Password", icon: "fa-key" },
                        { divider: true },
                        {
                          label: "Delete User",
                          icon: "fa-trash",
                          danger: true,
                          onClick: () => deleteUser(u.id),
                        },
                      ]}
                    />
                  </Td>
                </Tr>
              ))}
            </Table>
          </DataCard>
        </section>
      )}

      {/* ========================================================== */}
      {/* DIVISION 5: ROLES TAB                                      */}
      {/* ========================================================== */}
      {tab === "roles" && (
        <section className="mb-3">
          <DataCard
            title="Roles & Permissions"
            action={
              <BtnPrimary
                data-bs-toggle="modal"
                data-bs-target="#createRoleModal"
              >
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
                      <IconBtn
                        title="Delete role"
                        onClick={() => deleteRole(r.id)}
                      >
                        <i className="fas fa-trash text-danger opacity-75"></i>
                      </IconBtn>
                    </div>
                    <p className="text-muted small mb-2">{r.description}</p>
                    <div className="d-flex flex-wrap gap-1">
                      {r.permissions.map((p) => (
                        <span
                          key={p}
                          className="badge rounded-pill bg-secondary bg-opacity-10 text-secondary fw-normal"
                        >
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
      )}

      {/* ========================================================== */}
      {/* MODAL: CREATE USER                                         */}
      {/* ========================================================== */}
      <Modal
        id="createUserModal"
        title="Create User"
        footer={
          <>
            <BtnSecondary id="createUserModalClose" data-bs-dismiss="modal">
              Cancel
            </BtnSecondary>
            <BtnPrimary type="submit" form="createUserForm">
              <i className="fas fa-user-plus"></i> Create User
            </BtnPrimary>
          </>
        }
      >
        <form id="createUserForm" onSubmit={handleCreateUser}>
          <FormField label="Full Name">
            <input
              type="text"
              className="form-control"
              name="name"
              value={userForm.name}
              onChange={handleUserChange}
              placeholder="e.g. Juan Dela Cruz"
              required
            />
          </FormField>
          <FormField label="Email">
            <input
              type="email"
              className="form-control"
              name="email"
              value={userForm.email}
              onChange={handleUserChange}
              placeholder="name@company.com"
              required
            />
          </FormField>
          <div className="row g-3">
            <div className="col-6">
              <FormField label="Role">
                <select
                  className="form-select"
                  name="role"
                  value={userForm.role}
                  onChange={handleUserChange}
                >
                  {roleList.map((r) => (
                    <option key={r.id} value={r.name}>
                      {r.name}
                    </option>
                  ))}
                </select>
              </FormField>
            </div>
            <div className="col-6">
              <FormField label="Status">
                <select
                  className="form-select"
                  name="status"
                  value={userForm.status}
                  onChange={handleUserChange}
                >
                  <option>Active</option>
                  <option>On Leave</option>
                  <option>Inactive</option>
                </select>
              </FormField>
            </div>
          </div>
        </form>
      </Modal>

      {/* ========================================================== */}
      {/* MODAL: CREATE ROLE                                         */}
      {/* ========================================================== */}
      <Modal
        id="createRoleModal"
        title="Create Role"
        footer={
          <>
            <BtnSecondary id="createRoleModalClose" data-bs-dismiss="modal">
              Cancel
            </BtnSecondary>
            <BtnPrimary type="submit" form="createRoleForm">
              <i className="fas fa-plus"></i> Create Role
            </BtnPrimary>
          </>
        }
      >
        <form id="createRoleForm" onSubmit={handleCreateRole}>
          <FormField label="Role Name">
            <input
              type="text"
              className="form-control"
              name="name"
              value={roleForm.name}
              onChange={handleRoleChange}
              placeholder="e.g. HR Manager"
              required
            />
          </FormField>
          <FormField label="Description">
            <textarea
              className="form-control"
              name="description"
              rows={2}
              value={roleForm.description}
              onChange={handleRoleChange}
              placeholder="What can this role do?"
            />
          </FormField>
          <FormField label="Module Access">
            <div className="row">
              {MODULES.map((mod) => (
                <div className="col-6 form-check" key={mod}>
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id={`role-mod-${mod}`}
                    checked={roleForm.permissions.includes(mod)}
                    onChange={() => togglePermission(mod)}
                  />
                  <label
                    className="form-check-label small"
                    htmlFor={`role-mod-${mod}`}
                  >
                    {mod}
                  </label>
                </div>
              ))}
            </div>
          </FormField>
        </form>
      </Modal>
    </>
  );
}
