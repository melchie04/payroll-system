import { Modal, BtnSecondary } from "../ui/index.jsx";

// DeleteRoleModal — confirmation modal for deleting a role.
export function DeleteRoleModal({ target, onConfirm }) {
  return (
    <Modal
      id="deleteRoleModal"
      title="Delete Role"
      footer={
        <>
          <BtnSecondary id="deleteRoleModalClose" data-bs-dismiss="modal">
            Cancel
          </BtnSecondary>
          <button type="button" className="btn btn-danger btn-sm" onClick={onConfirm}>
            <i className="fas fa-trash"></i> Delete
          </button>
        </>
      }
    >
      <p className="mb-0">
        Are you sure you want to delete the <strong>{target?.name}</strong> role? Users assigned to it will need to be reassigned a new role.
      </p>
    </Modal>
  );
}
