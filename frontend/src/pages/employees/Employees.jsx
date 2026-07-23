import { Link, useNavigate } from "react-router-dom";
import { useMemo, useState } from "react";
import {
  DataCard,
  Table,
  Tr,
  Td,
  Badge,
  IconBtn,
  BtnSecondary,
  ExportMenu,
  FilterSelect,
  FilterMenu,
  FilterCheckGroup,
  SearchInput,
  Modal,
  PageHeader,
} from "../../components/ui/index.jsx";
import { useEmployees } from "../../context/EmployeesContext.jsx";
import { clientNames } from "../../assets/data/index.js";
import { useTimesheets, resolveEmployee } from "../../context/TimesheetContext.jsx";
import { exportToCsv } from "../../utils/exportToCsv.js";

const CSV_HEADERS = ["Code", "Name", "Client", "Position", "Email", "Rate", "Status"];

function toCsvRows(list) {
  return list.map((e) => [e.code || "", e.name, e.client, e.position, e.email, e.rate, e.status]);
}

// Employees — employee list with selection, bulk actions, filters, and export.
export default function Employees() {
  const navigate = useNavigate();
  const { employees, deleteEmployee, archiveEmployee, restoreEmployee } = useEmployees();
  const { files } = useTimesheets();

  const [selected, setSelected] = useState([]);
  const [client, setClient] = useState("All Clients");
  const [position, setPosition] = useState("All Positions");
  const [search, setSearch] = useState("");
  const [statusDraft, setStatusDraft] = useState([]);
  const [status, setStatus] = useState([]);

  // Position options track the roster, so a new position shows up in the filter on its own.
  const positions = useMemo(() => [...new Set(employees.map((e) => e.position))], [employees]);

  const visibleEmployees = useMemo(() => {
    const query = search.trim().toLowerCase();
    return employees.filter((e) => {
      if (client !== "All Clients" && e.client !== client) return false;
      if (position !== "All Positions" && e.position !== position) return false;
      if (status.length > 0 && !status.includes(e.status)) return false;
      if (!query) return true;
      return `${e.name} ${e.email} ${e.code || ""}`.toLowerCase().includes(query);
    });
  }, [employees, client, position, search, status]);

  const toggleOne = (id) => setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  // Select-all acts on the rows currently shown, so filtering then ticking the header
  // never selects people the operator cannot see.
  const visibleIds = visibleEmployees.map((e) => e.id);
  const allSelected = visibleEmployees.length > 0 && visibleIds.every((id) => selected.includes(id));

  function toggleAll() {
    setSelected(allSelected ? selected.filter((id) => !visibleIds.includes(id)) : [...new Set([...selected, ...visibleIds])]);
  }

  const toggleStatusDraft = (opt) =>
    setStatusDraft((prev) => (prev.includes(opt) ? prev.filter((s) => s !== opt) : [...prev, opt]));

  const [target, setTarget] = useState(null);

  // Anyone a sheet resolves to is kept rather than deleted, so no sheet is left
  // pointing at a person who no longer exists.
  const sheetOwnerIds = useMemo(
    () => new Set(files.map((f) => resolveEmployee(f.employee, employees)?.id).filter((id) => id != null)),
    [files, employees],
  );
  const hasHistory = (emp) => sheetOwnerIds.has(emp.id);

  const selectedEmployees = employees.filter((e) => selected.includes(e.id));
  const toArchive = selectedEmployees.filter((e) => hasHistory(e) && e.status !== "Inactive");
  const toDelete = selectedEmployees.filter((e) => !hasHistory(e));

  function confirmDelete() {
    if (target) {
      deleteEmployee(target.id);
      setTarget(null);
    }
    document.getElementById("employeeDeleteModalClose")?.click();
  }

  function confirmArchive() {
    if (target) {
      archiveEmployee(target.id);
      setTarget(null);
    }
    document.getElementById("employeeArchiveModalClose")?.click();
  }

  function confirmBulkDelete() {
    toArchive.forEach((e) => archiveEmployee(e.id));
    toDelete.forEach((e) => deleteEmployee(e.id));
    setSelected([]);
    document.getElementById("bulkDeleteModalClose")?.click();
  }

  function handleExportAll() {
    exportToCsv("employees", CSV_HEADERS, toCsvRows(employees));
  }

  function handleExportSelected() {
    const rows = employees.filter((e) => selected.includes(e.id));
    exportToCsv("employees-selected", CSV_HEADERS, toCsvRows(rows));
  }

  return (
    <>
      <section>
        <div className="mt-4">
          <PageHeader
            title="Employees"
            description="Manage your employee roster across all clients."
            actions={
              <>
                <ExportMenu onExportCsv={handleExportAll} />
                <Link to="/employees/new" className="btn btn-dark btn-sm d-inline-flex align-items-center gap-2">
                  <i className="fas fa-plus"></i> Add Employee
                </Link>
              </>
            }
          />
        </div>
      </section>

      <hr className="my-3 opacity-25" />

      <section className="mb-4">
        <div className="row g-3 align-items-end">
          <div className="col-12 col-md-4">
            <FilterSelect value={client} onChange={(e) => setClient(e.target.value)}>
              <option>All Clients</option>
              {clientNames.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </FilterSelect>
          </div>
          <div className="col-12 col-md-4">
            <FilterSelect value={position} onChange={(e) => setPosition(e.target.value)}>
              <option>All Positions</option>
              {positions.map((p) => (
                <option key={p}>{p}</option>
              ))}
            </FilterSelect>
          </div>
          <div className="col-12 col-md-4">
            <div className="d-flex gap-2 align-items-center w-100">
              <SearchInput placeholder="Search employee" value={search} onChange={(e) => setSearch(e.target.value)} />
              <FilterMenu
                onApply={() => setStatus(statusDraft)}
                onReset={() => {
                  setStatusDraft([]);
                  setStatus([]);
                }}
              >
                <FilterCheckGroup label="Status" options={["Active", "On Leave", "Inactive"]} selected={statusDraft} onToggle={toggleStatusDraft} />
              </FilterMenu>
            </div>
          </div>
        </div>
      </section>

      <section className="mb-3 print-area">
        <DataCard>
          {selected.length > 0 && (
            <div className="d-flex align-items-center justify-content-between gap-2 px-3 py-2 bg-light border-bottom flex-wrap">
              <span className="small fw-semibold">
                {selected.length} employee{selected.length === 1 ? "" : "s"} selected
              </span>
              <div className="d-flex gap-2">
                <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => setSelected([])}>
                  Clear Selection
                </button>
                <button type="button" className="btn btn-sm btn-outline-secondary" onClick={handleExportSelected}>
                  <i className="fas fa-download"></i> Export Selected
                </button>
                <button type="button" className="btn btn-sm btn-danger" data-bs-toggle="modal" data-bs-target="#bulkDeleteModal">
                  <i className="fas fa-trash"></i> Remove Selected
                </button>
              </div>
            </div>
          )}

          {visibleEmployees.length === 0 ? (
            <div className="text-center text-muted py-5 small">
              <div>No employees match the filters.</div>
              <BtnSecondary
                className="mt-3"
                onClick={() => {
                  setClient("All Clients");
                  setPosition("All Positions");
                  setSearch("");
                  setStatusDraft([]);
                  setStatus([]);
                }}
              >
                <i className="fas fa-rotate-left"></i> Clear Filters
              </BtnSecondary>
            </div>
          ) : (
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
            itemLabel="employees"
          >
            {visibleEmployees.map((emp) => (
              <Tr key={emp.id}>
                <Td>
                  <input className="form-check-input" type="checkbox" checked={selected.includes(emp.id)} onChange={() => toggleOne(emp.id)} />
                </Td>
                <Td bold>
                  <Link to={`/employees/${emp.id}`} className="text-decoration-none">
                    {emp.name}
                  </Link>
                  <div className="text-muted small">{emp.code}</div>
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
                    {emp.status === "Inactive" ? (
                      <IconBtn title="Restore" onClick={() => restoreEmployee(emp.id)}>
                        <i className="fas fa-rotate-left"></i>
                      </IconBtn>
                    ) : hasHistory(emp) ? (
                      <IconBtn title="Archive" data-bs-toggle="modal" data-bs-target="#employeeArchiveModal" onClick={() => setTarget(emp)}>
                        <i className="fas fa-box-archive text-warning"></i>
                      </IconBtn>
                    ) : (
                      <IconBtn title="Delete" data-bs-toggle="modal" data-bs-target="#employeeDeleteModal" onClick={() => setTarget(emp)}>
                        <i className="fas fa-trash text-danger"></i>
                      </IconBtn>
                    )}
                  </div>
                </Td>
              </Tr>
            ))}
          </Table>
          )}
        </DataCard>
      </section>

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

      <Modal
        id="employeeArchiveModal"
        title="Archive Employee"
        footer={
          <>
            <BtnSecondary id="employeeArchiveModalClose" data-bs-dismiss="modal">
              Cancel
            </BtnSecondary>
            <button type="button" className="btn btn-warning btn-sm" onClick={confirmArchive}>
              <i className="fas fa-box-archive"></i> Archive
            </button>
          </>
        }
      >
        <p className="mb-0">
          <strong>{target?.name}</strong> has timesheets on record, so the profile is kept and marked Inactive
          instead of deleted. Those sheets keep resolving, and Coverage stops expecting paperwork. You can restore
          them from the roster at any time.
        </p>
      </Modal>

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
          {toDelete.length > 0 && (
            <>
              <strong>
                {toDelete.length} employee{toDelete.length === 1 ? "" : "s"}
              </strong>{" "}
              will be deleted permanently.
            </>
          )}
          {toArchive.length > 0 && (
            <>
              {toDelete.length > 0 && " "}
              <strong>
                {toArchive.length} employee{toArchive.length === 1 ? "" : "s"}
              </strong>{" "}
              have timesheets on record and will be archived instead, keeping those sheets intact.
            </>
          )}
          {toDelete.length === 0 && toArchive.length === 0 && "Nothing to remove — the selected employees are already archived."}
        </p>
      </Modal>
    </>
  );
}
