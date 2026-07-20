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
  ExportMenu,
  FilterSelect,
  FilterMenu,
  FilterCheckGroup,
  SearchInput,
  IconBtn,
  Modal,
  FormField,
  DetailList,
  DetailRow,
  PageHeader,
} from "../components/ui/index.jsx";
import { billingStats, invoices as initialInvoices, clients } from "../assets/data/index.js";
import { exportToCsv } from "../utils/exportToCsv.js";

const COMPANY = {
  name: "Payroll System Inc.",
  email: "support@payrollsys.com",
  address: "8th Floor, One Global Place, Taguig City, Metro Manila",
};

const emptyInvoice = {
  client: "Acme Corp",
  invoiceDate: "",
  dueDate: "",
  amount: "",
  status: "Sent",
};

// Billing — invoice list with create-invoice and view-invoice modals.
export default function Billing() {
  const [invoices, setInvoices] = useState(initialInvoices);
  const [hidden, setHidden] = useState([]);

  function toggleHidden(id) {
    setHidden((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  const [viewTarget, setViewTarget] = useState(null);

  function getClientInfo(clientName) {
    return clients.find((c) => c.name === clientName);
  }

  const [form, setForm] = useState(emptyInvoice);

  function handleChange(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  function handleCreateInvoice(e) {
    e.preventDefault();
    if (!form.invoiceDate || !form.amount) return;
    const nextNum = 1024 + invoices.length;
    setInvoices((prev) => [
      {
        id: `INV-${nextNum}`,
        client: form.client,
        invoiceDate: form.invoiceDate,
        dueDate: form.dueDate,
        amount: `₱${Number(form.amount).toLocaleString("en-PH", { minimumFractionDigits: 2 })}`,
        status: form.status,
      },
      ...prev,
    ]);
    setForm(emptyInvoice);
    document.getElementById("createInvoiceModalClose")?.click();
  }

  function handleExportAll() {
    exportToCsv(
      "invoices",
      ["Invoice #", "Client", "Invoice Date", "Due Date", "Amount", "Status"],
      invoices.map((inv) => [inv.id, inv.client, inv.invoiceDate, inv.dueDate, inv.amount, inv.status]),
    );
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
          {billingStats.map((s) => (
            <div className="col-xl-3 col-md-6" key={s.label}>
              <StatCard {...s} />
            </div>
          ))}
        </div>
      </section>

      <section className="mb-4">
        <div className="row g-3 align-items-end">
          <div className="col-12 col-md-3">
            <FilterSelect label="Client">
              <option>All Clients</option>
              <option>Acme Corp</option>
              <option>Globex Inc</option>
            </FilterSelect>
          </div>
          <div className="col-12 col-md-3">
            <FilterSelect label="Invoice Status">
              <option>All</option>
              <option>Sent</option>
              <option>Paid</option>
              <option>Overdue</option>
              <option>Partially Paid</option>
            </FilterSelect>
          </div>
          <div className="col-12 col-md-3">
            <FilterSelect label="Date Range">
              <option>Apr 1 – May 31, 2024</option>
            </FilterSelect>
          </div>

          <div className="col-12 col-md-3">
            <label className="form-label text-uppercase text-muted fw-semibold mb-1 d-block" style={{ fontSize: 11, letterSpacing: 0.5 }}>
              Search Invoice
            </label>
            <div className="d-flex gap-2 align-items-center w-100">
              <SearchInput placeholder="Search invoice" />
              <FilterMenu>
                <FilterCheckGroup label="Status" options={["Sent", "Paid", "Overdue", "Partially Paid"]} />
                <FilterCheckGroup label="Client" options={["Acme Corp", "Globex Inc", "Initech", "Soylent Corp"]} />
              </FilterMenu>
            </div>
          </div>
        </div>
      </section>

      <section className="mb-3 print-area">
        <DataCard>
          <Table headers={["Invoice #", "Client", "Invoice Date", "Due Date", "Amount (₱)", "Status", "Actions"]} itemLabel="invoices">
            {invoices.map((inv) => {
              const isHidden = hidden.includes(inv.id);
              return (
                <Tr key={inv.id}>
                  <Td bold>
                    <button
                      type="button"
                      className="btn btn-link p-0 fw-semibold text-decoration-none"
                      data-bs-toggle="modal"
                      data-bs-target="#viewInvoiceModal"
                      onClick={() => setViewTarget(inv)}
                    >
                      {inv.id}
                    </button>
                  </Td>
                  <Td>{inv.client}</Td>
                  <Td>{inv.invoiceDate}</Td>
                  <Td>{inv.dueDate}</Td>
                  <Td>{isHidden ? "₱ ••••••" : inv.amount}</Td>
                  <Td>
                    <Badge status={inv.status} />
                  </Td>
                  <Td>
                    <div className="d-flex align-items-center gap-1">
                      <IconBtn title="View Invoice" data-bs-toggle="modal" data-bs-target="#viewInvoiceModal" onClick={() => setViewTarget(inv)}>
                        <i className="fas fa-file-invoice"></i>
                      </IconBtn>
                      <IconBtn title={isHidden ? "Show amount" : "Hide amount"} onClick={() => toggleHidden(inv.id)}>
                        <i className={`fas ${isHidden ? "fa-eye-slash" : "fa-eye"}`}></i>
                      </IconBtn>
                    </div>
                  </Td>
                </Tr>
              );
            })}
          </Table>
        </DataCard>
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
          <FormField label="Client">
            <select className="form-select" name="client" value={form.client} onChange={handleChange}>
              <option>Acme Corp</option>
              <option>Globex Inc</option>
              <option>Initech</option>
              <option>Soylent Corp</option>
            </select>
          </FormField>
          <div className="row g-3">
            <div className="col-6">
              <FormField label="Invoice Date">
                <input type="date" className="form-control" name="invoiceDate" value={form.invoiceDate} onChange={handleChange} required />
              </FormField>
            </div>
            <div className="col-6">
              <FormField label="Due Date">
                <input type="date" className="form-control" name="dueDate" value={form.dueDate} onChange={handleChange} required />
              </FormField>
            </div>
          </div>
          <FormField label="Amount (₱)">
            <input
              type="number"
              min="0"
              step="0.01"
              className="form-control"
              name="amount"
              value={form.amount}
              onChange={handleChange}
              placeholder="0.00"
              required
            />
          </FormField>
          <FormField label="Status">
            <select className="form-select" name="status" value={form.status} onChange={handleChange}>
              <option>Sent</option>
              <option>Paid</option>
              <option>Partially Paid</option>
              <option>Overdue</option>
            </select>
          </FormField>
        </form>
      </Modal>

      <Modal
        id="viewInvoiceModal"
        title="Invoice"
        size="modal-lg"
        footer={
          <>
            <BtnSecondary data-bs-dismiss="modal">Close</BtnSecondary>
            <button type="button" className="btn btn-dark btn-sm" onClick={() => window.print()}>
              <i className="fas fa-file-pdf"></i> Download PDF
            </button>
          </>
        }
      >
        {viewTarget &&
          (() => {
            const billTo = getClientInfo(viewTarget.client);
            return (
              <div className="print-area">
                <div className="d-flex flex-wrap justify-content-between gap-3 mb-4">
                  <div>
                    <div className="fw-bold fs-5">{COMPANY.name}</div>
                    <div className="text-muted small">{COMPANY.address}</div>
                    <div className="text-muted small">{COMPANY.email}</div>
                  </div>
                  <div className="text-sm-end">
                    <div className="fw-bold fs-5">{viewTarget.id}</div>
                    <div className="mb-1">
                      <Badge status={viewTarget.status} />
                    </div>
                    <div className="text-muted small">Invoice Date: {viewTarget.invoiceDate}</div>
                    <div className="text-muted small">Due Date: {viewTarget.dueDate}</div>
                  </div>
                </div>

                <div className="text-uppercase text-muted fw-semibold mb-2" style={{ fontSize: 11, letterSpacing: 0.5 }}>
                  Bill To
                </div>
                {billTo ? (
                  <DetailList>
                    <DetailRow icon="fa-building" label="Client">
                      {billTo.name}
                    </DetailRow>
                    <DetailRow icon="fa-user" label="Contact Person">
                      {billTo.contact}
                    </DetailRow>
                    <DetailRow icon="fa-envelope" label="Email">
                      {billTo.email}
                    </DetailRow>
                    <DetailRow icon="fa-phone" label="Phone">
                      {billTo.phone}
                    </DetailRow>
                    <DetailRow icon="fa-location-dot" label="Address">
                      {billTo.address}
                    </DetailRow>
                  </DetailList>
                ) : (
                  <p className="text-muted small">{viewTarget.client}</p>
                )}

                <div className="text-uppercase text-muted fw-semibold mt-4 mb-2" style={{ fontSize: 11, letterSpacing: 0.5 }}>
                  Line Items
                </div>
                <div className="border rounded-3 overflow-hidden">
                  <table className="table table-sm mb-0 align-middle">
                    <thead className="table-light">
                      <tr>
                        <th className="small text-muted fw-semibold ps-3">Description</th>
                        <th className="small text-muted fw-semibold text-end pe-3">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="ps-3">
                          Staffing services — {viewTarget.client}
                          <div className="text-muted" style={{ fontSize: 11.5 }}>
                            {viewTarget.invoiceDate} to {viewTarget.dueDate}
                          </div>
                        </td>
                        <td className="text-end pe-3">{viewTarget.amount}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="d-flex justify-content-between align-items-center border-top pt-3 mt-3">
                  <span className="fw-semibold">Total Due</span>
                  <span className="fw-bold fs-5">{viewTarget.amount}</span>
                </div>
              </div>
            );
          })()}
      </Modal>
    </>
  );
}
