import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import {
  DataCard,
  Table,
  Tr,
  Td,
  Badge,
  IconBtn,
  BtnSecondary,
  FilterSelect,
  FilterMenu,
  FilterCheckGroup,
  SearchInput,
  Modal,
  PageHeader,
  Pagination,
} from "../../components/ui/index.jsx";
import { useEmployees } from "../../context/EmployeesContext.jsx";

export default function Employees() {
  const navigate = useNavigate();
  const { employees, deleteEmployee } = useEmployees();

  // ============================================================
  // TABLE / SELECTION
  // ============================================================
  const [selected, setSelected] = useState([]);

  const toggleOne = (id) => setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const allSelected = employees.length > 0 && selected.length === employees.length;

  function toggleAll() {
    setSelected(allSelected ? [] : employees.map((e) => e.id));
  }

  // ============================================================
  // DELETE EMPLOYEE (single row)
  // ============================================================
  const [target, setTarget] = useState(null); // employee pending deletion

  function confirmDelete() {
    if (target) {
      deleteEmployee(target.id);
      setTarget(null);
    }
    document.getElementById("employeeDeleteModalClose")?.click();
  }

  // ============================================================
  // BULK DELETE (selected rows)
  // ============================================================
  function confirmBulkDelete() {
    selected.forEach((id) => deleteEmployee(id));
    setSelected([]);
    document.getElementById("bulkDeleteModalClose")?.click();
  }

  return (
    <>
      {/* ========================================================== */}
      {/* DIVISION 1: HEADER                                         */}
      {/* ========================================================== */}
      <section>
        <div className="mt-4">
          <PageHeader
            title="Employees"
            description="Manage your employee roster across all clients."
            actions={
              <Link to="/employees/new" className="btn btn-dark btn-sm d-inline-flex align-items-center gap-2">
                <i className="fas fa-plus"></i> Add Employee
              </Link>
            }
          />
        </div>
      </section>

      {/* LINE DIVIDER */}
      <hr className="my-3 opacity-25" />

      {/* ========================================================== */}
      {/* DIVISION 3: CONTROLS                                       */}
      {/* ========================================================== */}
      <section>
        <div className="row g-3 align-items-end mb-4">
          <div className="col-12 col-md-4">
            <FilterSelect>
              <option>All Clients</option>
              <option>Acme Corp</option>
              <option>Globex Inc</option>
              <option>Initech</option>
            </FilterSelect>
          </div>
          <div className="col-12 col-md-4">
            <FilterSelect>
              <option>All Positions</option>
              <option>Developer</option>
              <option>UI/UX Designer</option>
              <option>QA Engineer</option>
            </FilterSelect>
          </div>
          <div className="col-12 col-md-4">
            <div className="d-flex gap-2 align-items-center w-100">
              <SearchInput placeholder="Search employee" />
              <FilterMenu>
                <FilterCheckGroup label="Status" options={["Active", "On Leave"]} />
                <FilterCheckGroup label="Client" options={["Acme Corp", "Globex Inc", "Initech", "Soylent Corp"]} />
                <FilterCheckGroup label="Position" options={["Developer", "UI/UX Designer", "QA Engineer", "Business Analyst", "Project Manager"]} />
              </FilterMenu>
            </div>
          </div>
        </div>
      </section>

      {/* LINE DIVIDER */}
      <hr className="my-3 opacity-25" />

      {/* ========================================================== */}
      {/* DIVISION 4: TABLES                                         */}
      {/* ========================================================== */}
      <section className="mb-3">
        <DataCard>
          {/* Bulk actions bar — only shows once at least one row is checked */}
          {selected.length > 0 && (
            <div className="d-flex align-items-center justify-content-between gap-2 px-3 py-2 bg-light border-bottom flex-wrap">
              <span className="small fw-semibold">
                {selected.length} employee{selected.length === 1 ? "" : "s"} selected
              </span>
              <div className="d-flex gap-2">
                <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => setSelected([])}>
                  Clear Selection
                </button>
                <button type="button" className="btn btn-sm btn-danger" data-bs-toggle="modal" data-bs-target="#bulkDeleteModal">
                  <i className="fas fa-trash"></i> Delete Selected
                </button>
              </div>
            </div>
          )}

          <Table
            headers={[
              <span key="select-all">
                <input type="checkbox" className="form-check-input" checked={allSelected} onChange={toggleAll} />
              </span>,
              "Name",
              "Client",
              "Position",
              "Email",
              "Rate (₱/hr)",
              "Status",
              "Actions",
            ]}
          >
            {employees.map((emp) => (
              <Tr key={emp.id}>
                <Td>
                  <input className="form-check-input" type="checkbox" checked={selected.includes(emp.id)} onChange={() => toggleOne(emp.id)} />
                </Td>
                <Td bold>
                  <Link to={`/employees/${emp.id}`} className="text-decoration-none">
                    {emp.name}
                  </Link>
                </Td>
                <Td>{emp.client}</Td>
                <Td>{emp.position}</Td>
                <Td>{emp.email}</Td>
                <Td>{emp.rate}</Td>
                <Td>
                  <Badge status={emp.status} />
                </Td>
                <Td>
                  <div className="d-flex align-items-center gap-1">
                    <IconBtn title="View Profile" onClick={() => navigate(`/employees/${emp.id}`)}>
                      <i className="fas fa-eye"></i>
                    </IconBtn>
                    <IconBtn title="Edit" onClick={() => navigate(`/employees/${emp.id}/edit`)}>
                      <i className="fas fa-pen"></i>
                    </IconBtn>
                    <IconBtn title="Delete" data-bs-toggle="modal" data-bs-target="#employeeDeleteModal" onClick={() => setTarget(emp)}>
                      <i className="fas fa-trash text-danger"></i>
                    </IconBtn>
                  </div>
                </Td>
              </Tr>
            ))}
          </Table>
          <Pagination current={1} total={5} label={`Showing 1 to ${employees.length} of 32 employees`} />
        </DataCard>
      </section>

      {/* ========================================================== */}
      {/* MODAL: CONFIRM DELETE (single row)                         */}
      {/* ========================================================== */}
      <Modal
        id="employeeDeleteModal"
        title="Delete Employee"
        footer={
          <>
            <BtnSecondary id="employeeDeleteModalClose" data-bs-dismiss="modal">
              Cancel
            </BtnSecondary>
            <button type="button" className="btn btn-danger btn-sm" onClick={confirmDelete}>
              <i className="fas fa-trash"></i> Delete
            </button>
          </>
        }
      >
        <p className="mb-0">
          Are you sure you want to delete <strong>{target?.name}</strong> from your employee roster? This action cannot be undone.
        </p>
      </Modal>

      {/* ========================================================== */}
      {/* MODAL: CONFIRM BULK DELETE                                 */}
      {/* ========================================================== */}
      <Modal
        id="bulkDeleteModal"
        title="Delete Selected Employees"
        footer={
          <>
            <BtnSecondary id="bulkDeleteModalClose" data-bs-dismiss="modal">
              Cancel
            </BtnSecondary>
            <button type="button" className="btn btn-danger btn-sm" onClick={confirmBulkDelete}>
              <i className="fas fa-trash"></i> Delete {selected.length || ""}
            </button>
          </>
        }
      >
        <p className="mb-0">
          Are you sure you want to delete{" "}
          <strong>
            {selected.length} employee{selected.length === 1 ? "" : "s"}
          </strong>{" "}
          from your roster? This action cannot be undone.
        </p>
      </Modal>
    </>
  );
}
