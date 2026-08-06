// The Settings Roles tab: the role list and its dialogs.

import { useEffect, useRef, useState } from "react";
import { Modal as BsModal } from "bootstrap";
import { ActionsMenu, BtnDanger, BtnPrimary, BtnSecondary, DataCard, FormField, Modal } from "../../../components/ui/index.jsx";

const modules = ["Dashboard", "Payroll", "Billing", "Timesheet", "Employees", "Clients", "Settings"];

// The roles list and the dialogs that act on it.
export default function SettingsRolesTab({ roleList, setRoleList, notify }) {
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
    notify("success", "Role created.");
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
    notify("success", "Role deleted.");
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
    notify("success", "Role updated.");
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
          {roleList.length === 0 && <div className="col-12 text-center settings-note py-5">No roles created yet.</div>}
          {roleList.map((r) => (
            <div className="col-12 col-md-6" key={r.id}>
              <div className="border rounded-3 h-100 d-flex flex-column">
                <div className="d-flex align-items-center gap-3 p-3">
                  <div
                    className="settings-role-icon d-flex align-items-center justify-content-center flex-shrink-0 rounded-3"
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

                  <div className="flex-shrink-0">
                    <ActionsMenu
                      items={[
                        { label: "Edit role", icon: "fa-pen", onClick: () => onEditRole(r) },
                        { divider: true },
                        { label: "Delete role", icon: "fa-trash", danger: true, modalTarget: "deleteRoleModal", onClick: () => onDeleteRole(r) },
                      ]}
                    />
                  </div>
                </div>

                <p className="settings-note px-3 mb-3">{r.description}</p>

                <div className="mt-auto border-top px-3 py-3">
                  <div className="app-label mb-2">Permissions</div>
                  <div className="d-flex flex-wrap gap-1">
                    {r.permissions.length === 0 && <span className="settings-note">No modules assigned.</span>}
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
      <p className="settings-note mb-3">Define a role and choose which modules the people assigned to it can open.</p>

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
          <div className="auth-requirements">
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
                    <label className="form-check-label settings-check-label" htmlFor={`role-mod-${mod}`}>
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
          <p className="settings-note mb-3">Update this role's details and the modules the people assigned to it can open.</p>

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
              <div className="auth-requirements">
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
                        <label className="form-check-label settings-check-label" htmlFor={`edit-role-mod-${mod}`}>
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
          <p className="settings-note mb-0">
            {target?.users ? `${target.users} user${target.users === 1 ? "" : "s"} assigned to it will need a new role. ` : ""}
            This action cannot be undone.
          </p>
        </div>
      </div>
    </Modal>
  );
}
