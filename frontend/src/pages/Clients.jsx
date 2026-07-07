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
  FormField,
  PageHeader,
  Pagination,
} from "../components/ui/index.jsx";
import {
  clientStats,
  clients as initialClients,
} from "../assets/data/index.js";

const emptyClient = {
  name: "",
  contact: "",
  email: "",
  phone: "",
  industry: "Technology",
  status: "Active",
};

export default function Clients() {
  const [clients, setClients] = useState(initialClients);
  const [selected, setSelected] = useState([]);
  const [target, setTarget] = useState(null); // client pending deletion
  const [form, setForm] = useState(emptyClient);

  const toggleOne = (id) =>
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );

  function handleChange(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  function handleAddClient(e) {
    e.preventDefault();
    if (!form.name || !form.email) return;
    setClients((prev) => [
      ...prev,
      { id: Date.now(), ...form, employees: 0, billing: "₱0.00" },
    ]);
    setForm(emptyClient);
    document.getElementById("addClientModalClose")?.click();
  }

  function confirmDelete() {
    if (target) {
      setClients((prev) => prev.filter((c) => c.id !== target.id));
      setTarget(null);
    }
    document.getElementById("clientDeleteModalClose")?.click();
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
              <BtnPrimary
                data-bs-toggle="modal"
                data-bs-target="#addClientModal"
              >
                <i className="fas fa-plus"></i> Add Client
              </BtnPrimary>
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
        <div className="row g-3 align-items-end mb-4">
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
            <label
              className="form-label text-uppercase text-muted fw-semibold mb-1 d-block"
              style={{ fontSize: 11, letterSpacing: 0.5 }}
            >
              Search Client
            </label>
            <div className="d-flex gap-2 align-items-center w-100">
              <SearchInput placeholder="Search client" />
              <FilterMenu>
                <FilterCheckGroup
                  label="Status"
                  options={["Active", "At Risk", "Inactive"]}
                />
                <FilterCheckGroup
                  label="Industry"
                  options={["Manufacturing", "Technology", "Finance", "Retail"]}
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
              "",
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
                  <input
                    className="form-check-input"
                    type="checkbox"
                    checked={selected.includes(c.id)}
                    onChange={() => toggleOne(c.id)}
                  />
                </Td>
                <Td bold>{c.name}</Td>
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
                  <ActionsMenu
                    items={[
                      { label: "View Details", icon: "fa-eye" },
                      { label: "Edit", icon: "fa-pen" },
                      { divider: true },
                      {
                        label: "Delete",
                        icon: "fa-trash",
                        danger: true,
                        modalTarget: "clientDeleteModal",
                        onClick: () => setTarget(c),
                      },
                    ]}
                  />
                </Td>
              </Tr>
            ))}
          </Table>
          <Pagination
            current={1}
            total={2}
            label={`Showing 1 to ${clients.length} of 12 clients`}
          />
        </DataCard>
      </section>

      {/* ========================================================== */}
      {/* MODAL: ADD CLIENT                                          */}
      {/* ========================================================== */}
      <Modal
        id="addClientModal"
        title="Add Client"
        footer={
          <>
            <BtnSecondary id="addClientModalClose" data-bs-dismiss="modal">
              Cancel
            </BtnSecondary>
            <BtnPrimary type="submit" form="addClientForm">
              <i className="fas fa-plus"></i> Add Client
            </BtnPrimary>
          </>
        }
      >
        <form id="addClientForm" onSubmit={handleAddClient}>
          <FormField label="Client / Company Name">
            <input
              type="text"
              className="form-control"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="e.g. Acme Corp"
              required
            />
          </FormField>
          <FormField label="Contact Person">
            <input
              type="text"
              className="form-control"
              name="contact"
              value={form.contact}
              onChange={handleChange}
              placeholder="e.g. Juan Dela Cruz"
              required
            />
          </FormField>
          <div className="row g-3">
            <div className="col-6">
              <FormField label="Email">
                <input
                  type="email"
                  className="form-control"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="name@company.com"
                  required
                />
              </FormField>
            </div>
            <div className="col-6">
              <FormField label="Phone">
                <input
                  type="tel"
                  className="form-control"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="+63 900 000 0000"
                />
              </FormField>
            </div>
          </div>
          <div className="row g-3">
            <div className="col-6">
              <FormField label="Industry">
                <select
                  className="form-select"
                  name="industry"
                  value={form.industry}
                  onChange={handleChange}
                >
                  <option>Manufacturing</option>
                  <option>Technology</option>
                  <option>Finance</option>
                  <option>Food &amp; Beverage</option>
                  <option>Logistics</option>
                  <option>Retail</option>
                  <option>Construction</option>
                </select>
              </FormField>
            </div>
            <div className="col-6">
              <FormField label="Status">
                <select
                  className="form-select"
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                >
                  <option>Active</option>
                  <option>At Risk</option>
                  <option>Inactive</option>
                </select>
              </FormField>
            </div>
          </div>
        </form>
      </Modal>

      {/* ========================================================== */}
      {/* MODAL: CONFIRM DELETE                                      */}
      {/* ========================================================== */}
      <Modal
        id="clientDeleteModal"
        title="Delete Client"
        footer={
          <>
            <BtnSecondary id="clientDeleteModalClose" data-bs-dismiss="modal">
              Cancel
            </BtnSecondary>
            <button
              type="button"
              className="btn btn-danger btn-sm"
              onClick={confirmDelete}
            >
              <i className="fas fa-trash"></i> Delete
            </button>
          </>
        }
      >
        <p className="mb-0">
          Are you sure you want to delete <strong>{target?.name}</strong>? This
          will remove them from your client list. This action cannot be undone.
        </p>
      </Modal>
    </>
  );
}
