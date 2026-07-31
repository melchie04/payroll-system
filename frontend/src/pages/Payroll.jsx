import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
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
  ExportMenu,
  FilterSelect,
  SearchInput,
  ActionsMenu,
  Modal,
  FormField,
  PageHeader,
} from "../components/ui/index.jsx";
import { payPeriods } from "../assets/data/index.js";
import { exportToCsv } from "../utils/exportToCsv.js";
import { formatCurrency } from "../utils/currency.js";
import { computeDeductions } from "../utils/payslip.js";
import { buildPayrollRows } from "../utils/payrollRun.js";
import { useClients } from "../context/ClientsContext.jsx";
import { useEmployees } from "../context/EmployeesContext.jsx";
import { useTimesheets } from "../context/TimesheetContext.jsx";
import { usePayroll } from "../context/PayrollContext.jsx";
import { useActivity } from "../context/ActivityContext.jsx";
import { useNotifications } from "../context/NotificationsContext.jsx";

const ALL_CLIENTS = "All Clients";
const ALL_STATUSES = "All Statuses";
const STATUSES = ["Ready", "Pending", "Paid"];
const CSV_HEADERS = ["Employee Code", "Employee", "Client", "Position", "Pay Period", "Hours", "Rate", "Gross Pay", "Net Pay", "Status"];

function toCsvRows(list) {
  return list.map((r) => [
    r.code,
    r.name,
    r.client,
    r.position,
    r.period,
    r.hours,
    formatCurrency(r.rate),
    formatCurrency(r.gross),
    formatCurrency(computeDeductions(r.gross).net),
    r.status,
  ]);
}

// Payroll — the run for one pay period, recalculated from approved timesheets.
export default function Payroll() {
  const navigate = useNavigate();
  const { clients } = useClients();
  const { employees } = useEmployees();
  const { files } = useTimesheets();
  const { overrides, setStatus, setStatusMany, setHours, clearOverride } = usePayroll();
  const { logActivity } = useActivity();
  const { addNotification } = useNotifications();

  const [periodLabel, setPeriodLabel] = useState(payPeriods[0].label);
  const period = payPeriods.find((p) => p.label === periodLabel) || payPeriods[0];

  // Rebuilt from the sheets on every render rather than stored, so approving a sheet
  // on the Timesheet page changes this run without anything needing to be re-imported.
  const rows = buildPayrollRows({ period, employees, files, clients, overrides });

  const [clientFilter, setClientFilter] = useState(ALL_CLIENTS);
  const [statusFilter, setStatusFilter] = useState(ALL_STATUSES);
  const [search, setSearch] = useState("");

  const query = search.trim().toLowerCase();
  const visibleRows = rows.filter((r) => {
    if (clientFilter !== ALL_CLIENTS && r.clientCode !== clientFilter) return false;
    if (statusFilter !== ALL_STATUSES && r.status !== statusFilter) return false;
    if (!query) return true;
    return `${r.code} ${r.name} ${r.client} ${r.position}`.toLowerCase().includes(query);
  });

  const filtering = visibleRows.length !== rows.length;

  function clearFilters() {
    setClientFilter(ALL_CLIENTS);
    setStatusFilter(ALL_STATUSES);
    setSearch("");
  }

  const totalHours = rows.reduce((sum, r) => sum + r.hours, 0);
  const grossTotal = rows.reduce((sum, r) => sum + r.gross, 0);
  const netTotal = rows.reduce((sum, r) => sum + computeDeductions(r.gross).net, 0);
  const stats = [
    { label: "Employees In Run", value: String(rows.length), sub: `${rows.filter((r) => r.status === "Pending").length} still pending` },
    { label: "Total Hours", value: totalHours.toFixed(2) },
    { label: "Gross Payroll", value: formatCurrency(grossTotal) },
    { label: "Net Payroll", value: formatCurrency(netTotal) },
  ];

  const [selected, setSelected] = useState([]);
  const toggleOne = (key) => setSelected((prev) => (prev.includes(key) ? prev.filter((x) => x !== key) : [...prev, key]));

  // Select-all acts on the rows currently shown, so filtering then ticking the header
  // never selects people the operator cannot see.
  const visibleKeys = visibleRows.map((r) => r.key);
  const allSelected = visibleRows.length > 0 && visibleKeys.every((k) => selected.includes(k));

  function toggleAll() {
    setSelected(allSelected ? selected.filter((k) => !visibleKeys.includes(k)) : [...new Set([...selected, ...visibleKeys])]);
  }

  const [banner, setBanner] = useState(null);

  useEffect(() => {
    if (!banner) return;
    const timer = setTimeout(() => setBanner(null), 5000);
    return () => clearTimeout(timer);
  }, [banner]);

  function markPaid(row) {
    if (row.status === "Paid") return;
    setStatus(row.key, "Paid");
    logActivity({ action: "Marked payroll paid", detail: `${row.name} (${row.code}) for ${row.period}`, module: "Payroll" });
  }

  function markSelectedPaid() {
    const targets = rows.filter((r) => selected.includes(r.key) && r.status !== "Paid");
    if (targets.length === 0) return;
    setStatusMany(targets.map((r) => r.key), "Paid");
    logActivity({ action: "Marked payroll paid", detail: `${targets.length} employee(s) for ${period.label}`, module: "Payroll" });
    setSelected([]);
  }

  const readyRows = rows.filter((r) => r.status === "Ready");

  function handleRunPayroll() {
    if (readyRows.length === 0) return;
    setStatusMany(readyRows.map((r) => r.key), "Paid");
    logActivity({ action: "Ran payroll", detail: `Processed ${readyRows.length} employee(s) for ${period.label}`, module: "Payroll" });
    addNotification({
      icon: "\ud83d\udcb3",
      title: "Payroll run for",
      bold: period.label,
      sub: `covered ${readyRows.length} employee${readyRows.length === 1 ? "" : "s"}`,
      type: "Payroll",
    });
    setBanner(`Payroll run completed — ${readyRows.length} employee${readyRows.length === 1 ? "" : "s"} marked as paid.`);
    document.getElementById("runPayrollModalClose")?.click();
  }

  function handleExportAll() {
    exportToCsv("payroll", CSV_HEADERS, toCsvRows(visibleRows));
  }

  function handleExportSelected() {
    exportToCsv("payroll-selected", CSV_HEADERS, toCsvRows(rows.filter((r) => selected.includes(r.key))));
  }

  const [editTarget, setEditTarget] = useState(null);
  const [editValue, setEditValue] = useState("");
  const editModal = useRef(null);

  useEffect(() => {
    editModal.current = new BsModal(document.getElementById("editHoursModal"));
  }, []);

  function openEditHours(row) {
    setEditTarget(row);
    setEditValue(String(row.hours));
    editModal.current?.show();
  }

  function handleEditHoursSubmit(e) {
    e.preventDefault();
    const hours = Number(editValue);
    if (!Number.isFinite(hours) || hours < 0) return;
    setHours(editTarget.key, hours);
    logActivity({ action: "Adjusted payroll hours", detail: `${editTarget.name} (${editTarget.code}) set to ${hours} hrs`, module: "Payroll" });
    editModal.current?.hide();
  }

  return (
    <>
      <section>
        <div className="mt-4">
          <PageHeader
            title="Payroll"
            description="Process payroll from approved timesheets."
            actions={
              <>
                <ExportMenu onExportCsv={handleExportAll} />
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
          <div className="ts-notice ts-notice-success d-flex align-items-start gap-3 py-2 px-3 mb-3">
            <i className="fas fa-circle-check ts-notice-icon flex-shrink-0 mt-1"></i>
            <div style={{ fontSize: "0.8125rem" }}>{banner}</div>
          </div>
        </section>
      )}

      <hr className="my-3 opacity-25" />

      <section className="mb-4">
        <div className="row g-3">
          {stats.map((s) => (
            <div className="col-xl-3 col-md-6" key={s.label}>
              <StatCard {...s} />
            </div>
          ))}
        </div>
      </section>

      <section className="mb-4">
        <div className="row g-3 align-items-end">
          <div className="col-12 col-md-3">
            <FilterSelect label="Pay Period" value={periodLabel} onChange={(e) => setPeriodLabel(e.target.value)}>
              {payPeriods.map((p) => (
                <option key={p.label}>{p.label}</option>
              ))}
            </FilterSelect>
          </div>
          <div className="col-12 col-md-3">
            <FilterSelect label="Client" value={clientFilter} onChange={(e) => setClientFilter(e.target.value)}>
              <option value={ALL_CLIENTS}>{ALL_CLIENTS}</option>
              {clients.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.name}
                </option>
              ))}
            </FilterSelect>
          </div>
          <div className="col-12 col-md-3">
            <FilterSelect label="Status" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option>{ALL_STATUSES}</option>
              {STATUSES.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </FilterSelect>
          </div>
          <div className="col-12 col-md-3">
            <SearchInput label="Search Employee" placeholder="Search employee" value={search} onChange={(e) => setSearch(e.target.value)} />
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
                <button type="button" className="btn btn-sm btn-dark" onClick={markSelectedPaid}>
                  <i className="fas fa-check"></i> Mark as Paid
                </button>
              </div>
            </div>
          )}

          {visibleRows.length === 0 ? (
            <div className="text-center text-muted py-5 small">
              <div>{rows.length === 0 ? "No employees are deployed for this pay period." : "No employees match the filters."}</div>
              {rows.length > 0 && (
                <BtnSecondary className="mt-3" onClick={clearFilters}>
                  <i className="fas fa-rotate-left"></i> Clear Filters
                </BtnSecondary>
              )}
            </div>
          ) : (
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
              itemLabel="employees"
            >
              {visibleRows.map((row) => (
                <Tr key={row.key}>
                  <Td>
                    <input className="form-check-input" type="checkbox" checked={selected.includes(row.key)} onChange={() => toggleOne(row.key)} />
                  </Td>
                  <Td bold>
                    <button type="button" className="btn btn-link p-0 fw-semibold text-decoration-none" onClick={() => navigate(`/payroll/${row.employeeId}`)}>
                      {row.name}
                    </button>
                    <div className="text-muted" style={{ fontSize: 11.5 }}>
                      {row.code}
                    </div>
                  </Td>
                  <Td>{row.client}</Td>
                  <Td>{row.position}</Td>
                  <Td>
                    {row.hours.toFixed(2)}
                    {row.edited && (
                      <div className="text-muted" style={{ fontSize: 11.5 }}>
                        adjusted by hand
                      </div>
                    )}
                  </Td>
                  <Td>{formatCurrency(row.rate)}</Td>
                  <Td>{formatCurrency(row.gross)}</Td>
                  <Td>
                    <Badge status={row.status} />
                  </Td>
                  <Td>
                    <ActionsMenu
                      items={[
                        { label: "View payslip", icon: "fa-file-invoice", onClick: () => navigate(`/payroll/${row.employeeId}`) },
                        row.status !== "Paid" && { label: "Edit hours", icon: "fa-pen", onClick: () => openEditHours(row) },
                        row.edited && { label: "Use timesheet hours", icon: "fa-rotate-left", onClick: () => clearOverride(row.key) },
                        { divider: true },
                        row.status !== "Paid" && { label: "Mark as paid", icon: "fa-check", onClick: () => markPaid(row) },
                      ].filter(Boolean)}
                    />
                  </Td>
                </Tr>
              ))}
            </Table>
          )}
        </DataCard>
        {filtering && (
          <div className="text-muted mt-2" style={{ fontSize: 11.5 }}>
            Showing {visibleRows.length} of {rows.length} employees. Export sends what is shown.
          </div>
        )}
      </section>

      <Modal
        id="runPayrollModal"
        title="Run Payroll"
        footer={
          <>
            <BtnSecondary id="runPayrollModalClose" data-bs-dismiss="modal">
              Cancel
            </BtnSecondary>
            <BtnPrimary onClick={handleRunPayroll} disabled={readyRows.length === 0}>
              <i className="fas fa-play"></i> Run Payroll
            </BtnPrimary>
          </>
        }
      >
        {readyRows.length === 0 ? (
          <p className="text-muted small mb-0">
            Nothing is ready for {period.label}. An employee becomes ready once an approved timesheet covers this period.
          </p>
        ) : (
          <>
            <p className="small mb-2">
              This will mark <strong>{readyRows.length}</strong> employee{readyRows.length === 1 ? "" : "s"} as paid for{" "}
              <strong>{period.label}</strong>, totalling {formatCurrency(readyRows.reduce((s, r) => s + r.gross, 0))} gross.
            </p>
            <p className="text-muted small mb-0">
              {rows.filter((r) => r.status === "Pending").length} employee(s) are still pending and will be left alone.
            </p>
          </>
        )}
      </Modal>

      <Modal
        id="editHoursModal"
        title="Edit Hours"
        footer={
          <>
            <BtnSecondary data-bs-dismiss="modal">Cancel</BtnSecondary>
            <BtnPrimary type="submit" form="editHoursForm">
              Save Hours
            </BtnPrimary>
          </>
        }
      >
        <form id="editHoursForm" onSubmit={handleEditHoursSubmit}>
          {editTarget && (
            <>
              <p className="text-muted small">
                {editTarget.name} · {editTarget.period}
                <br />
                Timesheets support {(editTarget.regular + editTarget.overtime).toFixed(2)} hrs across {editTarget.sheets} approved sheet
                {editTarget.sheets === 1 ? "" : "s"}.
              </p>
              <FormField label="Hours">
                <input type="number" min="0" step="0.25" className="form-control" value={editValue} onChange={(e) => setEditValue(e.target.value)} required />
              </FormField>
            </>
          )}
        </form>
      </Modal>
    </>
  );
}
