import { Link, useLocation, useNavigate, useParams } from "react-router";
import { DataCard, Table, Tr, Td, Badge, BtnPrimary, DetailList, DetailRow, PageHeader } from "../components/ui/index.jsx";
import { formatCurrency, parseCurrency } from "../utils/currency.js";
import { invoiceLines } from "../utils/billing.js";
import { useClients } from "../context/ClientsContext.jsx";
import { useInvoices } from "../context/InvoicesContext.jsx";
import { useActivity } from "../context/ActivityContext.jsx";
import { useNotifications } from "../context/NotificationsContext.jsx";

const COMPANY = {
  name: "Payroll System Inc.",
  email: "support@payrollsys.com",
  address: "8th Floor, One Global Place, Taguig City, Metro Manila",
};

// Invoice — the printable detail view for one invoice.
export default function Invoice() {
  // Every hook stays above the not-found return below, so the order never changes.
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { getInvoiceById, setInvoiceStatus } = useInvoices();
  const { getClientByCode, clientNameByCode } = useClients();
  const { logActivity } = useActivity();
  const { addNotification } = useNotifications();

  const invoice = getInvoiceById(id);

  // Returns to wherever this was opened from — the billing list, or a client's billing
  // history — and falls back to the list when the page was loaded from a bare URL.
  function handleBack() {
    if (location.key !== "default") navigate(-1);
    else navigate("/billing");
  }

  function markPaid() {
    if (!invoice || invoice.status === "Paid") return;
    const name = clientNameByCode(invoice.clientCode);
    setInvoiceStatus(invoice.id, "Paid");
    logActivity({ action: "Updated invoice", detail: `Marked ${invoice.id} for ${name} as Paid`, module: "Billing" });
    addNotification({ icon: "\u2705", title: "Invoice", bold: invoice.id, sub: `was marked paid for ${name}`, type: "Billing" });
  }

  if (!invoice) {
    return (
      <section className="mt-4">
        <p className="text-muted mb-3">Invoice not found.</p>
        <Link to="/billing" className="btn btn-dark btn-sm">
          <i className="fas fa-arrow-left"></i> Back to Billing
        </Link>
      </section>
    );
  }

  const billTo = getClientByCode(invoice.clientCode);
  const clientName = billTo?.name || clientNameByCode(invoice.clientCode);
  const lines = invoiceLines(invoice, clientName);
  const total = parseCurrency(invoice.amount);

  return (
    <>
      <section>
        <div className="mt-4 d-flex align-items-start gap-2">
          <button type="button" onClick={handleBack} className="nav-icon-btn flex-shrink-0" style={{ marginTop: -6 }} aria-label="Back" title="Back">
            <i className="fas fa-arrow-left"></i>
          </button>
          <div className="flex-grow-1">
            <PageHeader
              title={invoice.id}
              description={`${clientName} · ${invoice.period || "No period recorded"}`}
              actions={
                <>
                  <button type="button" className="btn btn-outline-secondary btn-sm d-inline-flex align-items-center gap-2" onClick={() => window.print()}>
                    <i className="fas fa-file-pdf"></i> Download PDF
                  </button>
                  {invoice.status !== "Paid" && (
                    <BtnPrimary onClick={markPaid}>
                      <i className="fas fa-check"></i> Mark as Paid
                    </BtnPrimary>
                  )}
                </>
              }
            />
          </div>
        </div>
      </section>

      <hr className="my-3 opacity-25" />

      <div className="print-area">
        <section className="mb-3">
          <DataCard>
            <div className="card-body">
              <div className="d-flex flex-wrap justify-content-between gap-3">
                <div>
                  <div className="fw-bold fs-5">{COMPANY.name}</div>
                  <div className="text-muted small">{COMPANY.address}</div>
                  <div className="text-muted small">{COMPANY.email}</div>
                </div>
                <div className="text-sm-end">
                  <div className="fw-bold fs-5">{invoice.id}</div>
                  <div className="mb-1">
                    <Badge status={invoice.status} />
                  </div>
                  <div className="text-muted small">Invoice Date: {invoice.invoiceDate}</div>
                  <div className="text-muted small">Due Date: {invoice.dueDate}</div>
                </div>
              </div>
            </div>
          </DataCard>
        </section>

        <section className="mb-3">
          <DataCard title="Bill To">
            {billTo ? (
              <div className="card-body">
                <DetailList>
                  <DetailRow icon="fa-building" label="Client">
                    {billTo.name}
                  </DetailRow>
                  <DetailRow icon="fa-hashtag" label="Client Code">
                    {billTo.code}
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
              </div>
            ) : (
              <div className="card-body">
                <p className="text-muted small mb-0">
                  This invoice points at client {invoice.clientCode}, which is no longer on file.
                </p>
              </div>
            )}
          </DataCard>
        </section>

        <section className="mb-3">
          <DataCard title="Line Items">
            <Table headers={["Description", "Amount (₱)"]} itemLabel="line items">
              {lines.map((line, i) => (
                <Tr key={`${line.description}-${i}`}>
                  <Td bold>
                    {line.description}
                    <div className="text-muted" style={{ fontSize: 11.5 }}>
                      {line.detail}
                    </div>
                  </Td>
                  <Td>{formatCurrency(line.amount)}</Td>
                </Tr>
              ))}
            </Table>
            <div className="card-body d-flex justify-content-between align-items-center border-top">
              <span className="fw-semibold">Total Due</span>
              <span className="fw-bold fs-5">{formatCurrency(total)}</span>
            </div>
          </DataCard>
        </section>
      </div>
    </>
  );
}
