import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import {
  StatCard,
  DataCard,
  Table,
  Tr,
  Td,
  Badge,
  IconBtn,
  BtnSecondary,
  FilterSelect,
  FilterMenu,
  FilterCheckGroup,
  SearchInput,
  Modal,
  PageHeader,
  Pagination,
} from "../../components/ui/index.jsx";
import { clientStats } from "../../assets/data/index.js";
import { useClients } from "../../context/ClientsContext.jsx";

export default function Clients() {
  const navigate = useNavigate();
  const { clients, deleteClient } = useClients();

  // ============================================================
  // TABLE / SELECTION
  // ============================================================
  const [selected, setSelected] = useState([]);

  const toggleOne = (id) => setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const allSelected = clients.length > 0 && selected.length === clients.length;

  function toggleAll() {
    setSelected(allSelected ? [] : clients.map((c) => c.id));
  }

  // ============================================================
  // DELETE CLIENT (single row)
  // ============================================================
  const [target, setTarget] = useState(null); // client pending deletion

  function confirmDelete() {
    if (target) {
      deleteClient(target.id);
      setTarget(null);
    }
    document.getElementById("clientDeleteModalClose")?.click();
  }

  // ============================================================
  // BULK DELETE (selected rows)
  // ============================================================
  function confirmBulkDelete() {
    selected.forEach((id) => deleteClient(id));
    setSelected([]);
    document.getElementById("bulkDeleteModalClose")?.click();
  }

  return (
    <>
      {/* ========================================================== */}
      {/* DIVISION 1: HEADER                                         */}
      {/* ========================================================== */}
      <section>
        <div className="mt-4">
          <PageHeader
            title="Clients"
            description="Manage your client accounts and their billing details."
            actions={
              <Link to="/clients/new" className="btn btn-dark btn-sm d-inline-flex align-items-center gap-2">
                <i className="fas fa-plus"></i> Add Client
              </Link>
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
          {clientStats.map((s) => (
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
          <div className="col-12 col-md-4">
            <FilterSelect label="Status">
              <option>All Statuses</option>
              <option>Active</option>
              <option>At Risk</option>
              <option>Inactive</option>
            </FilterSelect>
          </div>
          <div className="col-12 col-md-4">
            <FilterSelect label="Industry">
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
            <label className="form-label text-uppercase text-muted fw-semibold mb-1 d-block" style={{ fontSize: 11, letterSpacing: 0.5 }}>
              Search Client
            </label>
            <div className="d-flex gap-2 align-items-center w-100">
              <SearchInput placeholder="Search client" />
              <FilterMenu>
                <FilterCheckGroup label="Status" options={["Active", "At Risk", "Inactive"]} />
                <FilterCheckGroup label="Industry" options={["Manufacturing", "Technology", "Finance", "Retail"]} />
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
          {/* Bulk actions bar — only shows once at least one row is checked */}
          {selected.length > 0 && (
            <div className="d-flex align-items-center justify-content-between gap-2 px-3 py-2 bg-light border-bottom flex-wrap">
              <span className="small fw-semibold">
                {selected.length} client{selected.length === 1 ? "" : "s"} selected
              </span>
              <div className="d-flex gap-2">
                <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => setSelected([])}>
                  Clear Selection
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
              "Client",
              "Contact Person",
              "Email",
              "Phone",
              "Industry",
              "Employees",
              "Billing (₱)",
              "Status",
              "Actions",
            ]}
          >
            {clients.map((c) => (
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
                <Td>{c.employees}</Td>
                <Td>{c.billing}</Td>
                <Td>
                  <Badge status={c.status} />
                </Td>
                <Td>
                  <div className="d-flex align-items-center gap-1">
                    <IconBtn title="View Details" onClick={() => navigate(`/clients/${c.id}`)}>
                      <i className="fas fa-eye"></i>
                    </IconBtn>
                    <IconBtn title="Edit" onClick={() => navigate(`/clients/${c.id}/edit`)}>
                      <i className="fas fa-pen"></i>
                    </IconBtn>
                    <IconBtn title="Delete" data-bs-toggle="modal" data-bs-target="#clientDeleteModal" onClick={() => setTarget(c)}>
                      <i className="fas fa-trash text-danger"></i>
                    </IconBtn>
                  </div>
                </Td>
              </Tr>
            ))}
          </Table>
          <Pagination current={1} total={2} label={`Showing 1 to ${clients.length} of 12 clients`} />
        </DataCard>
      </section>

      {/* ========================================================== */}
      {/* MODAL: CONFIRM DELETE (single row)                         */}
      {/* ========================================================== */}
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

      {/* ========================================================== */}
      {/* MODAL: CONFIRM BULK DELETE                                 */}
      {/* ========================================================== */}
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
          Are you sure you want to delete{" "}
          <strong>
            {selected.length} client{selected.length === 1 ? "" : "s"}
          </strong>{" "}
          from your list? This action cannot be undone.
        </p>
      </Modal>
    </>
  );
}
