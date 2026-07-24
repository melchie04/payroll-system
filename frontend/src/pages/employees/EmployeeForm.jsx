import { useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { DataCard, BtnPrimary, FormField, PageHeader } from "../../components/ui/index.jsx";
import { useEmployees } from "../../context/EmployeesContext.jsx";
import { clientNames } from "../../assets/data/index.js";

const emptyForm = {
  name: "",
  code: "",
  aliases: "",
  client: "Acme Corp",
  position: "",
  email: "",
  phone: "",
  rate: "",
  status: "Active",
  dateHired: "",
  assignmentStart: "",
  assignmentEnd: "",
  address: "",
  schedule: { in: "", out: "" },
  emergencyContact: { name: "", relationship: "", phone: "" },
};

// EmployeeForm — add/edit employee form shared by /employees/new and /employees/:id/edit.
export default function EmployeeForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { employees, getEmployeeById, addEmployee, updateEmployee } = useEmployees();

  const isEdit = Boolean(id);
  const existing = isEdit ? getEmployeeById(id) : null;

  const [form, setForm] = useState(() => {
    if (!isEdit) return emptyForm;
    if (!existing) return emptyForm;
    return {
      name: existing.name,
      code: existing.code || "",
      aliases: (existing.aliases || []).join(", "),
      client: existing.client,
      position: existing.position,
      email: existing.email,
      phone: existing.phone || "",
      rate: String(existing.rate || "").replace(/^₱/, ""),
      status: existing.status,
      dateHired: existing.dateHired || "",
      assignmentStart: existing.assignmentStart || "",
      assignmentEnd: existing.assignmentEnd || "",
      address: existing.address || "",
      schedule: { in: existing.schedule?.in || "", out: existing.schedule?.out || "" },
      emergencyContact: {
        name: existing.emergencyContact?.name || "",
        relationship: existing.emergencyContact?.relationship || "",
        phone: existing.emergencyContact?.phone || "",
      },
    };
  });

  const [errors, setErrors] = useState({});

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
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    setErrors((prev) => (prev[name] ? { ...prev, [name]: "" } : prev));
  }

  function handleEmergencyChange(e) {
    setForm((f) => ({
      ...f,
      emergencyContact: { ...f.emergencyContact, [e.target.name]: e.target.value },
    }));
  }

  function handleScheduleChange(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, schedule: { ...f.schedule, [name]: value } }));
    const key = name === "in" ? "scheduleIn" : "scheduleOut";
    setErrors((prev) => (prev[key] ? { ...prev, [key]: "" } : prev));
  }

  // code and schedule are validated because the timesheet resolves sheets by code and
  // measures Late against the schedule; a blank or reused one breaks that link silently.
  function validate(f) {
    const found = {};
    if (!f.name.trim()) found.name = "Full name is required.";
    const code = f.code.trim();
    if (!code) found.code = "Employee code is required.";
    else if (employees.some((e) => String(e.id) !== String(existing?.id) && (e.code || "").trim().toLowerCase() === code.toLowerCase()))
      found.code = "Another employee already uses this code.";
    if (!f.position.trim()) found.position = "Position is required.";
    if (!f.email.trim()) found.email = "Email is required.";
    if (!String(f.rate).trim()) found.rate = "Rate is required.";
    if (!f.schedule.in) found.scheduleIn = "Schedule in is required.";
    if (!f.schedule.out) found.scheduleOut = "Schedule out is required.";
    return found;
  }

  function handleSubmit(e) {
    e.preventDefault();
    const found = validate(form);
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    const payload = {
      ...form,
      // an open-ended assignment is stored as null rather than an empty string
      assignmentEnd: form.assignmentEnd || null,
      name: form.name.trim(),
      code: form.code.trim(),
      position: form.position.trim(),
      email: form.email.trim(),
      rate: form.rate.startsWith("₱") ? form.rate : `₱${form.rate}`,
      aliases: form.aliases.split(",").map((a) => a.trim()).filter(Boolean),
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
        <div className="mt-4 d-flex align-items-start gap-2">
          <button type="button" onClick={handleBack} className="nav-icon-btn flex-shrink-0" style={{ marginTop: -6 }} aria-label={backLabel} title={backLabel}>
            <i className="fas fa-arrow-left"></i>
          </button>
          <div className="flex-grow-1">
            <PageHeader
              title={isEdit ? "Edit Employee" : "Add Employee"}
              description={isEdit ? `Update details for ${existing.name}.` : "Add a new employee to your roster."}
            />
          </div>
        </div>
      </section>

      <hr className="my-3 opacity-25" />

      <form onSubmit={handleSubmit}>
        <section className="mb-3">
          <DataCard title="Personal Details">
            <div className="card-body row g-3">
              <div className="col-12 col-md-6">
                <FormField label="Full Name">
                  <input
                    type="text"
                    className={`form-control ${errors.name ? "is-invalid" : ""}`}
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="e.g. Juan Dela Cruz"
                    required
                  />
                  {errors.name && <div className="invalid-feedback d-block">{errors.name}</div>}
                </FormField>
              </div>
              <div className="col-12 col-md-6">
                <FormField label="Employee Code">
                  <input
                    type="text"
                    className={`form-control ${errors.code ? "is-invalid" : ""}`}
                    name="code"
                    value={form.code}
                    onChange={handleChange}
                    placeholder="e.g. EMP-001"
                    required
                  />
                  {errors.code && <div className="invalid-feedback d-block">{errors.code}</div>}
                </FormField>
              </div>
              <div className="col-12 col-md-6">
                <FormField label="Email">
                  <input
                    type="email"
                    className={`form-control ${errors.email ? "is-invalid" : ""}`}
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="name@company.com"
                    required
                  />
                  {errors.email && <div className="invalid-feedback d-block">{errors.email}</div>}
                </FormField>
              </div>
              <div className="col-12 col-md-6">
                <FormField label="Phone">
                  <input type="tel" className="form-control" name="phone" value={form.phone} onChange={handleChange} placeholder="+63 900 000 0000" />
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
                <FormField label="Known Aliases">
                  <input
                    type="text"
                    className="form-control"
                    name="aliases"
                    value={form.aliases}
                    onChange={handleChange}
                    placeholder="Other names on scanned sheets, comma-separated — e.g. J. Doe, Doe John"
                  />
                </FormField>
              </div>
            </div>
          </DataCard>
        </section>

        <section className="mb-3">
          <DataCard title="Employment">
            <div className="card-body row g-3">
              <div className="col-12 col-md-6">
                <FormField label="Client">
                  <select className="form-select" name="client" value={form.client} onChange={handleChange}>
                    {clientNames.map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                </FormField>
              </div>
              <div className="col-12 col-md-6">
                <FormField label="Position">
                  <input
                    type="text"
                    className={`form-control ${errors.position ? "is-invalid" : ""}`}
                    name="position"
                    value={form.position}
                    onChange={handleChange}
                    placeholder="e.g. Developer"
                    required
                  />
                  {errors.position && <div className="invalid-feedback d-block">{errors.position}</div>}
                </FormField>
              </div>
              <div className="col-12 col-md-6">
                <FormField label="Status">
                  <select className="form-select" name="status" value={form.status} onChange={handleChange}>
                    <option>Active</option>
                    <option>On Leave</option>
                    <option>Inactive</option>
                  </select>
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
              <div className="col-12 col-md-6">
                <FormField label="Rate (₱/hr)">
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    className={`form-control ${errors.rate ? "is-invalid" : ""}`}
                    name="rate"
                    value={form.rate}
                    onChange={handleChange}
                    placeholder="0.00"
                    required
                  />
                  {errors.rate && <div className="invalid-feedback d-block">{errors.rate}</div>}
                </FormField>
              </div>
            </div>
          </DataCard>
        </section>

        <section className="mb-3">
          <DataCard title="Schedule & Assignment">
            <div className="card-body row g-3">
              <div className="col-12 col-md-6">
                <FormField label="Schedule In">
                  <input
                    type="time"
                    className={`form-control ${errors.scheduleIn ? "is-invalid" : ""}`}
                    name="in"
                    value={form.schedule.in}
                    onChange={handleScheduleChange}
                    required
                  />
                  {errors.scheduleIn && <div className="invalid-feedback d-block">{errors.scheduleIn}</div>}
                </FormField>
              </div>
              <div className="col-12 col-md-6">
                <FormField label="Schedule Out">
                  <input
                    type="time"
                    className={`form-control ${errors.scheduleOut ? "is-invalid" : ""}`}
                    name="out"
                    value={form.schedule.out}
                    onChange={handleScheduleChange}
                    required
                  />
                  {errors.scheduleOut && <div className="invalid-feedback d-block">{errors.scheduleOut}</div>}
                </FormField>
              </div>
              <div className="col-12 col-md-6">
                <FormField label="Assignment Start">
                  <input type="date" className="form-control" name="assignmentStart" value={form.assignmentStart} onChange={handleChange} />
                </FormField>
              </div>
              <div className="col-12 col-md-6">
                <FormField label="Assignment End">
                  <input type="date" className="form-control" name="assignmentEnd" value={form.assignmentEnd} onChange={handleChange} />
                </FormField>
                <div className="text-muted" style={{ fontSize: 11.5 }}>
                  Leave blank while the assignment is open-ended.
                </div>
              </div>
            </div>
          </DataCard>
        </section>

        <section className="mb-3">
          <DataCard title="Emergency Contact">
            <div className="card-body row g-3">
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
            </div>
          </DataCard>
        </section>

        <section className="mb-3">
          <div className="d-flex gap-2">
            <BtnPrimary type="submit">
              <i className="fas fa-floppy-disk"></i> {isEdit ? "Save Changes" : "Add Employee"}
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
