import { Modal, BtnSecondary, BtnPrimary, FormField } from "../ui/index.jsx";

// CreateRoleModal — modal form for creating a role with module permissions.
export function CreateRoleModal({ modules, roleForm, nameError, onChange, onTogglePermission, onSubmit, onCancel }) {
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
          <div className="row">
            {modules.map((mod) => (
              <div className="col-6 form-check" key={mod}>
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
            ))}
          </div>
        </FormField>
      </form>
    </Modal>
  );
}
