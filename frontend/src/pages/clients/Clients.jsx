// Client list with filters, bulk actions and export.

import { Link, useNavigate } from "react-router";
import { useMemo, useState } from "react";
import {
  StatCard,
  DataCard,
  Table,
  Tr,
  Td,
  Badge,
  ActionsMenu,
  BtnSecondary,
  ExportMenu,
  FilterSelect,
  SearchInput,
  Modal,
  PageHeader,
} from "../../components/ui/index.jsx";
import { useClients } from "../../context/ClientsContext.jsx";
import { useActivity } from "../../context/ActivityContext.jsx";
import { useInvoices } from "../../context/InvoicesContext.jsx";
import { useEmployees } from "../../context/EmployeesContext.jsx";
import { parseCurrency, formatCurrency } from "../../utils/currency.js";
import { exportToCsv } from "../../utils/exportToCsv.js";

const CSV_HEADERS = ["Client", "Contact Person", "Email", "Phone", "Industry", "Employees", "Outstanding", "Status"];

// Flattens the client list into the columns the CSV needs.
function toCsvRows(list, countFor, outstandingFor) {
  return list.map((c) => [c.name, c.contact, c.email, c.phone, c.industry, countFor(c.code), formatCurrency(outstandingFor(c.code)), c.status]);
}

// Lists clients with filters, bulk actions and export.
export default function Clients() {
  const navigate = useNavigate();
  const { clients, deleteClient, archiveClient, restoreClient } = useClients();
  const { employees } = useEmployees();
  const { invoices, outstandingForClient, hasInvoices } = useInvoices();
  const { logActivity } = useActivity();

  const countForClient = (code) => employees.filter((e) => e.client === code).length;
  const outstandingFor = (code) => outstandingForClient(code);
  const outstanding = invoices.filter((inv) => inv.status !== "Paid").reduce((sum, inv) => sum + parseCurrency(inv.amount), 0);
  const clientStats = [
    { label: "Total Clients", value: String(clients.length), icon: "fa-building" },
    { label: "Active Clients", value: String(clients.filter((c) => c.status === "Active").length), icon: "fa-building" },
    { label: "Total Employees Deployed", value: String(employees.length), icon: "fa-user-check" },
    { label: "Outstanding Billing", value: formatCurrency(outstanding), valueColor: "var(--bs-danger)", icon: "fa-hourglass-half" },
  ];

  const [selected, setSelected] = useState([]);
  const [status, setStatus] = useState("All Statuses");
  const [industry, setIndustry] = useState("All Industries");
  const [search, setSearch] = useState("");

  const visibleClients = useMemo(() => {
    const q = search.trim().toLowerCase();
    return clients.filter((c) => {
      if (status !== "All Statuses" && c.status !== status) return false;
      if (industry !== "All Industries" && c.industry !== industry) return false;
      if (!q) return true;
      return `${c.name} ${c.contact} ${c.email} ${c.industry}`.toLowerCase().includes(q);
    });
  }, [clients, status, industry, search]);

  const toggleOne = (id) => setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const visibleIds = visibleClients.map((c) => c.id);
  const allSelected = visibleClients.length > 0 && visibleIds.every((id) => selected.includes(id));

  // Selects or clears every row currently visible.
  function toggleAll() {
    setSelected(allSelected ? selected.filter((id) => !visibleIds.includes(id)) : [...new Set([...selected, ...visibleIds])]);
  }

  const selectedClients = clients.filter((c) => selected.includes(c.id));
  const hasHistory = (c) => hasInvoices(c.code) || employees.some((e) => e.client === c.code);
  const toArchive = selectedClients.filter((c) => hasHistory(c) && c.status !== "Inactive");
  const toDelete = selectedClients.filter((c) => !hasHistory(c));

  const [target, setTarget] = useState(null);

  // Deletes one client once the dialog is confirmed.
  function confirmDelete() {
    if (target) {
      logActivity({ action: "Deleted client", detail: `Deleted ${target.name} (${target.code})`, module: "Clients" });
      deleteClient(target.id);
      setTarget(null);
    }
    document.getElementById("clientDeleteModalClose")?.click();
  }

  // Archives one client once the dialog is confirmed.
  function confirmArchive() {
    if (target) {
      logActivity({ action: "Archived client", detail: `Archived ${target.name} (${target.code})`, module: "Clients" });
      archiveClient(target.id);
      setTarget(null);
    }
    document.getElementById("clientArchiveModalClose")?.click();
  }

  // Deletes every selected client once confirmed.
  function confirmBulkDelete() {
    toArchive.forEach((c) => {
      logActivity({ action: "Archived client", detail: `Archived ${c.name} (${c.code})`, module: "Clients" });
      archiveClient(c.id);
    });
    toDelete.forEach((c) => {
      logActivity({ action: "Deleted client", detail: `Deleted ${c.name} (${c.code})`, module: "Clients" });
      deleteClient(c.id);
    });
    setSelected([]);
    document.getElementById("bulkDeleteModalClose")?.click();
  }

  // Exports every row matching the current filters.
  function handleExportAll() {
    exportToCsv("clients", CSV_HEADERS, toCsvRows(clients, countForClient, outstandingFor));
  }

  // Exports only the selected rows.
  function handleExportSelected() {
    const rows = clients.filter((c) => selected.includes(c.id));
    exportToCsv("clients-selected", CSV_HEADERS, toCsvRows(rows, countForClient, outstandingFor));
  }

  return (
    <>
      <section>
        <div className="mt-4">
          <PageHeader
            title="Clients"
            description="Manage your client accounts and their billing details."
            actions={
              <>
                <ExportMenu onExportCsv={handleExportAll} />
                <Link to="/clients/new" className="btn btn-dark btn-sm d-inline-flex align-items-center gap-2">
                  <i className="fas fa-plus"></i> Add Client
                </Link>
              </>
            }
          />
        </div>
      </section>

      <hr className="my-3 opacity-25" />

      <section className="mb-4">
        <div className="row g-3">
          {clientStats.map((s) => (
            <div className="col-xl-3 col-md-6" key={s.label}>
              <StatCard {...s} />
            </div>
          ))}
        </div>
      </section>

      <section className="mb-4">
        <div className="row g-3 align-items-end">
          <div className="col-12 col-md-4">
            <FilterSelect label="Status" value={status} onChange={(e) => setStatus(e.target.value)}>
              <option>All Statuses</option>
              <option>Active</option>
              <option>At Risk</option>
              <option>Inactive</option>
            </FilterSelect>
          </div>
          <div className="col-12 col-md-4">
            <FilterSelect label="Industry" value={industry} onChange={(e) => setIndustry(e.target.value)}>
              <option>All Industries</option>
              <option>Manufacturing</option>
              <option>Technology</option>
              <option>Finance</option>
              <option>Food &amp; Beverage</option>
              <option>Logistics</option>
              <option>Retail</option>
              <option>Construction</option>
            </FilterSelect>
          </div>
          <div className="col-12 col-md-4">
            <SearchInput label="Search Clients" placeholder="Search client" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </div>
      </section>

      <section className="mb-3 print-area">
        <DataCard>
          {selected.length > 0 && (
            <div className="d-flex align-items-center justify-content-between gap-2 px-3 py-2 bg-light border-bottom flex-wrap">
              <span className="small fw-semibold">
                {selected.length} client{selected.length === 1 ? "" : "s"} selected
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

          {visibleClients.length === 0 ? (
            <div className="text-center text-muted py-5 small">
              <div>No clients match the filters.</div>
              <BtnSecondary
                className="mt-3"
                onClick={() => {
                  setStatus("All Statuses");
                  setIndustry("All Industries");
                  setSearch("");
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
                "Client",
                "Contact Person",
                "Email",
                "Phone",
                "Industry",
                "Employees",
                "Outstanding (₱)",
                "Status",
                "Actions",
              ]}
              itemLabel="clients"
            >
              {visibleClients.map((c) => (
                <Tr key={c.id}>
                  <Td>
                    <input className="form-check-input" type="checkbox" checked={selected.includes(c.id)} onChange={() => toggleOne(c.id)} />
                  </Td>
                  <Td bold>
                    <Link to={`/clients/${c.id}`} className="text-decoration-none">
                      {c.name}
                    </Link>
                  </Td>
                  <Td>{c.contact}</Td>
                  <Td>{c.email}</Td>
                  <Td>{c.phone}</Td>
                  <Td>{c.industry}</Td>
                  <Td>{countForClient(c.code)}</Td>
                  <Td>{formatCurrency(outstandingFor(c.code))}</Td>
                  <Td>
                    <Badge status={c.status} />
                  </Td>
                  <Td>
                    <ActionsMenu
                      items={[
                        { label: "View details", icon: "fa-eye", onClick: () => navigate(`/clients/${c.id}`) },
                        { label: "Edit client", icon: "fa-pen", onClick: () => navigate(`/clients/${c.id}/edit`) },
                        { divider: true },
                        c.status === "Inactive" && {
                          label: "Restore client",
                          icon: "fa-rotate-left",
                          onClick: () => {
                            logActivity({ action: "Restored client", detail: `Restored ${c.name} (${c.code})`, module: "Clients" });
                            restoreClient(c.id);
                          },
                        },
                        c.status !== "Inactive" &&
                          hasHistory(c) && {
                            label: "Archive client",
                            icon: "fa-box-archive",
                            title: "Keeps the record so its invoices and staff still resolve",
                            modalTarget: "clientArchiveModal",
                            onClick: () => setTarget(c),
                          },
                        c.status !== "Inactive" &&
                          !hasHistory(c) && {
                            label: "Delete client",
                            icon: "fa-trash",
                            danger: true,
                            modalTarget: "clientDeleteModal",
                            onClick: () => setTarget(c),
                          },
                      ].filter(Boolean)}
                    />
                  </Td>
                </Tr>
              ))}
            </Table>
          )}
        </DataCard>
      </section>

      <Modal
        id="clientDeleteModal"
        title="Delete Client"
        footer={
          <>
            <BtnSecondary id="clientDeleteModalClose" data-bs-dismiss="modal">
              Cancel
            </BtnSecondary>
            <button type="button" className="btn btn-danger btn-sm" onClick={confirmDelete}>
              <i className="fas fa-trash"></i> Delete
            </button>
          </>
        }
      >
        <p className="mb-0">
          Are you sure you want to delete <strong>{target?.name}</strong>? This will remove them from your client list. This action cannot be undone.
        </p>
      </Modal>

      <Modal
        id="clientArchiveModal"
        title="Archive Client"
        footer={
          <>
            <BtnSecondary id="clientArchiveModalClose" data-bs-dismiss="modal">
              Cancel
            </BtnSecondary>
            <button type="button" className="btn btn-warning btn-sm" onClick={confirmArchive}>
              <i className="fas fa-box-archive"></i> Archive
            </button>
          </>
        }
      >
        <p className="mb-0">
          <strong>{target?.name}</strong> has invoices or staff on record, so the record is kept and marked Inactive instead of deleted. Those
          invoices and employees still resolve to this client. You can restore it from the list at any time.
        </p>
      </Modal>

      <Modal
        id="bulkDeleteModal"
        title="Delete Selected Clients"
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
                {toDelete.length} client{toDelete.length === 1 ? "" : "s"}
              </strong>{" "}
              will be deleted permanently.
            </>
          )}
          {toArchive.length > 0 && (
            <>
              {toDelete.length > 0 && " "}
              <strong>
                {toArchive.length} client{toArchive.length === 1 ? "" : "s"}
              </strong>{" "}
              have invoices or staff on record and will be archived instead, keeping those links intact.
            </>
          )}
          {toDelete.length === 0 && toArchive.length === 0 && "Nothing to remove — the selected clients are already archived."}
        </p>
      </Modal>
    </>
  );
}
