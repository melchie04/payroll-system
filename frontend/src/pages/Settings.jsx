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

export default function Settings() {
  // ============================================================
  // SHARED / TAB STATE
  // ============================================================
  const [tab, setTab] = useState("users");
  const [users, setUsers] = useState(systemUsers);
  const [roleList, setRoleList] = useState(initialRoles);

  // ============================================================
  // GENERAL TAB
  // ============================================================
  const [generalSaved, setGeneralSaved] = useState(false);

  // Save banner auto-dismisses after a few seconds...
  useEffect(() => {
    if (!generalSaved) return;
    const timer = setTimeout(() => setGeneralSaved(false), 4000);
    return () => clearTimeout(timer);
  }, [generalSaved]);

  function handleSaveGeneral(e) {
    e.preventDefault();
    setGeneralSaved(true);
  }

  // ============================================================
  // USERS TAB
  // ============================================================
  const [userForm, setUserForm] = useState({
    name: "",
    email: "",
    role: roleList[0]?.name || "",
    status: "Active",
  });

  // Edit User modal
  const [editTarget, setEditTarget] = useState(null);
  const [editForm, setEditForm] = useState(null);
  const editModalInstance = useRef(null);

  // Delete User confirmation
  const [deleteUserTarget, setDeleteUserTarget] = useState(null);

  // Reset Password modal
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

  // ============================================================
  // ROLES & PERMISSIONS TAB
  // ============================================================
  const [roleForm, setRoleForm] = useState({
    name: "",
    description: "",
    permissions: [],
  });
  const [roleNameError, setRoleNameError] = useState("");

  // Edit Role modal
  const [editRoleTarget, setEditRoleTarget] = useState(null);
  const [editRoleForm, setEditRoleForm] = useState(null);
  const [editRoleNameError, setEditRoleNameError] = useState("");
  const editRoleModalInstance = useRef(null);

  // Delete Role confirmation
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

  // ============================================================
  // CHANGE PASSWORD TAB (self-service)
  // ============================================================
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

  // Success banner auto-dismisses after a few seconds...
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

  // ============================================================
  // MODAL INSTANCES (Users tab: Edit User, Reset Password —
  // Roles tab: Edit Role)
  // ============================================================
  useEffect(() => {
    editModalInstance.current = new BsModal(document.getElementById("editUserModal"));
    editRoleModalInstance.current = new BsModal(document.getElementById("editRoleModal"));
    resetModalInstance.current = new BsModal(document.getElementById("resetPasswordModal"));
  }, []);

  // ============================================================
  // TAB NAVIGATION
  // ============================================================
  // ...or dismiss both banners immediately once the user switches to a
  // different tab, so they don't reappear stale if the user comes back
  // within the 4s window.
  function switchTab(nextTab) {
    setGeneralSaved(false);
    setSelfSuccess(false);
    setTab(nextTab);
  }

  return (
    <>
      {/* ========================================================== */}
      {/* DIVISION 1: HEADER                                         */}
      {/* ========================================================== */}
      <section>
        <div className="mt-4">
          <PageHeader title="Settings" description="Manage your company profile, users, and roles." />
        </div>
      </section>

      {/* LINE DIVIDER */}
      <hr className="my-3 opacity-25" />

      {/* ========================================================== */}
      {/* DIVISION 2: TABS                                           */}
      {/* ========================================================== */}
      <section>
        <SettingsTabsNav tab={tab} onSwitch={switchTab} />
      </section>

      {/* ========================================================== */}
      {/* DIVISION 3: GENERAL TAB                                    */}
      {/* ========================================================== */}
      {tab === "general" && <GeneralTab generalSaved={generalSaved} onSave={handleSaveGeneral} />}

      {/* ========================================================== */}
      {/* DIVISION 4: USERS TAB                                      */}
      {/* ========================================================== */}
      {tab === "users" && <UsersTab users={users} onEditUser={openEditUser} onResetPassword={openResetPassword} onDeleteUser={setDeleteUserTarget} />}

      {/* ========================================================== */}
      {/* DIVISION 5: ROLES TAB                                      */}
      {/* ========================================================== */}
      {tab === "roles" && <RolesTab roleList={roleList} onEditRole={openEditRole} onDeleteRole={setDeleteRoleTarget} />}

      {/* ========================================================== */}
      {/* DIVISION 6: CHANGE PASSWORD TAB                            */}
      {/* ========================================================== */}
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

      {/* ========================================================== */}
      {/* MODALS: USERS                                              */}
      {/* ========================================================== */}
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

      {/* ========================================================== */}
      {/* MODALS: ROLES                                              */}
      {/* ========================================================== */}
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
