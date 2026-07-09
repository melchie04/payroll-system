import { Modal, BtnSecondary, BtnPrimary, FormField } from "../ui/index.jsx";

export function CreateUserModal({ userForm, roleList, onChange, onSubmit }) {
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
          <div className="col-6">
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
          <div className="col-6">
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
