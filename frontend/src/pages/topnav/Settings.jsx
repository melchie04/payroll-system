// Settings page: company profile, system users and roles.

import { useEffect, useRef, useState } from "react";
import { Modal as BsModal } from "bootstrap";
import {
  PageHeader,
  DataCard,
  Table,
  Tr,
  Td,
  Badge,
  BtnPrimary,
  BtnSecondary,
  BtnDanger,
  IconBtn,
  ActionsMenu,
  Modal,
  FormField,
  RequirementRow,
  SectionHeading,
} from "../../components/ui/index.jsx";
import { systemUsers, roles as initialRoles } from "../../assets/data/index.js";

// Holds the company, users and roles tabs and the state they share.
export default function Settings() {
  const [users, setUsers] = useState(systemUsers);
  const [roleList, setRoleList] = useState(initialRoles);
  const [generalSaved, setGeneralSaved] = useState(false);

  useEffect(() => {
    if (!generalSaved) return;
    const timer = setTimeout(() => setGeneralSaved(false), 4000);
    return () => clearTimeout(timer);
  }, [generalSaved]);

  // Saves the company profile and shows the confirmation.
  function handleSaveGeneral(e) {
    e.preventDefault();
    setGeneralSaved(true);
  }

  return (
    <>
      <section>
        <div className="mt-4">
          <PageHeader title="Settings" description="Manage your company profile, users, and roles." />
        </div>
      </section>

      <hr className="my-3 opacity-25" />

      <GeneralTab generalSaved={generalSaved} onSave={handleSaveGeneral} />

      <UsersTab users={users} setUsers={setUsers} roleList={roleList} />

      <RolesTab roleList={roleList} setRoleList={setRoleList} />
    </>
  );
}

// The company profile form.
function GeneralTab({ generalSaved, onSave }) {
  return (
    <>
      {generalSaved && (
        <section>
          <div className="alert alert-success py-2 small d-flex align-items-center gap-2 mb-3">
            <i className="fas fa-circle-check"></i>
            Changes saved successfully.
          </div>
        </section>
      )}

      <section className="mb-3">
        <DataCard title="Company Profile">
          <form className="card-body" onSubmit={onSave}>
            <div className="mb-4">
              <SectionHeading>Company</SectionHeading>
              <div className="row g-3">
                <div className="col-12 col-md-6">
                  <FormField label="Company Name">
                    <input type="text" className="form-control" defaultValue="Payroll System Inc." />
                  </FormField>
                </div>
                <div className="col-12 col-md-6">
                  <FormField label="Support Email">
                    <input type="email" className="form-control" defaultValue="support@payrollsys.com" />
                  </FormField>
                  <div className="text-muted" style={{ fontSize: "var(--app-fs-1)" }}>
                    Shown to employees on payslips and system emails.
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-4">
              <SectionHeading>Payroll Defaults</SectionHeading>
              <div className="row g-3">
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
                  <div className="text-muted" style={{ fontSize: "var(--app-fs-1)" }}>
                    Applied to new payroll runs. Existing runs keep their schedule.
                  </div>
                </div>
              </div>
            </div>

            <BtnPrimary type="submit">
              <i className="fas fa-floppy-disk"></i> Save Changes
            </BtnPrimary>
          </form>
        </DataCard>
      </section>
    </>
  );
}

const emptyResetForm = { password: "", confirmPassword: "" };

// The system users list and the dialogs that act on it.
function UsersTab({ users, setUsers, roleList }) {
  const [userForm, setUserForm] = useState({
    name: "",
    email: "",
    role: roleList[0]?.name || "",
    status: "Active",
  });

  const [editTarget, setEditTarget] = useState(null);
  const [editForm, setEditForm] = useState(null);
  const editModalInstance = useRef(null);

  const [deleteUserTarget, setDeleteUserTarget] = useState(null);

  const [resetTarget, setResetTarget] = useState(null);
  const [resetForm, setResetForm] = useState(emptyResetForm);
  const [resetTouched, setResetTouched] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const resetModalInstance = useRef(null);

  const resetHasLength = resetForm.password.length >= 8;
  const resetHasCase = /[a-z]/.test(resetForm.password) && /[A-Z]/.test(resetForm.password);
  const resetHasNumber = /[0-9]/.test(resetForm.password);
  const resetHasSpecial = /[^A-Za-z0-9]/.test(resetForm.password);
  const resetMatches = resetForm.password.length > 0 && resetForm.password === resetForm.confirmPassword;
  const resetCanSubmit = resetHasLength && resetHasCase && resetHasNumber && resetHasSpecial && resetMatches;

  useEffect(() => {
    editModalInstance.current = new BsModal(document.getElementById("editUserModal"));
    resetModalInstance.current = new BsModal(document.getElementById("resetPasswordModal"));

    return () => {
      editModalInstance.current?.dispose();
      resetModalInstance.current?.dispose();
    };
  }, []);

  // Keeps the new-user form in step with what is typed.
  function handleUserChange(e) {
    setUserForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  // Adds the user once every field passes.
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

  // Removes a user once the dialog is confirmed.
  function confirmDeleteUser() {
    if (deleteUserTarget) {
      setUsers((prev) => prev.filter((u) => u.id !== deleteUserTarget.id));
      setDeleteUserTarget(null);
    }
    document.getElementById("deleteUserModalClose")?.click();
  }

  // Loads one user into the edit dialog.
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

  // Keeps the edit form in step with what is typed.
  function handleEditChange(e) {
    setEditForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  // Saves the edited user.
  function handleEditUser(e) {
    e.preventDefault();
    setUsers((prev) => prev.map((u) => (u.id === editTarget.id ? { ...u, ...editForm } : u)));
    editModalInstance.current?.hide();
  }

  // Opens the reset dialog for one user.
  function openResetPassword(user) {
    setResetTarget(user);
    setResetForm(emptyResetForm);
    setResetTouched(false);
    setShowResetPassword(false);
    resetModalInstance.current?.show();
  }

  // Keeps the reset form in step with what is typed.
  function handleResetChange(e) {
    setResetForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  // Sets the new password once every rule passes.
  function handleResetPassword(e) {
    e.preventDefault();
    setResetTouched(true);
    if (!resetCanSubmit) return;
    resetModalInstance.current?.hide();
  }

  return (
    <>
      <UsersTable users={users} onEditUser={openEditUser} onResetPassword={openResetPassword} onDeleteUser={setDeleteUserTarget} />

      <CreateUserModal userForm={userForm} roleList={roleList} onChange={handleUserChange} onSubmit={handleCreateUser} />
      <EditUserModal editForm={editForm} roleList={roleList} onChange={handleEditChange} onSubmit={handleEditUser} />
      <DeleteUserModal target={deleteUserTarget} onConfirm={confirmDeleteUser} />
      <ResetPasswordModal
        target={resetTarget}
        form={resetForm}
        showPassword={showResetPassword}
        touched={resetTouched}
        canSubmit={resetCanSubmit}
        hasLength={resetHasLength}
        hasCase={resetHasCase}
        hasNumber={resetHasNumber}
        hasSpecial={resetHasSpecial}
        matches={resetMatches}
        onChange={handleResetChange}
        onToggleShowPassword={() => setShowResetPassword((s) => !s)}
        onSubmit={handleResetPassword}
      />
    </>
  );
}

// The table of users, with a row menu on each.
function UsersTable({ users, onEditUser, onResetPassword, onDeleteUser }) {
  return (
    <section className="mb-3">
      <DataCard
        title="System Users"
        action={
          <BtnPrimary data-bs-toggle="modal" data-bs-target="#createUserModal">
            <i className="fas fa-user-plus"></i> Create User
          </BtnPrimary>
        }
      >
        <Table headers={["Name", "Email", "Role", "Status", "Actions"]} itemLabel="users">
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
                      onClick: () => onEditUser(u),
                    },
                    {
                      label: "Reset Password",
                      icon: "fa-key",
                      onClick: () => onResetPassword(u),
                    },
                    { divider: true },
                    {
                      label: "Delete User",
                      icon: "fa-trash",
                      danger: true,
                      modalTarget: "deleteUserModal",
                      onClick: () => onDeleteUser(u),
                    },
                  ]}
                />
              </Td>
            </Tr>
          ))}
        </Table>
      </DataCard>
    </section>
  );
}

// Dialog for adding a user.
function CreateUserModal({ userForm, roleList, onChange, onSubmit }) {
  return (
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
      <p className="text-muted small mb-3">Add a new person to the system and set the access level they sign in with.</p>

      <form id="createUserForm" onSubmit={onSubmit}>
        <FormField label="Full Name">
          <input
            type="text"
            className="form-control"
            name="name"
            value={userForm.name}
            onChange={onChange}
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
            onChange={onChange}
            placeholder="name@company.com"
            required
          />
        </FormField>

        <div className="row g-3">
          <div className="col-12 col-sm-6">
            <FormField label="Role">
              <select className="form-select" name="role" value={userForm.role} onChange={onChange}>
                {roleList.map((r) => (
                  <option key={r.id} value={r.name}>
                    {r.name}
                  </option>
                ))}
              </select>
            </FormField>
          </div>
          <div className="col-12 col-sm-6">
            <FormField label="Status">
              <select className="form-select" name="status" value={userForm.status} onChange={onChange}>
                <option>Active</option>
                <option>On Leave</option>
                <option>Inactive</option>
              </select>
            </FormField>
          </div>
        </div>
      </form>
    </Modal>
  );
}

// Dialog for editing a user.
function EditUserModal({ editForm, roleList, onChange, onSubmit }) {
  return (
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
        <>
          <p className="text-muted small mb-3">Update this user's details and the access level they sign in with.</p>

          <form id="editUserForm" onSubmit={onSubmit}>
            <FormField label="Full Name">
              <input
                type="text"
                className="form-control"
                name="name"
                value={editForm.name}
                onChange={onChange}
                placeholder="e.g. Juan Dela Cruz"
                required
              />
            </FormField>

            <FormField label="Email">
              <input
                type="email"
                className="form-control"
                name="email"
                value={editForm.email}
                onChange={onChange}
                placeholder="name@company.com"
                required
              />
            </FormField>

            <div className="row g-3">
              <div className="col-12 col-sm-6">
                <FormField label="Role">
                  <select className="form-select" name="role" value={editForm.role} onChange={onChange}>
                    {roleList.map((r) => (
                      <option key={r.id} value={r.name}>
                        {r.name}
                      </option>
                    ))}
                  </select>
                </FormField>
              </div>
              <div className="col-12 col-sm-6">
                <FormField label="Status">
                  <select className="form-select" name="status" value={editForm.status} onChange={onChange}>
                    <option>Active</option>
                    <option>On Leave</option>
                    <option>Inactive</option>
                  </select>
                </FormField>
              </div>
            </div>
          </form>
        </>
      )}
    </Modal>
  );
}

// Dialog confirming a user's removal.
function DeleteUserModal({ target, onConfirm }) {
  return (
    <Modal
      id="deleteUserModal"
      title="Delete User"
      footer={
        <>
          <BtnSecondary id="deleteUserModalClose" data-bs-dismiss="modal">
            Cancel
          </BtnSecondary>
          <BtnDanger onClick={onConfirm}>
            <i className="fas fa-trash"></i> Delete User
          </BtnDanger>
        </>
      }
    >
      <div className="d-flex align-items-start gap-3">
        <div
          className="d-flex align-items-center justify-content-center flex-shrink-0 rounded-3 bg-danger bg-opacity-10 text-danger"
          style={{ width: "var(--app-icon-md)", height: "var(--app-icon-md)", fontSize: "var(--app-fs-3)" }}
        >
          <i className="fas fa-triangle-exclamation"></i>
        </div>
        <div style={{ minWidth: 0 }}>
          <p className="mb-1" style={{ overflowWrap: "anywhere" }}>
            Delete <strong>{target?.name}</strong>?
          </p>
          <p className="text-muted small mb-0">They will immediately lose access to the system. This action cannot be undone.</p>
        </div>
      </div>
    </Modal>
  );
}

// Dialog for setting a user's password.
function ResetPasswordModal({
  target,
  form,
  showPassword,
  touched,
  canSubmit,
  hasLength,
  hasCase,
  hasNumber,
  hasSpecial,
  matches,
  onChange,
  onToggleShowPassword,
  onSubmit,
}) {
  return (
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
        Set a new password for <strong>{target?.name}</strong>. They will be asked to sign in again with this password.
      </p>

      <form id="resetPasswordForm" onSubmit={onSubmit}>
        <FormField label="New Password">
          <div className="input-group">
            <input
              type={showPassword ? "text" : "password"}
              className="form-control"
              name="password"
              value={form.password}
              onChange={onChange}
              placeholder="Enter new password"
              required
            />
            <button type="button" className="btn btn-outline-secondary" onClick={onToggleShowPassword}>
              <i className={`fas ${showPassword ? "fa-eye-slash" : "fa-eye"}`}></i>
            </button>
          </div>
        </FormField>

        <FormField label="Confirm Password">
          <input
            type={showPassword ? "text" : "password"}
            className="form-control"
            name="confirmPassword"
            value={form.confirmPassword}
            onChange={onChange}
            placeholder="Re-enter new password"
            required
          />
        </FormField>

        <div className="bg-light rounded-3 px-3 py-3 mb-3">
          <div className="app-label mb-2">Password Requirements</div>
          <div className="row row-cols-1 g-2">
            <div className="col">
              <RequirementRow met={hasLength} label="At least 8 characters" />
            </div>
            <div className="col">
              <RequirementRow met={hasCase} label="Contains uppercase and lowercase letters" />
            </div>
            <div className="col">
              <RequirementRow met={hasNumber} label="Contains a number" />
            </div>
            <div className="col">
              <RequirementRow met={hasSpecial} label="Contains a special character" />
            </div>
            <div className="col">
              <RequirementRow met={matches} label="Passwords match" />
            </div>
          </div>
        </div>

        {touched && !canSubmit && (
          <div className="alert alert-danger py-2 small d-flex align-items-start gap-2 mb-0">
            <i className="fas fa-circle-exclamation mt-1"></i>
            Please meet all the requirements above before continuing.
          </div>
        )}
      </form>
    </Modal>
  );
}

const modules = ["Dashboard", "Payroll", "Billing", "Timesheet", "Employees", "Clients", "Settings"];

// The roles list and the dialogs that act on it.
function RolesTab({ roleList, setRoleList }) {
  const [roleForm, setRoleForm] = useState({
    name: "",
    description: "",
    permissions: [],
  });
  const [roleNameError, setRoleNameError] = useState("");

  const [editRoleTarget, setEditRoleTarget] = useState(null);
  const [editRoleForm, setEditRoleForm] = useState(null);
  const [editRoleNameError, setEditRoleNameError] = useState("");
  const editRoleModalInstance = useRef(null);

  const [deleteRoleTarget, setDeleteRoleTarget] = useState(null);

  useEffect(() => {
    editRoleModalInstance.current = new BsModal(document.getElementById("editRoleModal"));

    return () => {
      editRoleModalInstance.current?.dispose();
    };
  }, []);

  // Keeps the new-role form in step with what is typed.
  function handleRoleChange(e) {
    setRoleForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    if (e.target.name === "name") setRoleNameError("");
  }

  // Adds or removes one permission on the role being created.
  function togglePermission(mod) {
    setRoleForm((f) => ({
      ...f,
      permissions: f.permissions.includes(mod) ? f.permissions.filter((m) => m !== mod) : [...f.permissions, mod],
    }));
  }

  // Adds the role once it has a name and at least one permission.
  function handleCreateRole(e) {
    e.preventDefault();
    const trimmedName = roleForm.name.trim();
    if (!trimmedName) return;
    const isDuplicate = roleList.some((r) => r.name.trim().toLowerCase() === trimmedName.toLowerCase());
    if (isDuplicate) {
      setRoleNameError("A role with this name already exists.");
      return;
    }
    setRoleList((prev) => [...prev, { id: Date.now(), users: 0, ...roleForm, name: trimmedName }]);
    setRoleForm({ name: "", description: "", permissions: [] });
    setRoleNameError("");
    document.getElementById("createRoleModalClose")?.click();
  }

  // Closes the create dialog and clears what was typed.
  function handleCancelCreateRole() {
    setRoleForm({ name: "", description: "", permissions: [] });
    setRoleNameError("");
  }

  // Removes a role once the dialog is confirmed.
  function confirmDeleteRole() {
    if (deleteRoleTarget) {
      setRoleList((prev) => prev.filter((r) => r.id !== deleteRoleTarget.id));
      setDeleteRoleTarget(null);
    }
    document.getElementById("deleteRoleModalClose")?.click();
  }

  // Loads one role into the edit dialog.
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

  // Keeps the edit form in step with what is typed.
  function handleEditRoleChange(e) {
    setEditRoleForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    if (e.target.name === "name") setEditRoleNameError("");
  }

  // Adds or removes one permission on the role being edited.
  function toggleEditRolePermission(mod) {
    setEditRoleForm((f) => ({
      ...f,
      permissions: f.permissions.includes(mod) ? f.permissions.filter((m) => m !== mod) : [...f.permissions, mod],
    }));
  }

  // Saves the edited role.
  function handleEditRoleSubmit(e) {
    e.preventDefault();
    const trimmedName = editRoleForm.name.trim();
    if (!trimmedName) return;
    const isDuplicate = roleList.some((r) => r.id !== editRoleTarget.id && r.name.trim().toLowerCase() === trimmedName.toLowerCase());
    if (isDuplicate) {
      setEditRoleNameError("A role with this name already exists.");
      return;
    }
    setRoleList((prev) => prev.map((r) => (r.id === editRoleTarget.id ? { ...r, ...editRoleForm, name: trimmedName } : r)));
    editRoleModalInstance.current?.hide();
  }

  return (
    <>
      <RolesList roleList={roleList} onEditRole={openEditRole} onDeleteRole={setDeleteRoleTarget} />

      <CreateRoleModal
        modules={modules}
        roleForm={roleForm}
        nameError={roleNameError}
        onChange={handleRoleChange}
        onTogglePermission={togglePermission}
        onSubmit={handleCreateRole}
        onCancel={handleCancelCreateRole}
      />
      <EditRoleModal
        modules={modules}
        editRoleForm={editRoleForm}
        nameError={editRoleNameError}
        onChange={handleEditRoleChange}
        onTogglePermission={toggleEditRolePermission}
        onSubmit={handleEditRoleSubmit}
      />
      <DeleteRoleModal target={deleteRoleTarget} onConfirm={confirmDeleteRole} />
    </>
  );
}

// The list of roles, each with its permission count and row menu.
function RolesList({ roleList, onEditRole, onDeleteRole }) {
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
          {roleList.length === 0 && <div className="col-12 text-center text-muted py-5 small">No roles created yet.</div>}
          {roleList.map((r) => (
            <div className="col-12 col-md-6" key={r.id}>
              <div className="border rounded-3 h-100 d-flex flex-column">
                <div className="d-flex align-items-center gap-3 p-3">
                  <div
                    className="d-flex align-items-center justify-content-center flex-shrink-0 border rounded-3 bg-light text-secondary"
                    style={{ width: "var(--app-icon-md)", height: "var(--app-icon-md)", fontSize: "var(--app-fs-3)" }}
                  >
                    <i className="fas fa-shield-halved"></i>
                  </div>

                  <div className="flex-grow-1" style={{ minWidth: 0 }}>
                    <div className="fw-semibold" style={{ overflowWrap: "anywhere" }}>
                      {r.name}
                    </div>
                    <div className="text-muted" style={{ fontSize: "var(--app-fs-2)" }}>
                      {r.users} user{r.users === 1 ? "" : "s"}
                    </div>
                  </div>

                  <div className="d-flex gap-1 flex-shrink-0">
                    <IconBtn title="Edit role" onClick={() => onEditRole(r)}>
                      <i className="fas fa-pen text-muted opacity-75"></i>
                    </IconBtn>
                    <IconBtn title="Delete role" data-bs-toggle="modal" data-bs-target="#deleteRoleModal" onClick={() => onDeleteRole(r)}>
                      <i className="fas fa-trash text-danger opacity-75"></i>
                    </IconBtn>
                  </div>
                </div>

                <p className="text-muted small px-3 mb-3">{r.description}</p>

                <div className="mt-auto border-top px-3 py-3">
                  <div className="app-label mb-2">Permissions</div>
                  <div className="d-flex flex-wrap gap-1">
                    {r.permissions.length === 0 && <span className="text-muted small">No modules assigned.</span>}
                    {r.permissions.map((p) => (
                      <span key={p} className="app-chip badge rounded-pill py-1">
                        {p}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </DataCard>
    </section>
  );
}

// Dialog for adding a role.
function CreateRoleModal({ modules, roleForm, nameError, onChange, onTogglePermission, onSubmit, onCancel }) {
  return (
    <Modal
      id="createRoleModal"
      title="Create Role"
      footer={
        <>
          <BtnSecondary id="createRoleModalClose" data-bs-dismiss="modal" onClick={onCancel}>
            Cancel
          </BtnSecondary>
          <BtnPrimary type="submit" form="createRoleForm">
            <i className="fas fa-plus"></i> Create Role
          </BtnPrimary>
        </>
      }
    >
      <p className="text-muted small mb-3">Define a role and choose which modules the people assigned to it can open.</p>

      <form id="createRoleForm" onSubmit={onSubmit}>
        <FormField label="Role Name">
          <input
            type="text"
            className={`form-control ${nameError ? "is-invalid" : ""}`}
            name="name"
            value={roleForm.name}
            onChange={onChange}
            placeholder="e.g. HR Manager"
            required
          />
          {nameError && <div className="invalid-feedback d-block">{nameError}</div>}
        </FormField>

        <FormField label="Description">
          <textarea
            className="form-control"
            name="description"
            rows={2}
            value={roleForm.description}
            onChange={onChange}
            placeholder="What can this role do?"
          />
        </FormField>

        <FormField label="Module Access">
          <div className="bg-light rounded-3 px-3 py-3">
            <div className="row row-cols-1 row-cols-sm-2 g-2">
              {modules.map((mod) => (
                <div className="col" key={mod}>
                  <div className="form-check mb-0">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id={`role-mod-${mod}`}
                      checked={roleForm.permissions.includes(mod)}
                      onChange={() => onTogglePermission(mod)}
                    />
                    <label className="form-check-label small" htmlFor={`role-mod-${mod}`}>
                      {mod}
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="text-muted mt-2" style={{ fontSize: "var(--app-fs-1)" }}>
            {roleForm.permissions.length} of {modules.length} modules selected.
          </div>
        </FormField>
      </form>
    </Modal>
  );
}

// Dialog for editing a role.
function EditRoleModal({ modules, editRoleForm, nameError, onChange, onTogglePermission, onSubmit }) {
  return (
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
        <>
          <p className="text-muted small mb-3">Update this role's details and the modules the people assigned to it can open.</p>

          <form id="editRoleForm" onSubmit={onSubmit}>
            <FormField label="Role Name">
              <input
                type="text"
                className={`form-control ${nameError ? "is-invalid" : ""}`}
                name="name"
                value={editRoleForm.name}
                onChange={onChange}
                placeholder="e.g. HR Manager"
                required
              />
              {nameError && <div className="invalid-feedback d-block">{nameError}</div>}
            </FormField>

            <FormField label="Description">
              <textarea
                className="form-control"
                name="description"
                rows={2}
                value={editRoleForm.description}
                onChange={onChange}
                placeholder="What can this role do?"
              />
            </FormField>

            <FormField label="Module Access">
              <div className="bg-light rounded-3 px-3 py-3">
                <div className="row row-cols-1 row-cols-sm-2 g-2">
                  {modules.map((mod) => (
                    <div className="col" key={mod}>
                      <div className="form-check mb-0">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id={`edit-role-mod-${mod}`}
                          checked={editRoleForm.permissions.includes(mod)}
                          onChange={() => onTogglePermission(mod)}
                        />
                        <label className="form-check-label small" htmlFor={`edit-role-mod-${mod}`}>
                          {mod}
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="text-muted mt-2" style={{ fontSize: "var(--app-fs-1)" }}>
                {editRoleForm.permissions.length} of {modules.length} modules selected.
              </div>
            </FormField>
          </form>
        </>
      )}
    </Modal>
  );
}

// Dialog confirming a role's removal.
function DeleteRoleModal({ target, onConfirm }) {
  return (
    <Modal
      id="deleteRoleModal"
      title="Delete Role"
      footer={
        <>
          <BtnSecondary id="deleteRoleModalClose" data-bs-dismiss="modal">
            Cancel
          </BtnSecondary>
          <BtnDanger onClick={onConfirm}>
            <i className="fas fa-trash"></i> Delete Role
          </BtnDanger>
        </>
      }
    >
      <div className="d-flex align-items-start gap-3">
        <div
          className="d-flex align-items-center justify-content-center flex-shrink-0 rounded-3 bg-danger bg-opacity-10 text-danger"
          style={{ width: "var(--app-icon-md)", height: "var(--app-icon-md)", fontSize: "var(--app-fs-3)" }}
        >
          <i className="fas fa-triangle-exclamation"></i>
        </div>
        <div style={{ minWidth: 0 }}>
          <p className="mb-1" style={{ overflowWrap: "anywhere" }}>
            Delete the <strong>{target?.name}</strong> role?
          </p>
          <p className="text-muted small mb-0">
            {target?.users ? `${target.users} user${target.users === 1 ? "" : "s"} assigned to it will need a new role. ` : ""}
            This action cannot be undone.
          </p>
        </div>
      </div>
    </Modal>
  );
}
