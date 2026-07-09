import { Modal, BtnSecondary } from "../ui/index.jsx";

export function DeleteUserModal({ target, onConfirm }) {
  return (
    <Modal
      id="deleteUserModal"
      title="Delete User"
      footer={
        <>
          <BtnSecondary id="deleteUserModalClose" data-bs-dismiss="modal">
            Cancel
          </BtnSecondary>
          <button type="button" className="btn btn-danger btn-sm" onClick={onConfirm}>
            <i className="fas fa-trash"></i> Delete
          </button>
        </>
      }
    >
      <p className="mb-0">
        Are you sure you want to delete <strong>{target?.name}</strong>? This action cannot be undone.
      </p>
    </Modal>
  );
}
