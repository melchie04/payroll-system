import { useEffect, useRef, useState } from "react";
import { Modal as BsModal } from "bootstrap";
import { DataCard, Table, Tr, Td, Badge, BtnPrimary, BtnSecondary, BtnDanger, ActionsMenu, Modal, FormField, RequirementRow } from "../ui/index.jsx";

const emptyResetForm = { password: "", confirmPassword: "" };

// UsersTab — system users tab; owns its table and its user modals.
export function UsersTab({ users, setUsers, roleList }) {
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

  function confirmDeleteUser() {
    if (deleteUserTarget) {
      setUsers((prev) => prev.filter((u) => u.id !== deleteUserTarget.id));
      setDeleteUserTarget(null);
    }
    document.getElementById("deleteUserModalClose")?.click();
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
    setUsers((prev) => prev.map((u) => (u.id === editTarget.id ? { ...u, ...editForm } : u)));
    editModalInstance.current?.hide();
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

// UsersTable — the system users table itself.
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

// CreateUserModal — modal form for creating a system user.
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

// EditUserModal — modal form for editing a system user.
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

// DeleteUserModal — confirmation modal for deleting a user.
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
          style={{ width: 40, height: 40, fontSize: 15 }}
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

// ResetPasswordModal — modal for resetting a user's password.
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
          <div className="text-uppercase text-muted fw-semibold mb-2" style={{ fontSize: 11, letterSpacing: 0.5 }}>
            Password Requirements
          </div>
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
