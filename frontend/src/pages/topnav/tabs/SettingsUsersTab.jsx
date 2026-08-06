// The Settings Users tab: the user table and its dialogs.

import { useEffect, useRef, useState } from "react";
import { Modal as BsModal } from "bootstrap";
import { ActionsMenu, AppAlert, Badge, BtnDanger, BtnPrimary, BtnSecondary, DataCard, FormField, Modal, RequirementRow, Table, Td, Tr } from "../../../components/ui/index.jsx";

const emptyResetForm = { password: "", confirmPassword: "" };

// The system users list and the dialogs that act on it.
export default function SettingsUsersTab({ users, setUsers, roleList, notify }) {
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
    notify("success", "User created.");
}

  // Removes a user once the dialog is confirmed.
  function confirmDeleteUser() {
    if (deleteUserTarget) {
      setUsers((prev) => prev.filter((u) => u.id !== deleteUserTarget.id));
      setDeleteUserTarget(null);
    }
    document.getElementById("deleteUserModalClose")?.click();
    notify("success", "User removed.");
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
    notify("success", "User updated.");
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
    notify("success", "Password reset.");
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
              <Td>{u.name}</Td>
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
      <p className="settings-note mb-3">Add a new person to the system and set the access level they sign in with.</p>

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
          <p className="settings-note mb-3">Update this user's details and the access level they sign in with.</p>

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
          <p className="settings-note mb-0">They will immediately lose access to the system. This action cannot be undone.</p>
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
      <p className="settings-note mb-3">
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

        <div className="auth-requirements mb-3">
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
          <AppAlert tone="error" message="Please meet all the requirements above before continuing." />
        )}
      </form>
    </Modal>
  );
}

