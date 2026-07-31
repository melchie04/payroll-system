import { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import {
  StatCard,
  DataCard,
  Table,
  Tr,
  Td,
  Badge,
  ActionsMenu,
  BtnPrimary,
  BtnSecondary,
  ExportMenu,
  FilterSelect,
  SearchInput,
  Modal,
  FormField,
  PageHeader,
} from "../../components/ui/index.jsx";
import { sheetPeriods } from "../../assets/data/index.js";
import { exportToCsv } from "../../utils/exportToCsv.js";
import { parseCurrency, formatCurrency } from "../../utils/currency.js";
import { billableFor } from "../../utils/billing.js";
import { useClients } from "../../context/ClientsContext.jsx";
import { useInvoices } from "../../context/InvoicesContext.jsx";
import { useTimesheets } from "../../context/TimesheetContext.jsx";
import { useEmployees } from "../../context/EmployeesContext.jsx";
import { useActivity } from "../../context/ActivityContext.jsx";
import { useNotifications } from "../../context/NotificationsContext.jsx";

const ALL_CLIENTS = "All Clients";
const ALL_STATUSES = "All Statuses";
const ALL_PERIODS = "All Periods";
const STATUSES = ["Sent", "Paid", "Partially Paid", "Overdue"];
const CSV_HEADERS = ["Invoice #", "Client", "Period", "Invoice Date", "Due Date", "Amount", "Status"];

function toCsvRows(list, nameFor) {
  return list.map((inv) => [inv.id, nameFor(inv.clientCode), inv.period || "", inv.invoiceDate, inv.dueDate, inv.amount, inv.status]);
}

// Billing — invoice list with filters, bulk actions, and a create-invoice modal.
export default function Billing() {
  const navigate = useNavigate();
  const { clients, activeClients } = useClients();
  const { invoices, addInvoice, setInvoiceStatus } = useInvoices();
  const { files } = useTimesheets();
  const { employees } = useEmployees();
  const { logActivity } = useActivity();
  const { addNotification } = useNotifications();

  // Every figure on this page is added up from the invoice list, so a card and the
  // table beneath it can never disagree.
  const stats = useMemo(() => {
    const sum = (list) => list.reduce((total, inv) => total + parseCurrency(inv.amount), 0);
    return [
      { label: "Total Invoiced", value: formatCurrency(sum(invoices)), icon: "fa-file-invoice" },
      { label: "Paid Amount", value: formatCurrency(sum(invoices.filter((inv) => inv.status === "Paid"))), icon: "fa-circle-check" },
      { label: "Outstanding", value: formatCurrency(sum(invoices.filter((inv) => inv.status !== "Paid"))), icon: "fa-hourglass-half" },
      { label: "Overdue", value: formatCurrency(sum(invoices.filter((inv) => inv.status === "Overdue"))), valueColor: "var(--bs-danger)", icon: "fa-triangle-exclamation" },
    ];
  }, [invoices]);

  // One lookup from code to display name, rebuilt only when the client list changes.
  const nameFor = useMemo(() => {
    const byCode = new Map(clients.map((c) => [c.code, c.name]));
    return (code) => byCode.get(code) || code || "";
  }, [clients]);

  const [clientFilter, setClientFilter] = useState(ALL_CLIENTS);
  const [statusFilter, setStatusFilter] = useState(ALL_STATUSES);
  const [periodFilter, setPeriodFilter] = useState(ALL_PERIODS);
  const [search, setSearch] = useState("");

  // The filter offers every client, archived ones included: their old invoices are
  // still on file and still need finding. Only the create form hides them.
  const visibleInvoices = useMemo(() => {
    const query = search.trim().toLowerCase();
    return invoices.filter((inv) => {
      if (clientFilter !== ALL_CLIENTS && inv.clientCode !== clientFilter) return false;
      if (statusFilter !== ALL_STATUSES && inv.status !== statusFilter) return false;
      if (periodFilter !== ALL_PERIODS && inv.period !== periodFilter) return false;
      if (!query) return true;
      return `${inv.id} ${nameFor(inv.clientCode)} ${inv.period || ""} ${inv.status}`.toLowerCase().includes(query);
    });
  }, [invoices, clientFilter, statusFilter, periodFilter, search, nameFor]);

  const filtering = visibleInvoices.length !== invoices.length;

  function clearFilters() {
    setClientFilter(ALL_CLIENTS);
    setStatusFilter(ALL_STATUSES);
    setPeriodFilter(ALL_PERIODS);
    setSearch("");
  }

  const [hidden, setHidden] = useState([]);

  function toggleHidden(id) {
    setHidden((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  const [selected, setSelected] = useState([]);
  const toggleOne = (id) => setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  // Select-all acts on the rows currently shown, so filtering then ticking the header
  // never selects invoices the operator cannot see.
  const visibleIds = visibleInvoices.map((inv) => inv.id);
  const allSelected = visibleInvoices.length > 0 && visibleIds.every((id) => selected.includes(id));

  function toggleAll() {
    setSelected(allSelected ? selected.filter((id) => !visibleIds.includes(id)) : [...new Set([...selected, ...visibleIds])]);
  }

  // changeStatus — the one place a status moves, so the audit entry and the alert are
  // raised the same way whether the change came from a row or from the selection bar.
  function changeStatus(invoice, status) {
    if (!invoice || invoice.status === status) return;
    setInvoiceStatus(invoice.id, status);
    const name = nameFor(invoice.clientCode);
    logActivity({ action: "Updated invoice", detail: `Marked ${invoice.id} for ${name} as ${status}`, module: "Billing" });
    if (status === "Paid") {
      addNotification({ icon: "\u2705", title: "Invoice", bold: invoice.id, sub: `was marked paid for ${name}`, type: "Billing" });
    }
  }

  function markSelectedPaid() {
    invoices.filter((inv) => selected.includes(inv.id)).forEach((inv) => changeStatus(inv, "Paid"));
    setSelected([]);
  }

  function handleExportAll() {
    exportToCsv("invoices", CSV_HEADERS, toCsvRows(visibleInvoices, nameFor));
  }

  function handleExportSelected() {
    exportToCsv("invoices-selected", CSV_HEADERS, toCsvRows(invoices.filter((inv) => selected.includes(inv.id)), nameFor));
  }

  const emptyInvoice = {
    clientCode: activeClients[0]?.code || "",
    period: sheetPeriods[sheetPeriods.length - 1],
    invoiceDate: "",
    dueDate: "",
    amount: "",
    status: "Sent",
  };

  const [form, setForm] = useState(emptyInvoice);
  const [errors, setErrors] = useState({});

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    setErrors((prev) => (prev[name] ? { ...prev, [name]: "" } : prev));
  }

  // What the chosen client and period are actually worth, worked out from their
  // approved sheets. Offered as a suggestion; the operator can still type their own.
  const calculated = useMemo(
    () =>
      billableFor({
        files,
        client: clients.find((c) => c.code === form.clientCode),
        periodLabel: form.period,
        roster: employees,
        clients,
      }),
    [files, clients, employees, form.clientCode, form.period],
  );

  function useCalculatedAmount() {
    setForm((f) => ({ ...f, amount: String(calculated.total) }));
    setErrors((prev) => (prev.amount ? { ...prev, amount: "" } : prev));
  }

  function handleCreateInvoice(e) {
    e.preventDefault();
    const found = {};
    if (!form.clientCode) found.clientCode = "Choose a client.";
    if (!form.invoiceDate) found.invoiceDate = "Enter the invoice date.";
    if (!form.dueDate) found.dueDate = "Enter the due date.";
    if (!form.amount || Number(form.amount) <= 0) found.amount = "Enter an amount greater than zero.";
    if (form.invoiceDate && form.dueDate && form.dueDate < form.invoiceDate) found.dueDate = "The due date cannot be before the invoice date.";
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    // A typed figure that matches the calculation keeps the per-employee breakdown
    // behind it, so the invoice can print what it was built from.
    const matchesCalculation = calculated.ready && Number(form.amount) === calculated.total;
    const created = addInvoice({
      clientCode: form.clientCode,
      period: form.period,
      invoiceDate: form.invoiceDate,
      dueDate: form.dueDate,
      amount: formatCurrency(Number(form.amount)),
      status: form.status,
      lines: matchesCalculation ? calculated.lines : undefined,
    });

    const name = nameFor(form.clientCode);
    logActivity({ action: "Created invoice", detail: `Created ${created.id} for ${name} covering ${form.period}`, module: "Billing" });
    addNotification({ icon: "\ud83e\uddfe", title: "Invoice", bold: created.id, sub: `was created for ${name}`, type: "Billing" });

    setForm(emptyInvoice);
    setErrors({});
    document.getElementById("createInvoiceModalClose")?.click();
  }

  return (
    <>
      <section>
        <div className="mt-4">
          <PageHeader
            title="Billing"
            description="Create invoices and track billing for your clients."
            actions={
              <>
                <ExportMenu onExportCsv={handleExportAll} />
                <BtnPrimary data-bs-toggle="modal" data-bs-target="#createInvoiceModal">
                  <i className="fas fa-plus"></i> Create Invoice
                </BtnPrimary>
              </>
            }
          />
        </div>
      </section>

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
            <FilterSelect label="Invoice Status" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option>{ALL_STATUSES}</option>
              {STATUSES.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </FilterSelect>
          </div>
          <div className="col-12 col-md-3">
            <FilterSelect label="Period" value={periodFilter} onChange={(e) => setPeriodFilter(e.target.value)}>
              <option>{ALL_PERIODS}</option>
              {sheetPeriods.map((p) => (
                <option key={p}>{p}</option>
              ))}
            </FilterSelect>
          </div>
          <div className="col-12 col-md-3">
            <SearchInput label="Search Invoice" placeholder="Search invoice" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </div>
      </section>

      <section className="mb-3 print-area">
        <DataCard>
          {selected.length > 0 && (
            <div className="d-flex align-items-center justify-content-between gap-2 px-3 py-2 bg-light border-bottom flex-wrap">
              <span className="small fw-semibold">
                {selected.length} invoice{selected.length === 1 ? "" : "s"} selected
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

          {visibleInvoices.length === 0 ? (
            <div className="text-center text-muted py-5 small">
              <div>No invoices match the filters.</div>
              <BtnSecondary className="mt-3" onClick={clearFilters}>
                <i className="fas fa-rotate-left"></i> Clear Filters
              </BtnSecondary>
            </div>
          ) : (
            <Table
              headers={[
                <span key="select-all">
                  <input type="checkbox" className="form-check-input" checked={allSelected} onChange={toggleAll} />
                </span>,
                "Invoice #",
                "Client",
                "Period",
                "Invoice Date",
                "Due Date",
                "Amount (₱)",
                "Status",
                "Actions",
              ]}
              itemLabel="invoices"
            >
              {visibleInvoices.map((inv) => {
                const isHidden = hidden.includes(inv.id);
                return (
                  <Tr key={inv.id}>
                    <Td>
                      <input className="form-check-input" type="checkbox" checked={selected.includes(inv.id)} onChange={() => toggleOne(inv.id)} />
                    </Td>
                    <Td bold>
                      <button type="button" className="btn btn-link p-0 fw-semibold text-decoration-none" onClick={() => navigate(`/billing/${inv.id}`)}>
                        {inv.id}
                      </button>
                    </Td>
                    <Td>{nameFor(inv.clientCode)}</Td>
                    <Td>{inv.period || "—"}</Td>
                    <Td>{inv.invoiceDate}</Td>
                    <Td>{inv.dueDate}</Td>
                    <Td>{isHidden ? "₱ ••••••" : inv.amount}</Td>
                    <Td>
                      <Badge status={inv.status} />
                    </Td>
                    <Td>
                      <ActionsMenu
                        items={[
                          { label: "View invoice", icon: "fa-file-invoice", onClick: () => navigate(`/billing/${inv.id}`) },
                          {
                            label: isHidden ? "Show amount" : "Hide amount",
                            icon: isHidden ? "fa-eye" : "fa-eye-slash",
                            onClick: () => toggleHidden(inv.id),
                          },
                          { divider: true },
                          inv.status !== "Paid" && { label: "Mark as paid", icon: "fa-check", onClick: () => changeStatus(inv, "Paid") },
                          inv.status !== "Sent" && { label: "Mark as sent", icon: "fa-envelope", onClick: () => changeStatus(inv, "Sent") },
                          inv.status !== "Overdue" && {
                            label: "Mark as overdue",
                            icon: "fa-triangle-exclamation",
                            onClick: () => changeStatus(inv, "Overdue"),
                            danger: true,
                          },
                        ].filter(Boolean)}
                      />
                    </Td>
                  </Tr>
                );
              })}
            </Table>
          )}
        </DataCard>
        {filtering && (
          <div className="text-muted mt-2" style={{ fontSize: "var(--app-fs-1)" }}>
            Showing {visibleInvoices.length} of {invoices.length} invoices. Export sends what is shown.
          </div>
        )}
      </section>

      <Modal
        id="createInvoiceModal"
        title="Create Invoice"
        footer={
          <>
            <BtnSecondary id="createInvoiceModalClose" data-bs-dismiss="modal">
              Cancel
            </BtnSecondary>
            <BtnPrimary type="submit" form="createInvoiceForm">
              <i className="fas fa-plus"></i> Create Invoice
            </BtnPrimary>
          </>
        }
      >
        <form id="createInvoiceForm" onSubmit={handleCreateInvoice}>
          <div className="row g-3">
            <div className="col-12 col-md-6">
              <FormField label="Client">
                <select
                  className={`form-select ${errors.clientCode ? "is-invalid" : ""}`}
                  name="clientCode"
                  value={form.clientCode}
                  onChange={handleChange}
                >
                  {activeClients.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.name}
                    </option>
                  ))}
                </select>
                {errors.clientCode && <div className="invalid-feedback d-block">{errors.clientCode}</div>}
              </FormField>
            </div>
            <div className="col-12 col-md-6">
              <FormField label="Period Covered">
                <select className="form-select" name="period" value={form.period} onChange={handleChange}>
                  {sheetPeriods.map((p) => (
                    <option key={p}>{p}</option>
                  ))}
                </select>
              </FormField>
            </div>
            <div className="col-6">
              <FormField label="Invoice Date">
                <input
                  type="date"
                  className={`form-control ${errors.invoiceDate ? "is-invalid" : ""}`}
                  name="invoiceDate"
                  value={form.invoiceDate}
                  onChange={handleChange}
                  required
                />
                {errors.invoiceDate && <div className="invalid-feedback d-block">{errors.invoiceDate}</div>}
              </FormField>
            </div>
            <div className="col-6">
              <FormField label="Due Date">
                <input
                  type="date"
                  className={`form-control ${errors.dueDate ? "is-invalid" : ""}`}
                  name="dueDate"
                  value={form.dueDate}
                  onChange={handleChange}
                  required
                />
                {errors.dueDate && <div className="invalid-feedback d-block">{errors.dueDate}</div>}
              </FormField>
            </div>
          </div>

          <div className="mt-3">
            <FormField label="Amount (₱)">
              <input
                type="number"
                min="0"
                step="0.01"
                className={`form-control ${errors.amount ? "is-invalid" : ""}`}
                name="amount"
                value={form.amount}
                onChange={handleChange}
                placeholder="0.00"
                required
              />
              {errors.amount && <div className="invalid-feedback d-block">{errors.amount}</div>}
            </FormField>
            {calculated.ready ? (
              <div className="d-flex flex-wrap align-items-center gap-2 mt-1">
                <span className="text-muted" style={{ fontSize: "var(--app-fs-1)" }}>
                  {calculated.sheetCount} approved sheet{calculated.sheetCount === 1 ? "" : "s"} · {calculated.regular} regular hrs
                  {calculated.overtime ? ` · ${calculated.overtime} OT hrs` : ""} = {formatCurrency(calculated.total)}
                </span>
                <button type="button" className="btn btn-link btn-sm p-0 text-decoration-none" onClick={useCalculatedAmount}>
                  Use this amount
                </button>
              </div>
            ) : (
              <div className="text-muted mt-1" style={{ fontSize: "var(--app-fs-1)" }}>
                {calculated.reason} — enter the amount yourself.
              </div>
            )}
          </div>

          <div className="mt-3">
            <FormField label="Status">
              <select className="form-select" name="status" value={form.status} onChange={handleChange}>
                {STATUSES.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </FormField>
          </div>
        </form>
      </Modal>
    </>
  );
}
