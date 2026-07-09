import { useState } from "react";
import {
  StatCard,
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
  PageHeader,
  Pagination,
} from "../components/ui/index.jsx";
import { payrollStats, payrollEmployees } from "../assets/data/index.js";

export default function Payroll() {
  // ============================================================
  // TABLE / SELECTION
  // ============================================================
  const [rows, setRows] = useState(payrollEmployees);
  const [selected, setSelected] = useState([]);

  const toggleOne = (id) => setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  // ============================================================
  // DELETE ROW (remove from payroll run)
  // ============================================================
  const [target, setTarget] = useState(null); // row pending deletion

  function confirmDelete() {
    if (target) {
      setRows((prev) => prev.filter((r) => r.id !== target.id));
      setTarget(null);
    }
    document.getElementById("payrollDeleteModalClose")?.click();
  }

  return (
    <>
      {/* ========================================================== */}
      {/* DIVISION 1: HEADER                                         */}
      {/* ========================================================== */}
      <section>
        <div className="mt-4">
          <PageHeader
            title="Payroll"
            description="Manage and process payroll for your employees."
            actions={
              <>
                <BtnSecondary>
                  <i className="fas fa-upload"></i> Import Timesheet
                </BtnSecondary>
                <BtnPrimary>
                  <i className="fas fa-play"></i> Run Payroll
                </BtnPrimary>
              </>
            }
          />
        </div>
      </section>

      {/* LINE DIVIDER */}
      <hr className="my-3 opacity-25" />

      {/* ========================================================== */}
      {/* DIVISION 2: STATUS CARDS                                   */}
      {/* ========================================================== */}
      <section>
        <div className="row g-3">
          {payrollStats.map((s) => (
            <div className="col-xl-3 col-md-6" key={s.label}>
              <StatCard {...s} />
            </div>
          ))}
        </div>
      </section>

      {/* LINE DIVIDER */}
      <hr className="my-3 opacity-25" />

      {/* ========================================================== */}
      {/* DIVISION 3: CONTROLS                                       */}
      {/* ========================================================== */}
      <section>
        <div className="row g-3 align-items-end mb-4">
          <div className="col-12 col-md-3">
            <FilterSelect label="Client">
              <option>All Clients</option>
              <option>Acme Corp</option>
              <option>Globex Inc</option>
              <option>Initech</option>
              <option>Soylent Corp</option>
            </FilterSelect>
          </div>
          <div className="col-12 col-md-3">
            <FilterSelect label="Pay Period">
              <option>May 12 – May 25, 2024</option>
              <option>Apr 28 – May 11, 2024</option>
            </FilterSelect>
          </div>
          <div className="col-12 col-md-3">
            <FilterSelect label="Status">
              <option>All</option>
              <option>Ready</option>
              <option>Pending</option>
            </FilterSelect>
          </div>

          <div className="col-12 col-md-3">
            <label className="form-label text-uppercase text-muted fw-semibold mb-1 d-block" style={{ fontSize: 11, letterSpacing: 0.5 }}>
              Search Employee
            </label>
            <div className="d-flex gap-2 align-items-center w-100">
              <SearchInput placeholder="Search employee" />
              <FilterMenu>
                <FilterCheckGroup label="Status" options={["Ready", "Pending"]} />
                <FilterCheckGroup label="Client" options={["Acme Corp", "Globex Inc", "Initech", "Soylent Corp"]} />
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
          <Table headers={["", "Employee", "Client", "Position", "Hours", "Rate (₱)", "Gross Pay (₱)", "Status", "Actions"]}>
            {rows.map((row) => (
              <Tr key={row.id}>
                <Td>
                  <input className="form-check-input" type="checkbox" checked={selected.includes(row.id)} onChange={() => toggleOne(row.id)} />
                </Td>
                <Td bold>{row.name}</Td>
                <Td>{row.client}</Td>
                <Td>{row.position}</Td>
                <Td>{row.hours}</Td>
                <Td>{row.rate}</Td>
                <Td>{row.gross}</Td>
                <Td>
                  <Badge status={row.status} />
                </Td>
                <Td>
                  <ActionsMenu
                    items={[
                      { label: "View Payslip", icon: "fa-file-invoice" },
                      { label: "Edit Hours", icon: "fa-pen" },
                      { label: "Mark as Paid", icon: "fa-check" },
                      { divider: true },
                      {
                        label: "Delete",
                        icon: "fa-trash",
                        danger: true,
                        modalTarget: "payrollDeleteModal",
                        onClick: () => setTarget(row),
                      },
                    ]}
                  />
                </Td>
              </Tr>
            ))}
          </Table>
          <Pagination current={1} total={5} label={`Showing 1 to ${rows.length} of 32 employees`} />
        </DataCard>
      </section>

      {/* ========================================================== */}
      {/* MODAL: CONFIRM DELETE                                      */}
      {/* ========================================================== */}
      <Modal
        id="payrollDeleteModal"
        title="Remove from Payroll Run"
        footer={
          <>
            <BtnSecondary id="payrollDeleteModalClose" data-bs-dismiss="modal">
              Cancel
            </BtnSecondary>
            <button type="button" className="btn btn-danger btn-sm" onClick={confirmDelete}>
              <i className="fas fa-trash"></i> Remove
            </button>
          </>
        }
      >
        <p className="mb-0">
          Are you sure you want to remove <strong>{target?.name}</strong> from this payroll run? This action cannot be undone.
        </p>
      </Modal>
    </>
  );
}
