import { DataCard, Table, Tr, Td, Badge, BtnPrimary, ActionsMenu } from "../ui/index.jsx";

// UsersTab — system users table tab.
export function UsersTab({ users, onEditUser, onResetPassword, onDeleteUser }) {
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
