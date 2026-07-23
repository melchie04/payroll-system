import { useMemo, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import {
  DataCard,
  Table,
  Tr,
  Td,
  Badge,
  BtnPrimary,
  BtnSecondary,
  IconBtn,
  Modal,
  FormField,
  DetailList,
  DetailRow,
  ProfileHeader,
  PayslipDetails,
  PageHeader,
  TabsNav,
} from "../../components/ui/index.jsx";
import { payslipHistory } from "../../assets/data/index.js";
import { useEmployees } from "../../context/EmployeesContext.jsx";
import { useTimesheets, resolveEmployee, sheetTotals, parsePeriodLabel } from "../../context/TimesheetContext.jsx";
import { formatCurrency } from "../../utils/currency.js";
import { computeDeductions } from "../../utils/payslip.js";

const fileIcons = { pdf: "📕", img: "🖼️" };

const TABS = [
  { key: "overview", label: "Overview", icon: "fa-id-card" },
  { key: "payslips", label: "Payslip History", icon: "fa-file-invoice-dollar" },
  { key: "timesheets", label: "Timesheet History", icon: "fa-file-import" },
  { key: "documents", label: "Documents", icon: "fa-folder-open" },
];

function inferDocType(filename) {
  const ext = filename.split(".").pop().toLowerCase();
  return ["jpg", "jpeg", "png", "gif", "webp"].includes(ext) ? "img" : "pdf";
}

function formatFileSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// EmployeeProfile — employee detail page with Overview, Payslip History, Timesheet History, and Documents tabs.
export default function EmployeeProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [tab, setTab] = useState("overview");

  const { employees, getEmployeeById, getDocumentsByEmployee, addDocument, deleteDocument } = useEmployees();
  const { files } = useTimesheets();

  const employee = getEmployeeById(id);

  const payslips = payslipHistory.filter((p) => p.employeeId === employee?.id);
  // Reads the same live sheets as the Timesheet page, matched on the stable roster link,
  // so an upload appears here without keeping a second copy of the history.
  const timesheets = useMemo(() => {
    if (!employee) return [];
    return files
      .filter((f) => resolveEmployee(f.employee, employees)?.id === employee.id)
      .map((f) => {
        const totals = sheetTotals(f.rows);
        return {
          id: f.id,
          period: f.period?.label || "—",
          hoursLogged: Math.round((totals.regular + totals.overtime) * 10) / 10,
          status: f.status,
          submitted: f.uploaded || "—",
        };
      })
      .sort((a, b) => (parsePeriodLabel(b.period)?.from || 0) - (parsePeriodLabel(a.period)?.from || 0));
  }, [files, employees, employee]);
  const documents = employee ? getDocumentsByEmployee(employee.id) : [];

  const [docFile, setDocFile] = useState(null);
  const [docName, setDocName] = useState("");
  const [docType, setDocType] = useState("pdf");
  const [dragOver, setDragOver] = useState(false);

  function resetUploadForm() {
    setDocFile(null);
    setDocName("");
    setDocType("pdf");
    setDragOver(false);
  }

  function pickFile(file) {
    if (!file) return;
    setDocFile(file);
    setDocName(file.name);
    setDocType(inferDocType(file.name));
  }

  function handleFileInputChange(e) {
    pickFile(e.target.files?.[0]);
  }

  function handleDrop(e) {
    e.preventDefault();
    setDragOver(false);
    pickFile(e.dataTransfer.files?.[0]);
  }

  function handleUploadDocument(e) {
    e.preventDefault();
    if (!docFile || !docName) return;
    const uploaded = new Date().toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
    addDocument(employee.id, { name: docName, type: docType, uploaded });
    resetUploadForm();
    document.getElementById("uploadDocumentModalClose")?.click();
  }

  const [deleteDocTarget, setDeleteDocTarget] = useState(null);

  function confirmDeleteDocument() {
    if (deleteDocTarget) {
      deleteDocument(deleteDocTarget.id);
      setDeleteDocTarget(null);
    }
    document.getElementById("deleteDocumentModalClose")?.click();
  }

  const [payslipTarget, setPayslipTarget] = useState(null);

  const hasHistory = location.key !== "default";
  function handleBack() {
    if (hasHistory) navigate(-1);
    else navigate("/employees");
  }

  if (!employee) {
    return (
      <section className="mt-4">
        <p className="text-muted mb-3">Employee not found.</p>
        <Link to="/employees" className="btn btn-dark btn-sm">
          <i className="fas fa-arrow-left"></i> Back to Employees
        </Link>
      </section>
    );
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
            <i className="fas fa-arrow-left"></i> Back
          </button>
          <PageHeader
            title={employee.name}
            description={`${employee.position} · ${employee.client}`}
            actions={
              <Link to={`/employees/${employee.id}/edit`} className="btn btn-dark btn-sm d-inline-flex align-items-center gap-2">
                <i className="fas fa-pen"></i> Edit
              </Link>
            }
          />
        </div>
      </section>

      <hr className="my-3 opacity-25" />

      <section>
        <TabsNav tabs={TABS} active={tab} onChange={setTab} />
      </section>

      {tab === "overview" && (
        <section className="mb-3">
          <div className="row g-3">
            <div className="col-12 col-lg-7">
              <DataCard title="Employment Details">
                <div className="card-body">
                  <ProfileHeader
                    name={employee.name}
                    subtitle={`${employee.position} at ${employee.client}`}
                    subtitleIcon="fa-briefcase"
                    status={employee.status}
                  />
                  <DetailList>
                    <DetailRow icon="fa-hashtag" label="Employee Code">
                      {employee.code || "—"}
                    </DetailRow>
                    <DetailRow icon="fa-tags" label="Also Known As">
                      {(employee.aliases || []).length ? employee.aliases.join(", ") : "—"}
                    </DetailRow>
                    <DetailRow icon="fa-building" label="Client">
                      {employee.client}
                    </DetailRow>
                    <DetailRow icon="fa-toggle-on" label="Status">
                      <Badge status={employee.status} />
                    </DetailRow>
                    <DetailRow icon="fa-envelope" label="Email">
                      {employee.email}
                    </DetailRow>
                    <DetailRow icon="fa-phone" label="Phone">
                      {employee.phone}
                    </DetailRow>
                    <DetailRow icon="fa-sack-dollar" label="Rate">
                      {employee.rate} / hr
                    </DetailRow>
                    <DetailRow icon="fa-calendar-day" label="Date Hired">
                      {employee.dateHired}
                    </DetailRow>
                    <DetailRow icon="fa-user-clock" label="Assignment">
                      {employee.assignmentStart
                        ? `${employee.assignmentStart} → ${employee.assignmentEnd || "open-ended"}`
                        : "—"}
                    </DetailRow>
                    <DetailRow icon="fa-clock" label="Schedule">
                      {employee.schedule?.in && employee.schedule?.out
                        ? `${employee.schedule.in} – ${employee.schedule.out}`
                        : "—"}
                    </DetailRow>
                    <DetailRow icon="fa-location-dot" label="Address">
                      {employee.address}
                    </DetailRow>
                  </DetailList>
                </div>
              </DataCard>
            </div>

            <div className="col-12 col-lg-5">
              <DataCard title="Emergency Contact">
                <div className="card-body">
                  <DetailList>
                    <DetailRow icon="fa-user" label="Name">
                      {employee.emergencyContact.name}
                    </DetailRow>
                    <DetailRow icon="fa-people-arrows" label="Relationship">
                      {employee.emergencyContact.relationship}
                    </DetailRow>
                    <DetailRow icon="fa-phone" label="Phone">
                      {employee.emergencyContact.phone}
                    </DetailRow>
                  </DetailList>
                </div>
              </DataCard>
            </div>
          </div>
        </section>
      )}

      {tab === "payslips" && (
        <section className="mb-3">
          <DataCard>
            {payslips.length === 0 ? (
              <div className="text-center text-muted py-5 small">No payslips on record yet.</div>
            ) : (
              <>
                <Table headers={["Payslip #", "Pay Period", "Gross Pay", "Net Pay", "Status", "Actions"]} itemLabel="payslips">
                  {payslips.map((p) => (
                    <Tr key={p.id}>
                      <Td bold>{p.id}</Td>
                      <Td>{p.period}</Td>
                      <Td>{p.grossPay}</Td>
                      <Td>{p.netPay}</Td>
                      <Td>
                        <Badge status={p.status} />
                      </Td>
                      <Td>
                        <IconBtn title="View Payslip" data-bs-toggle="modal" data-bs-target="#viewPayslipModal" onClick={() => setPayslipTarget(p)}>
                          <i className="fas fa-eye"></i>
                        </IconBtn>
                      </Td>
                    </Tr>
                  ))}
                </Table>
              </>
            )}
          </DataCard>
        </section>
      )}

      {tab === "timesheets" && (
        <section className="mb-3">
          <DataCard>
            {timesheets.length === 0 ? (
              <div className="text-center text-muted py-5 small">No timesheets on record yet.</div>
            ) : (
              <>
                <Table headers={["Pay Period", "Hours Logged", "Status", "Submitted"]} itemLabel="timesheets">
                  {timesheets.map((t) => (
                    <Tr key={t.id}>
                      <Td bold>
                        <Link to={`/timesheet/${t.id}`} className="text-decoration-none">
                          {t.period}
                        </Link>
                      </Td>
                      <Td>{t.hoursLogged}</Td>
                      <Td>
                        <Badge status={t.status} />
                      </Td>
                      <Td>{t.submitted}</Td>
                    </Tr>
                  ))}
                </Table>
              </>
            )}
          </DataCard>
        </section>
      )}

      {tab === "documents" && (
        <section className="mb-3">
          <DataCard
            title="Documents"
            action={
              <BtnPrimary data-bs-toggle="modal" data-bs-target="#uploadDocumentModal">
                <i className="fas fa-upload"></i> Upload Document
              </BtnPrimary>
            }
          >
            {documents.length === 0 ? (
              <div className="text-center text-muted py-5 small">No documents uploaded yet.</div>
            ) : (
              <div className="list-group list-group-flush">
                {documents.map((doc) => (
                  <div className="list-group-item d-flex align-items-center justify-content-between gap-3 py-3" key={doc.id}>
                    <div className="d-flex align-items-center gap-3">
                      <span style={{ fontSize: 22 }}>{fileIcons[doc.type]}</span>
                      <div>
                        <div className="small fw-semibold text-dark">{doc.name}</div>
                        <div className="text-muted" style={{ fontSize: 11.5 }}>
                          Uploaded on {doc.uploaded}
                        </div>
                      </div>
                    </div>
                    <div className="d-flex align-items-center gap-1">
                      <BtnSecondary>
                        <i className="fas fa-download"></i> Download
                      </BtnSecondary>
                      <IconBtn
                        title="Delete document"
                        data-bs-toggle="modal"
                        data-bs-target="#deleteDocumentModal"
                        onClick={() => setDeleteDocTarget(doc)}
                      >
                        <i className="fas fa-trash text-danger opacity-75"></i>
                      </IconBtn>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </DataCard>
        </section>
      )}

      <Modal
        id="uploadDocumentModal"
        title="Upload Document"
        footer={
          <>
            <BtnSecondary id="uploadDocumentModalClose" data-bs-dismiss="modal" onClick={resetUploadForm}>
              Cancel
            </BtnSecondary>
            <BtnPrimary type="submit" form="uploadDocumentForm" disabled={!docFile}>
              <i className="fas fa-upload"></i> Upload
            </BtnPrimary>
          </>
        }
      >
        <form id="uploadDocumentForm" onSubmit={handleUploadDocument}>
          <input type="file" id="document-file-input" className="d-none" accept=".pdf,.jpg,.jpeg,.png" onChange={handleFileInputChange} />

          {!docFile ? (
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => document.getElementById("document-file-input").click()}
              className={`text-center rounded-3 py-4 px-3 mb-3 ${dragOver ? "bg-light" : ""}`}
              style={{
                border: `2px dashed ${dragOver ? "#aaa" : "var(--bs-border-color)"}`,
                cursor: "pointer",
              }}
            >
              <div className="mb-2" style={{ fontSize: 28 }}>
                <i className="fas fa-cloud-arrow-up text-muted"></i>
              </div>
              <div className="small fw-medium mb-1">Drag and drop a file here, or click to browse</div>
              <div className="text-muted" style={{ fontSize: 11 }}>
                Supports: PDF, JPG, PNG
              </div>
            </div>
          ) : (
            <div className="d-flex align-items-center justify-content-between gap-3 border rounded-3 p-3 mb-3">
              <div className="d-flex align-items-center gap-3 min-w-0">
                <span style={{ fontSize: 22 }}>{docType === "img" ? "🖼️" : "📕"}</span>
                <div className="text-truncate">
                  <div className="small fw-semibold text-dark text-truncate">{docFile.name}</div>
                  <div className="text-muted" style={{ fontSize: 11.5 }}>
                    {formatFileSize(docFile.size)}
                  </div>
                </div>
              </div>
              <IconBtn title="Remove file" onClick={resetUploadForm}>
                <i className="fas fa-xmark"></i>
              </IconBtn>
            </div>
          )}

          <FormField label="Document Name">
            <input
              type="text"
              className="form-control"
              value={docName}
              onChange={(e) => setDocName(e.target.value)}
              placeholder="e.g. Employment Contract.pdf"
              required
            />
          </FormField>
          <FormField label="Type">
            <select className="form-select" value={docType} onChange={(e) => setDocType(e.target.value)}>
              <option value="pdf">PDF</option>
              <option value="img">Image</option>
            </select>
          </FormField>
        </form>
      </Modal>

      <Modal
        id="deleteDocumentModal"
        title="Delete Document"
        footer={
          <>
            <BtnSecondary id="deleteDocumentModalClose" data-bs-dismiss="modal">
              Cancel
            </BtnSecondary>
            <button type="button" className="btn btn-danger btn-sm" onClick={confirmDeleteDocument}>
              <i className="fas fa-trash"></i> Delete
            </button>
          </>
        }
      >
        <p className="mb-0">
          Are you sure you want to delete <strong>{deleteDocTarget?.name}</strong>? This action cannot be undone.
        </p>
      </Modal>

      <Modal
        id="viewPayslipModal"
        title="Payslip"
        footer={
          <>
            <BtnSecondary data-bs-dismiss="modal">Close</BtnSecondary>
            <button type="button" className="btn btn-dark btn-sm" onClick={() => window.print()}>
              <i className="fas fa-file-pdf"></i> Download PDF
            </button>
          </>
        }
      >
        {payslipTarget &&
          (() => {
            const p = computeDeductions(payslipTarget.grossPay);
            return (
              <div className="print-area">
                <PayslipDetails
                  employeeName={employee.name}
                  subtitle={`${employee.position} · ${employee.client}`}
                  status={payslipTarget.status}
                  period={payslipTarget.period}
                  summaryRows={[{ icon: "fa-money-bill-wave", label: "Gross Pay", value: formatCurrency(p.gross) }]}
                  deductionRows={[
                    { icon: "fa-shield-halved", label: "SSS", value: formatCurrency(p.sss) },
                    { icon: "fa-briefcase-medical", label: "PhilHealth", value: formatCurrency(p.philhealth) },
                    { icon: "fa-house", label: "Pag-IBIG", value: formatCurrency(p.pagibig) },
                    { icon: "fa-receipt", label: "Withholding Tax", value: formatCurrency(p.tax) },
                  ]}
                  netPay={payslipTarget.netPay}
                />
              </div>
            );
          })()}
      </Modal>
    </>
  );
}
