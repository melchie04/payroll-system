import { useEffect, useRef, useState } from "react";
import { Modal as BsModal } from "bootstrap";
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
import { systemUsers, roles as initialRoles } from "../assets/data/index.js";

const MODULES = [
  "Dashboard",
  "Payroll",
  "Billing",
  "Timesheet",
  "Employees",
  "Clients",
  "Settings",
];

const emptyResetForm = { password: "", confirmPassword: "" };

function RequirementRow({ met, label }) {
  return (
    <div className="d-flex align-items-center gap-2 mb-1">
      <i
        className={`fas ${met ? "fa-circle-check text-success" : "fa-circle text-muted"}`}
        style={{ fontSize: "0.7rem", opacity: met ? 1 : 0.4 }}
      ></i>
      <span
        className={met ? "text-dark" : "text-muted"}
        style={{ fontSize: "0.8rem" }}
      >
        {label}
      </span>
    </div>
  );
}

export default function Settings() {
  const [tab, setTab] = useState("users");
  const [users, setUsers] = useState(systemUsers);
  const [roleList, setRoleList] = useState(initialRoles);

  // General tab — save confirmation banner
  const [generalSaved, setGeneralSaved] = useState(false);

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
  const [roleNameError, setRoleNameError] = useState("");

  const [editTarget, setEditTarget] = useState(null);
  const [editForm, setEditForm] = useState(null);
  const editModalInstance = useRef(null);

  const [editRoleTarget, setEditRoleTarget] = useState(null);
  const [editRoleForm, setEditRoleForm] = useState(null);
  const [editRoleNameError, setEditRoleNameError] = useState("");
  const editRoleModalInstance = useRef(null);

  // Delete confirmation targets — Users tab and Roles tab
  const [deleteUserTarget, setDeleteUserTarget] = useState(null);
  const [deleteRoleTarget, setDeleteRoleTarget] = useState(null);

  const [resetTarget, setResetTarget] = useState(null);
  const [resetForm, setResetForm] = useState(emptyResetForm);
  const [resetTouched, setResetTouched] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const resetModalInstance = useRef(null);

  const resetHasLength = resetForm.password.length >= 8;
  const resetHasCase =
    /[a-z]/.test(resetForm.password) && /[A-Z]/.test(resetForm.password);
  const resetHasNumber = /[0-9]/.test(resetForm.password);
  const resetHasSpecial = /[^A-Za-z0-9]/.test(resetForm.password);
  const resetMatches =
    resetForm.password.length > 0 &&
    resetForm.password === resetForm.confirmPassword;
  const resetCanSubmit =
    resetHasLength &&
    resetHasCase &&
    resetHasNumber &&
    resetHasSpecial &&
    resetMatches;

  const [selfForm, setSelfForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [selfTouched, setSelfTouched] = useState(false);
  const [selfSuccess, setSelfSuccess] = useState(false);
  const [showSelfPassword, setShowSelfPassword] = useState(false);

  const selfHasLength = selfForm.newPassword.length >= 8;
  const selfHasCase =
    /[a-z]/.test(selfForm.newPassword) && /[A-Z]/.test(selfForm.newPassword);
  const selfHasNumber = /[0-9]/.test(selfForm.newPassword);
  const selfHasSpecial = /[^A-Za-z0-9]/.test(selfForm.newPassword);
  const selfMatches =
    selfForm.newPassword.length > 0 &&
    selfForm.newPassword === selfForm.confirmPassword;
  const selfCanSubmit =
    selfForm.currentPassword.length > 0 &&
    selfHasLength &&
    selfHasCase &&
    selfHasNumber &&
    selfHasSpecial &&
    selfMatches;

  useEffect(() => {
    editModalInstance.current = new BsModal(
      document.getElementById("editUserModal"),
    );
    editRoleModalInstance.current = new BsModal(
      document.getElementById("editRoleModal"),
    );
    resetModalInstance.current = new BsModal(
      document.getElementById("resetPasswordModal"),
    );
  }, []);

  // Save notifications auto-dismiss after a few seconds...
  useEffect(() => {
    if (!generalSaved) return;
    const timer = setTimeout(() => setGeneralSaved(false), 4000);
    return () => clearTimeout(timer);
  }, [generalSaved]);

  useEffect(() => {
    if (!selfSuccess) return;
    const timer = setTimeout(() => setSelfSuccess(false), 4000);
    return () => clearTimeout(timer);
  }, [selfSuccess]);

  // ...or immediately once the user switches to a different tab, so they
  // don't reappear stale if the user comes back within the 4s window.
  function switchTab(nextTab) {
    setGeneralSaved(false);
    setSelfSuccess(false);
    setTab(nextTab);
  }

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
    if (e.target.name === "name") setRoleNameError("");
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
    const trimmedName = roleForm.name.trim();
    if (!trimmedName) return;
    const isDuplicate = roleList.some(
      (r) => r.name.trim().toLowerCase() === trimmedName.toLowerCase(),
    );
    if (isDuplicate) {
      setRoleNameError("A role with this name already exists.");
      return;
    }
    setRoleList((prev) => [
      ...prev,
      { id: Date.now(), users: 0, ...roleForm, name: trimmedName },
    ]);
    setRoleForm({ name: "", description: "", permissions: [] });
    setRoleNameError("");
    document.getElementById("createRoleModalClose")?.click();
  }

  function deleteUser(id) {
    setUsers((prev) => prev.filter((u) => u.id !== id));
  }

  function deleteRole(id) {
    setRoleList((prev) => prev.filter((r) => r.id !== id));
  }

  function confirmDeleteUser() {
    if (deleteUserTarget) {
      deleteUser(deleteUserTarget.id);
      setDeleteUserTarget(null);
    }
    document.getElementById("deleteUserModalClose")?.click();
  }

  function confirmDeleteRole() {
    if (deleteRoleTarget) {
      deleteRole(deleteRoleTarget.id);
      setDeleteRoleTarget(null);
    }
    document.getElementById("deleteRoleModalClose")?.click();
  }

  function openEditUser(user) {
    setEditTarget(user);
    setEditForm({
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
    });
    editModalInstance.current?.show();
  }

  function handleEditChange(e) {
    setEditForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  function handleEditUser(e) {
    e.preventDefault();
    setUsers((prev) =>
      prev.map((u) => (u.id === editTarget.id ? { ...u, ...editForm } : u)),
    );
    editModalInstance.current?.hide();
  }

  // --- Edit Role ---------------------------------------------------------
  function openEditRole(role) {
    setEditRoleTarget(role);
    setEditRoleForm({
      name: role.name,
      description: role.description,
      permissions: [...role.permissions],
    });
    setEditRoleNameError("");
    editRoleModalInstance.current?.show();
  }

  function handleEditRoleChange(e) {
    setEditRoleForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    if (e.target.name === "name") setEditRoleNameError("");
  }

  function toggleEditRolePermission(mod) {
    setEditRoleForm((f) => ({
      ...f,
      permissions: f.permissions.includes(mod)
        ? f.permissions.filter((m) => m !== mod)
        : [...f.permissions, mod],
    }));
  }

  function handleEditRoleSubmit(e) {
    e.preventDefault();
    const trimmedName = editRoleForm.name.trim();
    if (!trimmedName) return;
    const isDuplicate = roleList.some(
      (r) =>
        r.id !== editRoleTarget.id &&
        r.name.trim().toLowerCase() === trimmedName.toLowerCase(),
    );
    if (isDuplicate) {
      setEditRoleNameError("A role with this name already exists.");
      return;
    }
    setRoleList((prev) =>
      prev.map((r) =>
        r.id === editRoleTarget.id
          ? { ...r, ...editRoleForm, name: trimmedName }
          : r,
      ),
    );
    editRoleModalInstance.current?.hide();
  }

  function openResetPassword(user) {
    setResetTarget(user);
    setResetForm(emptyResetForm);
    setResetTouched(false);
    setShowResetPassword(false);
    resetModalInstance.current?.show();
  }

  function handleResetChange(e) {
    setResetForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  function handleResetPassword(e) {
    e.preventDefault();
    setResetTouched(true);
    if (!resetCanSubmit) return;
    resetModalInstance.current?.hide();
  }

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
            { key: "password", label: "Change Password", icon: "fa-key" },
          ].map((t) => (
            <li className="nav-item" key={t.key}>
              <button
                type="button"
                className={`nav-link ${tab === t.key ? "active fw-semibold" : "text-muted"}`}
                onClick={() => switchTab(t.key)}
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
            <form
              className="card-body row g-3"
              onSubmit={(e) => {
                e.preventDefault();
                setGeneralSaved(true);
              }}
            >
              {generalSaved && (
                <div className="col-12">
                  <div className="alert alert-success py-2 small d-flex align-items-center gap-2 mb-0">
                    <i className="fas fa-circle-check"></i>
                    Changes saved successfully.
                  </div>
                </div>
              )}
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
                        {
                          label: "Edit User",
                          icon: "fa-pen",
                          onClick: () => openEditUser(u),
                        },
                        {
                          label: "Reset Password",
                          icon: "fa-key",
                          onClick: () => openResetPassword(u),
                        },
                        { divider: true },
                        {
                          label: "Delete User",
                          icon: "fa-trash",
                          danger: true,
                          modalTarget: "deleteUserModal",
                          onClick: () => setDeleteUserTarget(u),
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
                      <div className="d-flex gap-1">
                        <IconBtn
                          title="Edit role"
                          onClick={() => openEditRole(r)}
                        >
                          <i className="fas fa-pen text-muted opacity-75"></i>
                        </IconBtn>
                        <IconBtn
                          title="Delete role"
                          data-bs-toggle="modal"
                          data-bs-target="#deleteRoleModal"
                          onClick={() => setDeleteRoleTarget(r)}
                        >
                          <i className="fas fa-trash text-danger opacity-75"></i>
                        </IconBtn>
                      </div>
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
      {/* DIVISION 6: CHANGE PASSWORD TAB                            */}
      {/* ========================================================== */}
      {tab === "password" && (
        <section className="mb-3">
          <DataCard title="Change Password">
            <form
              id="selfChangePasswordForm"
              className="card-body row g-1"
              onSubmit={handleSelfSubmit}
            >
              {selfSuccess && (
                <div className="col-12 mb-3">
                  <div className="alert alert-success py-2 small d-flex align-items-center gap-2 mb-0">
                    <i className="fas fa-circle-check"></i>
                    Your password has been updated.
                  </div>
                </div>
              )}

              <div className="col-12 col-lg-6">
                <FormField label="Current Password">
                  <div className="input-group">
                    <input
                      type={showSelfPassword ? "text" : "password"}
                      className="form-control"
                      name="currentPassword"
                      value={selfForm.currentPassword}
                      onChange={handleSelfChange}
                      placeholder="Enter your current password"
                      required
                    />
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={() => setShowSelfPassword((s) => !s)}
                    >
                      <i
                        className={`fas ${showSelfPassword ? "fa-eye-slash" : "fa-eye"}`}
                      ></i>
                    </button>
                  </div>
                </FormField>
              </div>

              <div className="d-none d-lg-block col-lg-6"></div>

              <div className="col-12 col-md-6">
                <FormField label="New Password">
                  <input
                    type={showSelfPassword ? "text" : "password"}
                    className="form-control"
                    name="newPassword"
                    value={selfForm.newPassword}
                    onChange={handleSelfChange}
                    placeholder="Enter new password"
                    required
                  />
                </FormField>
              </div>

              <div className="col-12 col-md-6">
                <FormField label="Confirm New Password">
                  <input
                    type={showSelfPassword ? "text" : "password"}
                    className="form-control"
                    name="confirmPassword"
                    value={selfForm.confirmPassword}
                    onChange={handleSelfChange}
                    placeholder="Re-enter new password"
                    required
                  />
                </FormField>
              </div>

              <div className="col-12 mb-3">
                <div className="bg-light rounded-3 px-3 py-2 row row-cols-1 row-cols-md-2 g-1">
                  <div className="col">
                    <RequirementRow
                      met={selfHasLength}
                      label="At least 8 characters"
                    />
                  </div>
                  <div className="col">
                    <RequirementRow
                      met={selfHasCase}
                      label="Contains uppercase and lowercase letters"
                    />
                  </div>
                  <div className="col">
                    <RequirementRow
                      met={selfHasNumber}
                      label="Contains a number"
                    />
                  </div>
                  <div className="col">
                    <RequirementRow
                      met={selfHasSpecial}
                      label="Contains a special character"
                    />
                  </div>
                  <div className="col">
                    <RequirementRow met={selfMatches} label="Passwords match" />
                  </div>
                </div>
              </div>

              {selfTouched && !selfCanSubmit && (
                <div className="col-12">
                  <div className="text-danger small mb-0">
                    Please enter your current password and meet all the
                    requirements above before continuing.
                  </div>
                </div>
              )}

              <div className="col-12">
                <BtnPrimary type="submit">
                  <i className="fas fa-key"></i> Update Password
                </BtnPrimary>
              </div>
            </form>
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
      {/* MODAL: CONFIRM DELETE USER                                 */}
      {/* ========================================================== */}
      <Modal
        id="deleteUserModal"
        title="Delete User"
        footer={
          <>
            <BtnSecondary id="deleteUserModalClose" data-bs-dismiss="modal">
              Cancel
            </BtnSecondary>
            <button
              type="button"
              className="btn btn-danger btn-sm"
              onClick={confirmDeleteUser}
            >
              <i className="fas fa-trash"></i> Delete
            </button>
          </>
        }
      >
        <p className="mb-0">
          Are you sure you want to delete{" "}
          <strong>{deleteUserTarget?.name}</strong>? This action cannot be
          undone.
        </p>
      </Modal>

      {/* ========================================================== */}
      {/* MODAL: EDIT USER                                           */}
      {/* ========================================================== */}
      <Modal
        id="editUserModal"
        title="Edit User"
        footer={
          <>
            <BtnSecondary data-bs-dismiss="modal">Cancel</BtnSecondary>
            <BtnPrimary type="submit" form="editUserForm">
              <i className="fas fa-floppy-disk"></i> Save Changes
            </BtnPrimary>
          </>
        }
      >
        {editForm && (
          <form id="editUserForm" onSubmit={handleEditUser}>
            <FormField label="Full Name">
              <input
                type="text"
                className="form-control"
                name="name"
                value={editForm.name}
                onChange={handleEditChange}
                required
              />
            </FormField>
            <FormField label="Email">
              <input
                type="email"
                className="form-control"
                name="email"
                value={editForm.email}
                onChange={handleEditChange}
                required
              />
            </FormField>
            <div className="row g-3">
              <div className="col-6">
                <FormField label="Role">
                  <select
                    className="form-select"
                    name="role"
                    value={editForm.role}
                    onChange={handleEditChange}
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
                    value={editForm.status}
                    onChange={handleEditChange}
                  >
                    <option>Active</option>
                    <option>On Leave</option>
                    <option>Inactive</option>
                  </select>
                </FormField>
              </div>
            </div>
          </form>
        )}
      </Modal>

      {/* ========================================================== */}
      {/* MODAL: RESET PASSWORD                                      */}
      {/* ========================================================== */}
      <Modal
        id="resetPasswordModal"
        title="Reset Password"
        footer={
          <>
            <BtnSecondary data-bs-dismiss="modal">Cancel</BtnSecondary>
            <BtnPrimary type="submit" form="resetPasswordForm">
              <i className="fas fa-key"></i> Reset Password
            </BtnPrimary>
          </>
        }
      >
        <p className="text-muted small mb-3">
          Set a new password for <strong>{resetTarget?.name}</strong>. They will
          be asked to sign in again with this password.
        </p>
        <form id="resetPasswordForm" onSubmit={handleResetPassword}>
          <FormField label="New Password">
            <div className="input-group">
              <input
                type={showResetPassword ? "text" : "password"}
                className="form-control"
                name="password"
                value={resetForm.password}
                onChange={handleResetChange}
                placeholder="Enter new password"
                required
              />
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => setShowResetPassword((s) => !s)}
              >
                <i
                  className={`fas ${showResetPassword ? "fa-eye-slash" : "fa-eye"}`}
                ></i>
              </button>
            </div>
          </FormField>
          <FormField label="Confirm Password">
            <input
              type={showResetPassword ? "text" : "password"}
              className="form-control"
              name="confirmPassword"
              value={resetForm.confirmPassword}
              onChange={handleResetChange}
              placeholder="Re-enter new password"
              required
            />
          </FormField>
          <div className="bg-light rounded-3 px-3 py-2 mb-2">
            <RequirementRow
              met={resetHasLength}
              label="At least 8 characters"
            />
            <RequirementRow
              met={resetHasCase}
              label="Contains uppercase and lowercase letters"
            />
            <RequirementRow met={resetHasNumber} label="Contains a number" />
            <RequirementRow
              met={resetHasSpecial}
              label="Contains a special character"
            />
            <RequirementRow met={resetMatches} label="Passwords match" />
          </div>
          {resetTouched && !resetCanSubmit && (
            <div className="text-danger small mb-0">
              Please meet all the requirements above before continuing.
            </div>
          )}
        </form>
      </Modal>

      {/* ========================================================== */}
      {/* MODAL: CONFIRM DELETE ROLE                                 */}
      {/* ========================================================== */}
      <Modal
        id="deleteRoleModal"
        title="Delete Role"
        footer={
          <>
            <BtnSecondary id="deleteRoleModalClose" data-bs-dismiss="modal">
              Cancel
            </BtnSecondary>
            <button
              type="button"
              className="btn btn-danger btn-sm"
              onClick={confirmDeleteRole}
            >
              <i className="fas fa-trash"></i> Delete
            </button>
          </>
        }
      >
        <p className="mb-0">
          Are you sure you want to delete the{" "}
          <strong>{deleteRoleTarget?.name}</strong> role? Users assigned to it
          will need to be reassigned a new role.
        </p>
      </Modal>

      {/* ========================================================== */}
      {/* MODAL: EDIT ROLE                                           */}
      {/* ========================================================== */}
      <Modal
        id="editRoleModal"
        title="Edit Role"
        footer={
          <>
            <BtnSecondary data-bs-dismiss="modal">Cancel</BtnSecondary>
            <BtnPrimary type="submit" form="editRoleForm">
              <i className="fas fa-floppy-disk"></i> Save Changes
            </BtnPrimary>
          </>
        }
      >
        {editRoleForm && (
          <form id="editRoleForm" onSubmit={handleEditRoleSubmit}>
            <FormField label="Role Name">
              <input
                type="text"
                className={`form-control ${editRoleNameError ? "is-invalid" : ""}`}
                name="name"
                value={editRoleForm.name}
                onChange={handleEditRoleChange}
                required
              />
              {editRoleNameError && (
                <div className="invalid-feedback d-block">
                  {editRoleNameError}
                </div>
              )}
            </FormField>
            <FormField label="Description">
              <textarea
                className="form-control"
                name="description"
                rows={2}
                value={editRoleForm.description}
                onChange={handleEditRoleChange}
              />
            </FormField>
            <FormField label="Module Access">
              <div className="row">
                {MODULES.map((mod) => (
                  <div className="col-6 form-check" key={mod}>
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id={`edit-role-mod-${mod}`}
                      checked={editRoleForm.permissions.includes(mod)}
                      onChange={() => toggleEditRolePermission(mod)}
                    />
                    <label
                      className="form-check-label small"
                      htmlFor={`edit-role-mod-${mod}`}
                    >
                      {mod}
                    </label>
                  </div>
                ))}
              </div>
            </FormField>
          </form>
        )}
      </Modal>

      {/* ========================================================== */}
      {/* MODAL: CREATE ROLE                                         */}
      {/* ========================================================== */}
      <Modal
        id="createRoleModal"
        title="Create Role"
        footer={
          <>
            <BtnSecondary
              id="createRoleModalClose"
              data-bs-dismiss="modal"
              onClick={() => {
                setRoleForm({ name: "", description: "", permissions: [] });
                setRoleNameError("");
              }}
            >
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
              className={`form-control ${roleNameError ? "is-invalid" : ""}`}
              name="name"
              value={roleForm.name}
              onChange={handleRoleChange}
              placeholder="e.g. HR Manager"
              required
            />
            {roleNameError && (
              <div className="invalid-feedback d-block">{roleNameError}</div>
            )}
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
