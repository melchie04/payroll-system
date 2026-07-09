import { Modal, BtnSecondary, BtnPrimary, FormField } from "../ui/index.jsx";

export function EditUserModal({ editForm, roleList, onChange, onSubmit }) {
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
        <form id="editUserForm" onSubmit={onSubmit}>
          <FormField label="Full Name">
            <input type="text" className="form-control" name="name" value={editForm.name} onChange={onChange} required />
          </FormField>
          <FormField label="Email">
            <input type="email" className="form-control" name="email" value={editForm.email} onChange={onChange} required />
          </FormField>
          <div className="row g-3">
            <div className="col-6">
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
            <div className="col-6">
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
      )}
    </Modal>
  );
}
