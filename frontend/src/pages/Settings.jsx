import { useEffect, useRef, useState } from "react";
import { Modal as BsModal } from "bootstrap";
import { PageHeader } from "../components/ui/index.jsx";
import { systemUsers, roles as initialRoles } from "../assets/data/index.js";

import { SettingsTabsNav } from "../components/settings/SettingsTabsNav.jsx";
import { GeneralTab } from "../components/settings/GeneralTab.jsx";
import { UsersTab } from "../components/settings/UsersTab.jsx";
import { RolesTab } from "../components/settings/RolesTab.jsx";
import { ChangePasswordTab } from "../components/settings/ChangePasswordTab.jsx";
import { CreateUserModal } from "../components/settings/CreateUserModal.jsx";
import { DeleteUserModal } from "../components/settings/DeleteUserModal.jsx";
import { EditUserModal } from "../components/settings/EditUserModal.jsx";
import { ResetPasswordModal } from "../components/settings/ResetPasswordModal.jsx";
import { DeleteRoleModal } from "../components/settings/DeleteRoleModal.jsx";
import { EditRoleModal } from "../components/settings/EditRoleModal.jsx";
import { CreateRoleModal } from "../components/settings/CreateRoleModal.jsx";

const modules = ["Dashboard", "Payroll", "Billing", "Timesheet", "Employees", "Clients", "Settings"];
const emptyResetForm = { password: "", confirmPassword: "" };

// Settings — wires the General, Users, Roles & Permissions, and Change Password tabs together.
export default function Settings() {
  const [tab, setTab] = useState("users");
  const [users, setUsers] = useState(systemUsers);
  const [roleList, setRoleList] = useState(initialRoles);

  const [generalSaved, setGeneralSaved] = useState(false);

  useEffect(() => {
    if (!generalSaved) return;
    const timer = setTimeout(() => setGeneralSaved(false), 4000);
    return () => clearTimeout(timer);
  }, [generalSaved]);

  function handleSaveGeneral(e) {
    e.preventDefault();
    setGeneralSaved(true);
  }

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

  function deleteUser(id) {
    setUsers((prev) => prev.filter((u) => u.id !== id));
  }

  function confirmDeleteUser() {
    if (deleteUserTarget) {
      deleteUser(deleteUserTarget.id);
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

  function handleRoleChange(e) {
    setRoleForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    if (e.target.name === "name") setRoleNameError("");
  }

  function togglePermission(mod) {
    setRoleForm((f) => ({
      ...f,
      permissions: f.permissions.includes(mod) ? f.permissions.filter((m) => m !== mod) : [...f.permissions, mod],
    }));
  }

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

  function handleCancelCreateRole() {
    setRoleForm({ name: "", description: "", permissions: [] });
    setRoleNameError("");
  }

  function deleteRole(id) {
    setRoleList((prev) => prev.filter((r) => r.id !== id));
  }

  function confirmDeleteRole() {
    if (deleteRoleTarget) {
      deleteRole(deleteRoleTarget.id);
      setDeleteRoleTarget(null);
    }
    document.getElementById("deleteRoleModalClose")?.click();
  }

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
      permissions: f.permissions.includes(mod) ? f.permissions.filter((m) => m !== mod) : [...f.permissions, mod],
    }));
  }

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

  const [selfForm, setSelfForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [selfTouched, setSelfTouched] = useState(false);
  const [selfSuccess, setSelfSuccess] = useState(false);
  const [showSelfPassword, setShowSelfPassword] = useState(false);

  const selfHasLength = selfForm.newPassword.length >= 8;
  const selfHasCase = /[a-z]/.test(selfForm.newPassword) && /[A-Z]/.test(selfForm.newPassword);
  const selfHasNumber = /[0-9]/.test(selfForm.newPassword);
  const selfHasSpecial = /[^A-Za-z0-9]/.test(selfForm.newPassword);
  const selfMatches = selfForm.newPassword.length > 0 && selfForm.newPassword === selfForm.confirmPassword;
  const selfCanSubmit = selfForm.currentPassword.length > 0 && selfHasLength && selfHasCase && selfHasNumber && selfHasSpecial && selfMatches;

  useEffect(() => {
    if (!selfSuccess) return;
    const timer = setTimeout(() => setSelfSuccess(false), 4000);
    return () => clearTimeout(timer);
  }, [selfSuccess]);

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

  useEffect(() => {
    editModalInstance.current = new BsModal(document.getElementById("editUserModal"));
    editRoleModalInstance.current = new BsModal(document.getElementById("editRoleModal"));
    resetModalInstance.current = new BsModal(document.getElementById("resetPasswordModal"));
  }, []);

  function switchTab(nextTab) {
    setGeneralSaved(false);
    setSelfSuccess(false);
    setTab(nextTab);
  }

  return (
    <>
      <section>
        <div className="mt-4">
          <PageHeader title="Settings" description="Manage your company profile, users, and roles." />
        </div>
      </section>

      <hr className="my-3 opacity-25" />

      <section>
        <SettingsTabsNav tab={tab} onSwitch={switchTab} />
      </section>

      {tab === "general" && <GeneralTab generalSaved={generalSaved} onSave={handleSaveGeneral} />}

      {tab === "users" && <UsersTab users={users} onEditUser={openEditUser} onResetPassword={openResetPassword} onDeleteUser={setDeleteUserTarget} />}

      {tab === "roles" && <RolesTab roleList={roleList} onEditRole={openEditRole} onDeleteRole={setDeleteRoleTarget} />}

      {tab === "password" && (
        <ChangePasswordTab
          self={{
            form: selfForm,
            touched: selfTouched,
            success: selfSuccess,
            showPassword: showSelfPassword,
            hasLength: selfHasLength,
            hasCase: selfHasCase,
            hasNumber: selfHasNumber,
            hasSpecial: selfHasSpecial,
            matches: selfMatches,
            canSubmit: selfCanSubmit,
          }}
          onChange={handleSelfChange}
          onSubmit={handleSelfSubmit}
          onToggleShowPassword={() => setShowSelfPassword((s) => !s)}
        />
      )}

      <CreateUserModal userForm={userForm} roleList={roleList} onChange={handleUserChange} onSubmit={handleCreateUser} />
      <DeleteUserModal target={deleteUserTarget} onConfirm={confirmDeleteUser} />
      <EditUserModal editForm={editForm} roleList={roleList} onChange={handleEditChange} onSubmit={handleEditUser} />
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

      <DeleteRoleModal target={deleteRoleTarget} onConfirm={confirmDeleteRole} />
      <EditRoleModal
        modules={modules}
        editRoleForm={editRoleForm}
        nameError={editRoleNameError}
        onChange={handleEditRoleChange}
        onTogglePermission={toggleEditRolePermission}
        onSubmit={handleEditRoleSubmit}
      />
      <CreateRoleModal
        modules={modules}
        roleForm={roleForm}
        nameError={roleNameError}
        onChange={handleRoleChange}
        onTogglePermission={togglePermission}
        onSubmit={handleCreateRole}
        onCancel={handleCancelCreateRole}
      />
    </>
  );
}
