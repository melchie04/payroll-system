import { useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router";
import { DataCard, BtnPrimary, FormField, PageHeader } from "../../components/ui/index.jsx";
import { useClients } from "../../context/ClientsContext.jsx";
import { useActivity } from "../../context/ActivityContext.jsx";

const emptyForm = {
  name: "",
  code: "",
  contact: "",
  email: "",
  phone: "",
  industry: "Technology",
  status: "Active",
  clientSince: "",
  address: "",
  requiresClientSignature: true,
  approvingRep: "",
  approvedFormCodes: [],
  uploadInstructions: "",
  billingRate: "",
  overtimeMultiplier: "",
  nightDiffMultiplier: "",
  sites: [],
  contractStart: "",
  contractEnd: "",
  rateEffectiveDate: "",
  secondaryContact: { name: "", role: "", phone: "" },
};

// ClientForm — add/edit client form shared by /clients/new and /clients/:id/edit.
export default function ClientForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { clients, getClientById, addClient, updateClient } = useClients();
  const { logActivity } = useActivity();

  const isEdit = Boolean(id);
  const existing = isEdit ? getClientById(id) : null;

  const [form, setForm] = useState(() => {
    if (!isEdit) return emptyForm;
    if (!existing) return emptyForm;
    return {
      name: existing.name,
      code: existing.code || "",
      contact: existing.contact,
      email: existing.email,
      phone: existing.phone || "",
      industry: existing.industry,
      status: existing.status,
      clientSince: existing.clientSince || "",
      address: existing.address || "",
      requiresClientSignature: existing.requiresClientSignature !== false,
      approvingRep: existing.approvingRep || "",
      approvedFormCodes: existing.approvedFormCodes || [],
      uploadInstructions: existing.uploadInstructions || "",
      billingRate: existing.billingRate || "",
      overtimeMultiplier: existing.overtimeMultiplier ?? "",
      nightDiffMultiplier: existing.nightDiffMultiplier ?? "",
      sites: existing.sites || [],
      contractStart: existing.contractStart || "",
      contractEnd: existing.contractEnd || "",
      rateEffectiveDate: existing.rateEffectiveDate || "",
      secondaryContact: {
        name: existing.secondaryContact?.name || "",
        role: existing.secondaryContact?.role || "",
        phone: existing.secondaryContact?.phone || "",
      },
    };
  });

  const [errors, setErrors] = useState({});

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

  function handleFormCodes(e) {
    const list = e.target.value
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    setForm((f) => ({ ...f, approvedFormCodes: list }));
  }

  function handleSites(e) {
    const list = e.target.value
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    setForm((f) => ({ ...f, sites: list }));
  }

  function handleNumber(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value === "" ? "" : Number(e.target.value) }));
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

    const code = form.code.trim();
    const found = {};
    if (!code) found.code = "Client code is required.";
    else if (clients.some((c) => String(c.id) !== String(existing?.id) && (c.code || "").trim().toLowerCase() === code.toLowerCase()))
      found.code = "Another client already uses this code.";
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    if (isEdit) {
      updateClient(existing.id, form);
      logActivity({ action: "Updated client", detail: `Updated ${form.name} (${code})`, module: "Clients" });
      navigate(`/clients/${existing.id}`);
    } else {
      const created = addClient(form);
      logActivity({ action: "Added client", detail: `Added ${form.name} (${code})`, module: "Clients" });
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
        <div className="mt-4 d-flex align-items-start gap-2">
          <button
            type="button"
            onClick={handleBack}
            className="nav-icon-btn flex-shrink-0"
            style={{ marginTop: -6 }}
            aria-label={backLabel}
            title={backLabel}
          >
            <i className="fas fa-arrow-left"></i>
          </button>
          <div className="flex-grow-1">
            <PageHeader
              title={isEdit ? "Edit Client" : "Add Client"}
              description={isEdit ? `Update details for ${existing.name}.` : "Add a new client account."}
            />
          </div>
        </div>
      </section>

      <hr className="my-3 opacity-25" />

      <form onSubmit={handleSubmit}>
        <section className="mb-3">
          <DataCard title="Client Details">
            <div className="card-body row g-3">
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
                <FormField label="Client Code">
                  <input
                    type="text"
                    className={`form-control ${errors.code ? "is-invalid" : ""}`}
                    name="code"
                    value={form.code}
                    onChange={handleChange}
                    placeholder="e.g. CLI-001"
                    required
                  />
                  {errors.code && <div className="invalid-feedback d-block">{errors.code}</div>}
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
            </div>
          </DataCard>
        </section>

        <section className="mb-3">
          <DataCard title="Timesheet Settings">
            <div className="card-body row g-3">
              <div className="col-12 col-md-6">
                <FormField label="Approving Representative">
                  <input
                    type="text"
                    className="form-control"
                    name="approvingRep"
                    value={form.approvingRep}
                    onChange={handleChange}
                    placeholder="Who signs the client box, e.g. Robert Cruz"
                  />
                </FormField>
              </div>
              <div className="col-12 col-md-6">
                <FormField label="Approved Form Codes">
                  <input
                    type="text"
                    className="form-control"
                    name="approvedFormCodes"
                    value={form.approvedFormCodes.join(", ")}
                    onChange={handleFormCodes}
                    placeholder="Comma-separated, e.g. SSI.17-014, SSI.17-015"
                  />
                </FormField>
              </div>
              <div className="col-12">
                <FormField label="Upload Instructions">
                  <textarea
                    className="form-control"
                    name="uploadInstructions"
                    value={form.uploadInstructions}
                    onChange={handleChange}
                    rows={2}
                    placeholder="Shown on the upload screen when this client is selected"
                  />
                </FormField>
              </div>
              <div className="col-12">
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="requiresClientSignature"
                    checked={form.requiresClientSignature}
                    onChange={(e) => setForm((f) => ({ ...f, requiresClientSignature: e.target.checked }))}
                  />
                  <label className="form-check-label" htmlFor="requiresClientSignature">
                    This client signs timesheets (flag sheets missing the client signature)
                  </label>
                </div>
              </div>
            </div>
          </DataCard>
        </section>

        <section className="mb-3">
          <DataCard title="Billing & Contract">
            <div className="card-body row g-3">
              <div className="col-12 col-md-6">
                <FormField label="Billing Rate (charged to client)">
                  <input
                    type="text"
                    className="form-control"
                    name="billingRate"
                    value={form.billingRate}
                    onChange={handleChange}
                    placeholder="e.g. ₱1,100.00"
                  />
                </FormField>
              </div>
              <div className="col-6 col-md-3">
                <FormField label="Overtime ×">
                  <input
                    type="number"
                    step="0.01"
                    className="form-control"
                    name="overtimeMultiplier"
                    value={form.overtimeMultiplier}
                    onChange={handleNumber}
                    placeholder="1.25"
                  />
                </FormField>
              </div>
              <div className="col-6 col-md-3">
                <FormField label="Night Diff ×">
                  <input
                    type="number"
                    step="0.01"
                    className="form-control"
                    name="nightDiffMultiplier"
                    value={form.nightDiffMultiplier}
                    onChange={handleNumber}
                    placeholder="1.10"
                  />
                </FormField>
              </div>
              <div className="col-12">
                <FormField label="Sites / Locations">
                  <input
                    type="text"
                    className="form-control"
                    name="sites"
                    value={form.sites.join(", ")}
                    onChange={handleSites}
                    placeholder="Comma-separated, e.g. Makati Office, Parañaque Plant"
                  />
                </FormField>
              </div>
              <div className="col-12 col-md-4">
                <FormField label="Contract Start">
                  <input
                    type="text"
                    className="form-control"
                    name="contractStart"
                    value={form.contractStart}
                    onChange={handleChange}
                    placeholder="e.g. Feb 10, 2022"
                  />
                </FormField>
              </div>
              <div className="col-12 col-md-4">
                <FormField label="Contract End">
                  <input
                    type="text"
                    className="form-control"
                    name="contractEnd"
                    value={form.contractEnd}
                    onChange={handleChange}
                    placeholder="e.g. Feb 9, 2025"
                  />
                </FormField>
              </div>
              <div className="col-12 col-md-4">
                <FormField label="Rate Effective Date">
                  <input
                    type="text"
                    className="form-control"
                    name="rateEffectiveDate"
                    value={form.rateEffectiveDate}
                    onChange={handleChange}
                    placeholder="e.g. Jan 1, 2024"
                  />
                </FormField>
              </div>
            </div>
          </DataCard>
        </section>

        <section className="mb-3">
          <DataCard title="Secondary Contact">
            <div className="card-body row g-3">
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
            </div>
          </DataCard>
        </section>

        <section className="mb-3">
          <div className="d-flex gap-2">
            <BtnPrimary type="submit">
              <i className="fas fa-floppy-disk"></i> {isEdit ? "Save Changes" : "Add Client"}
            </BtnPrimary>
            <button type="button" onClick={handleBack} className="btn btn-outline-secondary btn-sm d-inline-flex align-items-center gap-2">
              Cancel
            </button>
          </div>
        </section>
      </form>
    </>
  );
}
