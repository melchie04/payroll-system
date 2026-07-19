import { useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { DataCard, BtnPrimary, FormField, PageHeader } from "../../components/ui/index.jsx";
import { useClients } from "../../context/ClientsContext.jsx";

const emptyForm = {
  name: "",
  contact: "",
  email: "",
  phone: "",
  industry: "Technology",
  status: "Active",
  clientSince: "",
  address: "",
  secondaryContact: { name: "", role: "", phone: "" },
};

// ClientForm — add/edit client form shared by /clients/new and /clients/:id/edit.
export default function ClientForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { getClientById, addClient, updateClient } = useClients();

  const isEdit = Boolean(id);
  const existing = isEdit ? getClientById(id) : null;

  const [form, setForm] = useState(() => {
    if (!isEdit) return emptyForm;
    if (!existing) return emptyForm;
    return {
      name: existing.name,
      contact: existing.contact,
      email: existing.email,
      phone: existing.phone || "",
      industry: existing.industry,
      status: existing.status,
      clientSince: existing.clientSince || "",
      address: existing.address || "",
      secondaryContact: {
        name: existing.secondaryContact?.name || "",
        role: existing.secondaryContact?.role || "",
        phone: existing.secondaryContact?.phone || "",
      },
    };
  });

  if (isEdit && !existing) {
    return (
      <section className="mt-4">
        <p className="text-muted mb-3">Client not found.</p>
        <Link to="/clients" className="btn btn-dark btn-sm">
          <i className="fas fa-arrow-left"></i> Back to Clients
        </Link>
      </section>
    );
  }

  function handleChange(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  function handleSecondaryChange(e) {
    setForm((f) => ({
      ...f,
      secondaryContact: { ...f.secondaryContact, [e.target.name]: e.target.value },
    }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.name || !form.email) return;

    if (isEdit) {
      updateClient(existing.id, form);
      navigate(`/clients/${existing.id}`);
    } else {
      const created = addClient(form);
      navigate(`/clients/${created.id}`);
    }
  }

  const backLabel = isEdit ? "Back to Profile" : "Back to Clients";
  const fallbackPath = isEdit ? `/clients/${existing.id}` : "/clients";
  const hasHistory = location.key !== "default";
  function handleBack() {
    if (hasHistory) navigate(-1);
    else navigate(fallbackPath);
  }

  return (
    <>
      <section>
        <div className="mt-4">
          <button
            type="button"
            onClick={handleBack}
            className="btn btn-link text-muted small text-decoration-none d-inline-flex align-items-center gap-1 mb-2 p-0"
          >
            <i className="fas fa-arrow-left"></i> {backLabel}
          </button>
          <PageHeader
            title={isEdit ? "Edit Client" : "Add Client"}
            description={isEdit ? `Update details for ${existing.name}.` : "Add a new client account."}
          />
        </div>
      </section>

      <hr className="my-3 opacity-25" />

      <section className="mb-3">
        <DataCard title="Client Details">
          <form className="card-body row" onSubmit={handleSubmit}>
            <div className="col-12 col-md-6">
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
            </div>
            <div className="col-12 col-md-6">
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
            </div>

            <div className="col-12 col-md-6">
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
            <div className="col-12 col-md-6">
              <FormField label="Phone">
                <input type="tel" className="form-control" name="phone" value={form.phone} onChange={handleChange} placeholder="+63 900 000 0000" />
              </FormField>
            </div>

            <div className="col-12 col-md-6">
              <FormField label="Industry">
                <select className="form-select" name="industry" value={form.industry} onChange={handleChange}>
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
            <div className="col-12 col-md-6">
              <FormField label="Status">
                <select className="form-select" name="status" value={form.status} onChange={handleChange}>
                  <option>Active</option>
                  <option>At Risk</option>
                  <option>Inactive</option>
                </select>
              </FormField>
            </div>

            <div className="col-12 col-md-6">
              <FormField label="Client Since">
                <input
                  type="text"
                  className="form-control"
                  name="clientSince"
                  value={form.clientSince}
                  onChange={handleChange}
                  placeholder="e.g. Feb 10, 2022"
                />
              </FormField>
            </div>
            <div className="col-12 col-md-6">
              <FormField label="Address">
                <input
                  type="text"
                  className="form-control"
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  placeholder="Street, City, Province"
                />
              </FormField>
            </div>

            <div className="col-12">
              <hr className="my-2" />
              <div className="text-uppercase text-muted fw-semibold mb-3" style={{ fontSize: 11, letterSpacing: 0.5 }}>
                Secondary Contact
              </div>
            </div>

            <div className="col-12 col-md-4">
              <FormField label="Contact Name">
                <input
                  type="text"
                  className="form-control"
                  name="name"
                  value={form.secondaryContact.name}
                  onChange={handleSecondaryChange}
                  placeholder="e.g. Liza Fernandez"
                />
              </FormField>
            </div>
            <div className="col-12 col-md-4">
              <FormField label="Role">
                <input
                  type="text"
                  className="form-control"
                  name="role"
                  value={form.secondaryContact.role}
                  onChange={handleSecondaryChange}
                  placeholder="e.g. Finance Manager"
                />
              </FormField>
            </div>
            <div className="col-12 col-md-4">
              <FormField label="Contact Phone">
                <input
                  type="tel"
                  className="form-control"
                  name="phone"
                  value={form.secondaryContact.phone}
                  onChange={handleSecondaryChange}
                  placeholder="+63 900 000 0000"
                />
              </FormField>
            </div>

            <div className="col-12 d-flex gap-2">
              <BtnPrimary type="submit">
                <i className="fas fa-floppy-disk"></i> {isEdit ? "Save Changes" : "Add Client"}
              </BtnPrimary>
              <button type="button" onClick={handleBack} className="btn btn-outline-secondary btn-sm d-inline-flex align-items-center gap-2">
                Cancel
              </button>
            </div>
          </form>
        </DataCard>
      </section>
    </>
  );
}
