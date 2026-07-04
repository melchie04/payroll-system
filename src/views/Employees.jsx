import { useState } from "react";
import {
  DataCard,
  Table,
  Tr,
  Td,
  Badge,
  BtnPrimary,
  BtnSecondary,
  FilterSelect,
  FilterMenu,
  FilterCheckGroup,
  SearchInput,
  ActionsMenu,
  Modal,
  FormField,
  PageHeader,
  Pagination,
} from "../components/ui/index.jsx";
import { employees as initialEmployees } from "../data/index.js";

const emptyEmployee = {
  name: "",
  client: "Acme Corp",
  position: "",
  email: "",
  rate: "",
  status: "Active",
};

export default function Employees() {
  const [employees, setEmployees] = useState(initialEmployees);
  const [selected, setSelected] = useState([]);
  const [target, setTarget] = useState(null); // employee pending deletion
  const [form, setForm] = useState(emptyEmployee);

  const toggleOne = (id) =>
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );

  function handleChange(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  function handleAddEmployee(e) {
    e.preventDefault();
    if (!form.name || !form.email) return;
    setEmployees((prev) => [
      ...prev,
      {
        id: Date.now(),
        ...form,
        rate: form.rate.startsWith("₱") ? form.rate : `₱${form.rate}`,
      },
    ]);
    setForm(emptyEmployee);
    document.getElementById("addEmployeeModalClose")?.click();
  }

  function confirmDelete() {
    if (target) {
      setEmployees((prev) => prev.filter((e) => e.id !== target.id));
      setTarget(null);
    }
    document.getElementById("employeeDeleteModalClose")?.click();
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
              <BtnPrimary
                data-bs-toggle="modal"
                data-bs-target="#addEmployeeModal"
              >
                <i className="fas fa-plus"></i> Add Employee
              </BtnPrimary>
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
                <FilterCheckGroup
                  label="Status"
                  options={["Active", "On Leave"]}
                />
                <FilterCheckGroup
                  label="Position"
                  options={[
                    "Developer",
                    "UI/UX Designer",
                    "QA Engineer",
                    "Business Analyst",
                    "Project Manager",
                  ]}
                />
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
          <Table
            headers={[
              "",
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
                  <input
                    className="form-check-input"
                    type="checkbox"
                    checked={selected.includes(emp.id)}
                    onChange={() => toggleOne(emp.id)}
                  />
                </Td>
                <Td bold>{emp.name}</Td>
                <Td>{emp.client}</Td>
                <Td>{emp.position}</Td>
                <Td>{emp.email}</Td>
                <Td>{emp.rate}</Td>
                <Td>
                  <Badge status={emp.status} />
                </Td>
                <Td>
                  <ActionsMenu
                    items={[
                      { label: "View Profile", icon: "fa-id-card" },
                      { label: "Edit", icon: "fa-pen" },
                      { divider: true },
                      {
                        label: "Delete",
                        icon: "fa-trash",
                        danger: true,
                        modalTarget: "employeeDeleteModal",
                        onClick: () => setTarget(emp),
                      },
                    ]}
                  />
                </Td>
              </Tr>
            ))}
          </Table>
          <Pagination
            current={1}
            total={5}
            label={`Showing 1 to ${employees.length} of 32 employees`}
          />
        </DataCard>
      </section>

      {/* ========================================================== */}
      {/* MODAL: ADD EMPLOYEE                                        */}
      {/* ========================================================== */}
      <Modal
        id="addEmployeeModal"
        title="Add Employee"
        footer={
          <>
            <BtnSecondary id="addEmployeeModalClose" data-bs-dismiss="modal">
              Cancel
            </BtnSecondary>
            <BtnPrimary type="submit" form="addEmployeeForm">
              <i className="fas fa-plus"></i> Add Employee
            </BtnPrimary>
          </>
        }
      >
        <form id="addEmployeeForm" onSubmit={handleAddEmployee}>
          <FormField label="Full Name">
            <input
              type="text"
              className="form-control"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="e.g. Juan Dela Cruz"
              required
            />
          </FormField>
          <div className="row g-3">
            <div className="col-6">
              <FormField label="Client">
                <select
                  className="form-select"
                  name="client"
                  value={form.client}
                  onChange={handleChange}
                >
                  <option>Acme Corp</option>
                  <option>Globex Inc</option>
                  <option>Initech</option>
                  <option>Soylent Corp</option>
                </select>
              </FormField>
            </div>
            <div className="col-6">
              <FormField label="Position">
                <input
                  type="text"
                  className="form-control"
                  name="position"
                  value={form.position}
                  onChange={handleChange}
                  placeholder="e.g. Developer"
                  required
                />
              </FormField>
            </div>
          </div>
          <FormField label="Email">
            <input
              type="email"
              className="form-control"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="name@company.com"
              required
            />
          </FormField>
          <div className="row g-3">
            <div className="col-6">
              <FormField label="Rate (₱/hr)">
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  className="form-control"
                  name="rate"
                  value={form.rate}
                  onChange={handleChange}
                  placeholder="0.00"
                  required
                />
              </FormField>
            </div>
            <div className="col-6">
              <FormField label="Status">
                <select
                  className="form-select"
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                >
                  <option>Active</option>
                  <option>On Leave</option>
                </select>
              </FormField>
            </div>
          </div>
        </form>
      </Modal>

      {/* ========================================================== */}
      {/* MODAL: CONFIRM DELETE                                      */}
      {/* ========================================================== */}
      <Modal
        id="employeeDeleteModal"
        title="Delete Employee"
        footer={
          <>
            <BtnSecondary id="employeeDeleteModalClose" data-bs-dismiss="modal">
              Cancel
            </BtnSecondary>
            <button
              type="button"
              className="btn btn-danger btn-sm"
              onClick={confirmDelete}
            >
              <i className="fas fa-trash"></i> Delete
            </button>
          </>
        }
      >
        <p className="mb-0">
          Are you sure you want to delete <strong>{target?.name}</strong> from
          your employee roster? This action cannot be undone.
        </p>
      </Modal>
    </>
  );
}
