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
  IconBtn,
  Modal,
  FormField,
  PageHeader,
  Pagination,
} from "../components/ui/index.jsx";
import {
  billingStats,
  invoices as initialInvoices,
} from "../assets/data/index.js";

const emptyInvoice = {
  client: "Acme Corp",
  invoiceDate: "",
  dueDate: "",
  amount: "",
  status: "Sent",
};

export default function Billing() {
  const [invoices, setInvoices] = useState(initialInvoices);
  const [hidden, setHidden] = useState([]); // invoice ids with masked amount
  const [form, setForm] = useState(emptyInvoice);

  function toggleHidden(id) {
    setHidden((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }

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

  return (
    <>
      {/* ========================================================== */}
      {/* DIVISION 1: HEADER                                         */}
      {/* ========================================================== */}
      <section>
        <div className="mt-4">
          <PageHeader
            title="Billing"
            description="Create invoices and track billing for your clients."
            actions={
              <>
                <BtnSecondary>
                  <i className="fas fa-download"></i> Export
                </BtnSecondary>
                <BtnPrimary
                  data-bs-toggle="modal"
                  data-bs-target="#createInvoiceModal"
                >
                  <i className="fas fa-plus"></i> Create Invoice
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
        <div className="row g-3 mb-4">
          {billingStats.map((s) => (
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
            <label
              className="form-label text-uppercase text-muted fw-semibold mb-1 d-block"
              style={{ fontSize: 11, letterSpacing: 0.5 }}
            >
              Search Invoice
            </label>
            <div className="d-flex gap-2 align-items-center w-100">
              <SearchInput placeholder="Search invoice" />
              <FilterMenu>
                <FilterCheckGroup
                  label="Status"
                  options={["Sent", "Paid", "Overdue", "Partially Paid"]}
                />
                <FilterCheckGroup
                  label="Client"
                  options={[
                    "Acme Corp",
                    "Globex Inc",
                    "Initech",
                    "Soylent Corp",
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
              "Invoice #",
              "Client",
              "Invoice Date",
              "Due Date",
              "Amount (₱)",
              "Status",
              "Actions",
            ]}
          >
            {invoices.map((inv) => {
              const isHidden = hidden.includes(inv.id);
              return (
                <Tr key={inv.id}>
                  <Td bold>{inv.id}</Td>
                  <Td>{inv.client}</Td>
                  <Td>{inv.invoiceDate}</Td>
                  <Td>{inv.dueDate}</Td>
                  <Td>{isHidden ? "₱ ••••••" : inv.amount}</Td>
                  <Td>
                    <Badge status={inv.status} />
                  </Td>
                  <Td>
                    <IconBtn
                      title={isHidden ? "Show amount" : "Hide amount"}
                      onClick={() => toggleHidden(inv.id)}
                    >
                      <i
                        className={`fas ${isHidden ? "fa-eye-slash" : "fa-eye"}`}
                      ></i>
                    </IconBtn>
                  </Td>
                </Tr>
              );
            })}
          </Table>
          <Pagination
            current={1}
            total={3}
            label={`Showing 1 to ${invoices.length} of 18 invoices`}
          />
        </DataCard>
      </section>

      {/* ========================================================== */}
      {/* MODAL: CREATE INVOICE                                      */}
      {/* ========================================================== */}
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
          <div className="row g-3">
            <div className="col-6">
              <FormField label="Invoice Date">
                <input
                  type="date"
                  className="form-control"
                  name="invoiceDate"
                  value={form.invoiceDate}
                  onChange={handleChange}
                  required
                />
              </FormField>
            </div>
            <div className="col-6">
              <FormField label="Due Date">
                <input
                  type="date"
                  className="form-control"
                  name="dueDate"
                  value={form.dueDate}
                  onChange={handleChange}
                  required
                />
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
            <select
              className="form-select"
              name="status"
              value={form.status}
              onChange={handleChange}
            >
              <option>Sent</option>
              <option>Paid</option>
              <option>Partially Paid</option>
              <option>Overdue</option>
            </select>
          </FormField>
        </form>
      </Modal>
    </>
  );
}
