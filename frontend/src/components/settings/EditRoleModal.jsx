import { Modal, BtnSecondary, BtnPrimary, FormField } from "../ui/index.jsx";

// EditRoleModal — modal form for editing a role's details and permissions.
export function EditRoleModal({ modules, editRoleForm, nameError, onChange, onTogglePermission, onSubmit }) {
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
        <form id="editRoleForm" onSubmit={onSubmit}>
          <FormField label="Role Name">
            <input
              type="text"
              className={`form-control ${nameError ? "is-invalid" : ""}`}
              name="name"
              value={editRoleForm.name}
              onChange={onChange}
              required
            />
            {nameError && <div className="invalid-feedback d-block">{nameError}</div>}
          </FormField>
          <FormField label="Description">
            <textarea className="form-control" name="description" rows={2} value={editRoleForm.description} onChange={onChange} />
          </FormField>
          <FormField label="Module Access">
            <div className="row">
              {modules.map((mod) => (
                <div className="col-6 form-check" key={mod}>
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
              ))}
            </div>
          </FormField>
        </form>
      )}
    </Modal>
  );
}
