import { useEffect, useRef, useState } from "react";
import { Modal as BsModal } from "bootstrap";
import {
  StatCard,
  DataCard,
  Table,
  Tr,
  Td,
  Badge,
  BtnPrimary,
  BtnSecondary,
  IconBtn,
  ExportMenu,
  FilterSelect,
  FilterMenu,
  FilterCheckGroup,
  SearchInput,
  ActionsMenu,
  Modal,
  FormField,
  DetailList,
  DetailRow,
  ProfileHeader,
  PageHeader,
  Pagination,
} from "../components/ui/index.jsx";
import { payrollStats, payrollEmployees } from "../assets/data/index.js";
import { exportToCsv } from "../utils/exportToCsv.js";

const CSV_HEADERS = ["Employee", "Client", "Position", "Hours", "Rate", "Gross Pay", "Status"];

function toCsvRows(list) {
  return list.map((r) => [r.name, r.client, r.position, r.hours, r.rate, r.gross, r.status]);
}

function parseCurrency(str) {
  return Number(String(str).replace(/[₱,]/g, "")) || 0;
}

function formatCurrency(num) {
  return `₱${num.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatFileSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// Row rendering is split into its own component (rather than an inline
// .map() callback) so the "Edit Hours" action — which opens a modal via a
// ref in the parent — is called through a prop instead of closing over the
// ref directly in the same render scope.
function PayrollRow({ row, checked, onToggle, onViewPayslip, onEditHours, onMarkPaid, onDelete }) {
  const items = [
    {
      label: "View Payslip",
      icon: "fa-file-invoice",
      modalTarget: "viewPayslipModal",
      onClick: onViewPayslip,
    },
    row.status !== "Paid" && {
      label: "Edit Hours",
      icon: "fa-pen",
      onClick: onEditHours,
    },
    row.status === "Ready" && {
      label: "Mark as Paid",
      icon: "fa-check",
      onClick: onMarkPaid,
    },
    { divider: true },
    {
      label: "Delete",
      icon: "fa-trash",
      danger: true,
      modalTarget: "payrollDeleteModal",
      onClick: onDelete,
    },
  ].filter(Boolean);

  return (
    <Tr>
      <Td>
        <input className="form-check-input" type="checkbox" checked={checked} onChange={onToggle} />
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
        <ActionsMenu items={items} />
      </Td>
    </Tr>
  );
}

// Approximate Philippine payroll deduction rates, for display purposes only
// (this is a front-end prototype with no real payroll engine behind it).
function computePayslip(row) {
  const gross = parseCurrency(row.gross);
  const sss = gross * 0.045;
  const philhealth = gross * 0.025;
  const pagibig = 200;
  const tax = gross * 0.08;
  const totalDeductions = sss + philhealth + pagibig + tax;
  return { gross, sss, philhealth, pagibig, tax, net: gross - totalDeductions };
}

export default function Payroll() {
  // ============================================================
  // TABLE / SELECTION
  // ============================================================
  const [rows, setRows] = useState(payrollEmployees);
  const [selected, setSelected] = useState([]);

  const toggleOne = (id) => setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const allSelected = rows.length > 0 && selected.length === rows.length;

  function toggleAll() {
    setSelected(allSelected ? [] : rows.map((r) => r.id));
  }

  // ============================================================
  // SUCCESS BANNER — shared by Run Payroll and Import Timesheet
  // ============================================================
  const [banner, setBanner] = useState(null);

  useEffect(() => {
    if (!banner) return;
    const timer = setTimeout(() => setBanner(null), 5000);
    return () => clearTimeout(timer);
  }, [banner]);

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

  // ============================================================
  // BULK ACTIONS (selected rows)
  // ============================================================
  function bulkMarkReady() {
    setRows((prev) => prev.map((r) => (selected.includes(r.id) ? { ...r, status: "Ready" } : r)));
    setSelected([]);
  }

  function confirmBulkDelete() {
    setRows((prev) => prev.filter((r) => !selected.includes(r.id)));
    setSelected([]);
    document.getElementById("bulkDeleteModalClose")?.click();
  }

  // ============================================================
  // EXPORT
  // ============================================================
  function handleExportAll() {
    exportToCsv("payroll", CSV_HEADERS, toCsvRows(rows));
  }

  function handleExportSelected() {
    const selectedRows = rows.filter((r) => selected.includes(r.id));
    exportToCsv("payroll-selected", CSV_HEADERS, toCsvRows(selectedRows));
  }

  // ============================================================
  // RUN PAYROLL — pays out everyone currently marked "Ready"
  // ============================================================
  const readyRows = rows.filter((r) => r.status === "Ready");
  const readyTotal = readyRows.reduce((sum, r) => sum + parseCurrency(r.gross), 0);
  const pendingCount = rows.filter((r) => r.status === "Pending").length;

  function handleRunPayroll() {
    if (readyRows.length === 0) return;
    setRows((prev) => prev.map((r) => (r.status === "Ready" ? { ...r, status: "Paid" } : r)));
    setBanner(`Payroll run completed — ${readyRows.length} employee${readyRows.length === 1 ? "" : "s"} marked as paid.`);
    document.getElementById("runPayrollModalClose")?.click();
  }

  // ============================================================
  // IMPORT TIMESHEET — validates hours for everyone "Pending",
  // moving them to "Ready" so they can then be paid.
  // ============================================================
  const [importFile, setImportFile] = useState(null);
  const [importDragOver, setImportDragOver] = useState(false);

  function resetImportForm() {
    setImportFile(null);
    setImportDragOver(false);
  }

  function handleImportFileChange(e) {
    setImportFile(e.target.files?.[0] || null);
  }

  function handleImportDrop(e) {
    e.preventDefault();
    setImportDragOver(false);
    setImportFile(e.dataTransfer.files?.[0] || null);
  }

  function handleImportTimesheet(e) {
    e.preventDefault();
    if (!importFile) return;
    const toUpdate = rows.filter((r) => r.status === "Pending");
    setRows((prev) => prev.map((r) => (r.status === "Pending" ? { ...r, status: "Ready" } : r)));
    setBanner(`Timesheet imported — ${toUpdate.length} employee${toUpdate.length === 1 ? "" : "s"} updated to Ready.`);
    resetImportForm();
    document.getElementById("importTimesheetModalClose")?.click();
  }

  // ============================================================
  // VIEW PAYSLIP — plain read-only breakdown, simple data-bs-toggle trigger
  // ============================================================
  const [payslipTarget, setPayslipTarget] = useState(null);

  // ============================================================
  // EDIT HOURS — controlled form, opened programmatically so the field is
  // guaranteed pre-filled before the modal becomes visible.
  // ============================================================
  const [editHoursTarget, setEditHoursTarget] = useState(null);
  const [editHoursValue, setEditHoursValue] = useState("");
  const editHoursModalInstance = useRef(null);

  useEffect(() => {
    editHoursModalInstance.current = new BsModal(document.getElementById("editHoursModal"));
  }, []);

  function openEditHours(row) {
    setEditHoursTarget(row);
    setEditHoursValue(row.hours);
    editHoursModalInstance.current?.show();
  }

  function handleEditHoursSubmit(e) {
    e.preventDefault();
    const hoursNum = Number(editHoursValue);
    if (!hoursNum || hoursNum <= 0) return;
    const rateNum = parseCurrency(editHoursTarget.rate);
    const newGross = formatCurrency(hoursNum * rateNum);
    setRows((prev) => prev.map((r) => (r.id === editHoursTarget.id ? { ...r, hours: hoursNum.toFixed(2), gross: newGross } : r)));
    editHoursModalInstance.current?.hide();
  }

  // ============================================================
  // MARK AS PAID (single row) — only valid once a row is Ready
  // ============================================================
  function markRowPaid(row) {
    setRows((prev) => prev.map((r) => (r.id === row.id ? { ...r, status: "Paid" } : r)));
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
                <ExportMenu onExportCsv={handleExportAll} />
                <BtnSecondary data-bs-toggle="modal" data-bs-target="#importTimesheetModal">
                  <i className="fas fa-upload"></i> Import Timesheet
                </BtnSecondary>
                <BtnPrimary data-bs-toggle="modal" data-bs-target="#runPayrollModal">
                  <i className="fas fa-play"></i> Run Payroll
                </BtnPrimary>
              </>
            }
          />
        </div>
      </section>

      {banner && (
        <section>
          <div className="alert alert-success py-2 small d-flex align-items-center gap-2 mb-3">
            <i className="fas fa-circle-check"></i>
            {banner}
          </div>
        </section>
      )}

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
        <div className="row g-3 align-items-end">
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
              <option>Paid</option>
            </FilterSelect>
          </div>

          <div className="col-12 col-md-3">
            <label className="form-label text-uppercase text-muted fw-semibold mb-1 d-block" style={{ fontSize: 11, letterSpacing: 0.5 }}>
              Search Employee
            </label>
            <div className="d-flex gap-2 align-items-center w-100">
              <SearchInput placeholder="Search employee" />
              <FilterMenu>
                <FilterCheckGroup label="Status" options={["Ready", "Pending", "Paid"]} />
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
      <section className="mb-3 print-area">
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
                <button type="button" className="btn btn-sm btn-outline-success" onClick={bulkMarkReady}>
                  <i className="fas fa-check"></i> Mark as Ready
                </button>
                <button type="button" className="btn btn-sm btn-outline-secondary" onClick={handleExportSelected}>
                  <i className="fas fa-download"></i> Export Selected
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
              "Employee",
              "Client",
              "Position",
              "Hours",
              "Rate (₱)",
              "Gross Pay (₱)",
              "Status",
              "Actions",
            ]}
          >
            {rows.map((row) => (
              <PayrollRow
                key={row.id}
                row={row}
                checked={selected.includes(row.id)}
                onToggle={() => toggleOne(row.id)}
                onViewPayslip={() => setPayslipTarget(row)}
                onEditHours={() => openEditHours(row)}
                onMarkPaid={() => markRowPaid(row)}
                onDelete={() => setTarget(row)}
              />
            ))}
          </Table>
          <Pagination current={1} total={5} label={`Showing 1 to ${rows.length} of 32 employees`} />
        </DataCard>
      </section>

      {/* ========================================================== */}
      {/* MODAL: RUN PAYROLL                                         */}
      {/* ========================================================== */}
      <Modal
        id="runPayrollModal"
        title="Run Payroll"
        footer={
          <>
            <BtnSecondary id="runPayrollModalClose" data-bs-dismiss="modal">
              Cancel
            </BtnSecondary>
            <button type="button" className="btn btn-dark btn-sm" onClick={handleRunPayroll} disabled={readyRows.length === 0}>
              <i className="fas fa-play"></i> Run Payroll
            </button>
          </>
        }
      >
        {readyRows.length === 0 ? (
          <p className="mb-0 text-muted">No employees are marked Ready yet. Review pending timesheets and mark them Ready before running payroll.</p>
        ) : (
          <>
            <p className="mb-3">You&rsquo;re about to run payroll for the current pay period.</p>
            <div className="bg-light rounded-3 p-3 mb-2">
              <div className="d-flex justify-content-between small mb-1">
                <span className="text-muted">Employees to be paid</span>
                <span className="fw-semibold">{readyRows.length}</span>
              </div>
              <div className="d-flex justify-content-between small">
                <span className="text-muted">Total gross pay</span>
                <span className="fw-semibold">{formatCurrency(readyTotal)}</span>
              </div>
            </div>
            {pendingCount > 0 && (
              <p className="text-warning small mb-0">
                <i className="fas fa-triangle-exclamation"></i> {pendingCount} employee
                {pendingCount === 1 ? "" : "s"} still Pending won&rsquo;t be included in this run.
              </p>
            )}
          </>
        )}
      </Modal>

      {/* ========================================================== */}
      {/* MODAL: IMPORT TIMESHEET                                    */}
      {/* ========================================================== */}
      <Modal
        id="importTimesheetModal"
        title="Import Timesheet"
        footer={
          <>
            <BtnSecondary id="importTimesheetModalClose" data-bs-dismiss="modal" onClick={resetImportForm}>
              Cancel
            </BtnSecondary>
            <BtnPrimary type="submit" form="importTimesheetForm" disabled={!importFile}>
              <i className="fas fa-upload"></i> Import
            </BtnPrimary>
          </>
        }
      >
        <form id="importTimesheetForm" onSubmit={handleImportTimesheet}>
          <input type="file" id="payroll-import-input" className="d-none" accept=".csv,.xlsx,.pdf" onChange={handleImportFileChange} />

          {!importFile ? (
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setImportDragOver(true);
              }}
              onDragLeave={() => setImportDragOver(false)}
              onDrop={handleImportDrop}
              onClick={() => document.getElementById("payroll-import-input").click()}
              className={`text-center rounded-3 py-4 px-3 mb-3 ${importDragOver ? "bg-light" : ""}`}
              style={{
                border: `2px dashed ${importDragOver ? "#aaa" : "var(--bs-border-color)"}`,
                cursor: "pointer",
              }}
            >
              <div className="mb-2" style={{ fontSize: 28 }}>
                <i className="fas fa-cloud-arrow-up text-muted"></i>
              </div>
              <div className="small fw-medium mb-1">Drag and drop a timesheet export here, or click to browse</div>
              <div className="text-muted" style={{ fontSize: 11 }}>
                Supports: CSV, XLSX, PDF
              </div>
            </div>
          ) : (
            <div className="d-flex align-items-center justify-content-between gap-3 border rounded-3 p-3 mb-3">
              <div className="d-flex align-items-center gap-3 min-w-0">
                <span style={{ fontSize: 22 }}>📄</span>
                <div className="text-truncate">
                  <div className="small fw-semibold text-dark text-truncate">{importFile.name}</div>
                  <div className="text-muted" style={{ fontSize: 11.5 }}>
                    {formatFileSize(importFile.size)}
                  </div>
                </div>
              </div>
              <IconBtn title="Remove file" onClick={resetImportForm}>
                <i className="fas fa-xmark"></i>
              </IconBtn>
            </div>
          )}

          <p className="text-muted small mb-0">Importing will mark all Pending employees as Ready once their hours are validated.</p>
        </form>
      </Modal>

      {/* ========================================================== */}
      {/* MODAL: VIEW PAYSLIP                                        */}
      {/* ========================================================== */}
      <Modal id="viewPayslipModal" title="Payslip" footer={<BtnSecondary data-bs-dismiss="modal">Close</BtnSecondary>}>
        {payslipTarget &&
          (() => {
            const p = computePayslip(payslipTarget);
            return (
              <div>
                <ProfileHeader
                  name={payslipTarget.name}
                  subtitle={`${payslipTarget.position} · ${payslipTarget.client}`}
                  subtitleIcon="fa-briefcase"
                  status={payslipTarget.status}
                />
                <div className="text-muted small mb-2">Pay Period: May 12 – 25, 2024</div>
                <DetailList>
                  <DetailRow icon="fa-clock" label="Hours Worked">
                    {payslipTarget.hours}
                  </DetailRow>
                  <DetailRow icon="fa-sack-dollar" label="Rate">
                    {payslipTarget.rate} / hr
                  </DetailRow>
                  <DetailRow icon="fa-money-bill-wave" label="Gross Pay">
                    {formatCurrency(p.gross)}
                  </DetailRow>
                </DetailList>
                <div className="text-uppercase text-muted fw-semibold mt-3 mb-2" style={{ fontSize: 11, letterSpacing: 0.5 }}>
                  Deductions
                </div>
                <DetailList>
                  <DetailRow icon="fa-shield-halved" label="SSS">
                    {formatCurrency(p.sss)}
                  </DetailRow>
                  <DetailRow icon="fa-briefcase-medical" label="PhilHealth">
                    {formatCurrency(p.philhealth)}
                  </DetailRow>
                  <DetailRow icon="fa-house" label="Pag-IBIG">
                    {formatCurrency(p.pagibig)}
                  </DetailRow>
                  <DetailRow icon="fa-receipt" label="Withholding Tax">
                    {formatCurrency(p.tax)}
                  </DetailRow>
                </DetailList>
                <div className="d-flex justify-content-between align-items-center border-top pt-3 mt-3">
                  <span className="fw-semibold">Net Pay</span>
                  <span className="fw-bold fs-5">{formatCurrency(p.net)}</span>
                </div>
              </div>
            );
          })()}
      </Modal>

      {/* ========================================================== */}
      {/* MODAL: EDIT HOURS                                          */}
      {/* ========================================================== */}
      <Modal
        id="editHoursModal"
        title="Edit Hours"
        footer={
          <>
            <BtnSecondary data-bs-dismiss="modal">Cancel</BtnSecondary>
            <BtnPrimary type="submit" form="editHoursForm">
              <i className="fas fa-floppy-disk"></i> Save Changes
            </BtnPrimary>
          </>
        }
      >
        {editHoursTarget && (
          <form id="editHoursForm" onSubmit={handleEditHoursSubmit}>
            <p className="text-muted small mb-3">
              Update hours worked for <strong>{editHoursTarget.name}</strong>. Gross pay will be recalculated automatically.
            </p>
            <FormField label="Hours Worked">
              <input
                type="number"
                min="0"
                step="0.01"
                className="form-control"
                value={editHoursValue}
                onChange={(e) => setEditHoursValue(e.target.value)}
                required
              />
            </FormField>
            <div className="bg-light rounded-3 p-3 d-flex justify-content-between small">
              <span className="text-muted">New Gross Pay</span>
              <span className="fw-semibold">{formatCurrency(parseCurrency(editHoursTarget.rate) * (Number(editHoursValue) || 0))}</span>
            </div>
          </form>
        )}
      </Modal>

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

      {/* ========================================================== */}
      {/* MODAL: CONFIRM BULK DELETE                                 */}
      {/* ========================================================== */}
      <Modal
        id="bulkDeleteModal"
        title="Remove Selected From Payroll Run"
        footer={
          <>
            <BtnSecondary id="bulkDeleteModalClose" data-bs-dismiss="modal">
              Cancel
            </BtnSecondary>
            <button type="button" className="btn btn-danger btn-sm" onClick={confirmBulkDelete}>
              <i className="fas fa-trash"></i> Remove {selected.length || ""}
            </button>
          </>
        }
      >
        <p className="mb-0">
          Are you sure you want to remove{" "}
          <strong>
            {selected.length} employee{selected.length === 1 ? "" : "s"}
          </strong>{" "}
          from this payroll run? This action cannot be undone.
        </p>
      </Modal>
    </>
  );
}
