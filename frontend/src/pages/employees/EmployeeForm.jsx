import { useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { DataCard, BtnPrimary, FormField, PageHeader } from "../../components/ui/index.jsx";
import { useEmployees } from "../../context/EmployeesContext.jsx";

const emptyForm = {
  name: "",
  client: "Acme Corp",
  position: "",
  email: "",
  phone: "",
  rate: "",
  status: "Active",
  dateHired: "",
  address: "",
  emergencyContact: { name: "", relationship: "", phone: "" },
};

// EmployeeForm — add/edit employee form shared by /employees/new and /employees/:id/edit.
export default function EmployeeForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { getEmployeeById, addEmployee, updateEmployee } = useEmployees();

  const isEdit = Boolean(id);
  const existing = isEdit ? getEmployeeById(id) : null;

  const [form, setForm] = useState(() => {
    if (!isEdit) return emptyForm;
    if (!existing) return emptyForm;
    return {
      name: existing.name,
      client: existing.client,
      position: existing.position,
      email: existing.email,
      phone: existing.phone || "",
      rate: String(existing.rate || "").replace(/^₱/, ""),
      status: existing.status,
      dateHired: existing.dateHired || "",
      address: existing.address || "",
      emergencyContact: {
        name: existing.emergencyContact?.name || "",
        relationship: existing.emergencyContact?.relationship || "",
        phone: existing.emergencyContact?.phone || "",
      },
    };
  });

  if (isEdit && !existing) {
    return (
      <section className="mt-4">
        <p className="text-muted mb-3">Employee not found.</p>
        <Link to="/employees" className="btn btn-dark btn-sm">
          <i className="fas fa-arrow-left"></i> Back to Employees
        </Link>
      </section>
    );
  }

  function handleChange(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  function handleEmergencyChange(e) {
    setForm((f) => ({
      ...f,
      emergencyContact: { ...f.emergencyContact, [e.target.name]: e.target.value },
    }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.name || !form.email) return;

    const payload = {
      ...form,
      rate: form.rate.startsWith("₱") ? form.rate : `₱${form.rate}`,
    };

    if (isEdit) {
      updateEmployee(existing.id, payload);
      navigate(`/employees/${existing.id}`);
    } else {
      const created = addEmployee(payload);
      navigate(`/employees/${created.id}`);
    }
  }

  const backLabel = isEdit ? "Back to Profile" : "Back to Employees";
  const fallbackPath = isEdit ? `/employees/${existing.id}` : "/employees";
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
            title={isEdit ? "Edit Employee" : "Add Employee"}
            description={isEdit ? `Update details for ${existing.name}.` : "Add a new employee to your roster."}
          />
        </div>
      </section>

      <hr className="my-3 opacity-25" />

      <section className="mb-3">
        <DataCard title="Employment Details">
          <form className="card-body row" onSubmit={handleSubmit}>
            <div className="col-12 col-md-6">
              <FormField label="Full Name">
                <input
                  type="text"
                  className="form-control"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="e.g. Juan Dela Cruz"
                  required
                />
              </FormField>
            </div>
            <div className="col-12 col-md-6">
              <FormField label="Client">
                <select className="form-select" name="client" value={form.client} onChange={handleChange}>
                  <option>Acme Corp</option>
                  <option>Globex Inc</option>
                  <option>Initech</option>
                  <option>Soylent Corp</option>
                </select>
              </FormField>
            </div>

            <div className="col-12 col-md-6">
              <FormField label="Position">
                <input
                  type="text"
                  className="form-control"
                  name="position"
                  value={form.position}
                  onChange={handleChange}
                  placeholder="e.g. Developer"
                  required
                />
              </FormField>
            </div>
            <div className="col-12 col-md-6">
              <FormField label="Status">
                <select className="form-select" name="status" value={form.status} onChange={handleChange}>
                  <option>Active</option>
                  <option>On Leave</option>
                </select>
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
              <FormField label="Rate (₱/hr)">
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  className="form-control"
                  name="rate"
                  value={form.rate}
                  onChange={handleChange}
                  placeholder="0.00"
                  required
                />
              </FormField>
            </div>
            <div className="col-12 col-md-6">
              <FormField label="Date Hired">
                <input
                  type="text"
                  className="form-control"
                  name="dateHired"
                  value={form.dateHired}
                  onChange={handleChange}
                  placeholder="e.g. Jan 15, 2023"
                />
              </FormField>
            </div>

            <div className="col-12">
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
                Emergency Contact
              </div>
            </div>

            <div className="col-12 col-md-4">
              <FormField label="Contact Name">
                <input
                  type="text"
                  className="form-control"
                  name="name"
                  value={form.emergencyContact.name}
                  onChange={handleEmergencyChange}
                  placeholder="e.g. Maria Dela Cruz"
                />
              </FormField>
            </div>
            <div className="col-12 col-md-4">
              <FormField label="Relationship">
                <input
                  type="text"
                  className="form-control"
                  name="relationship"
                  value={form.emergencyContact.relationship}
                  onChange={handleEmergencyChange}
                  placeholder="e.g. Spouse"
                />
              </FormField>
            </div>
            <div className="col-12 col-md-4">
              <FormField label="Contact Phone">
                <input
                  type="tel"
                  className="form-control"
                  name="phone"
                  value={form.emergencyContact.phone}
                  onChange={handleEmergencyChange}
                  placeholder="+63 900 000 0000"
                />
              </FormField>
            </div>

            <div className="col-12 d-flex gap-2">
              <BtnPrimary type="submit">
                <i className="fas fa-floppy-disk"></i> {isEdit ? "Save Changes" : "Add Employee"}
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
