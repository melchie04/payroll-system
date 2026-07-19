import { useState } from "react";
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
  PageHeader,
  TabsNav,
} from "../../components/ui/index.jsx";
import { invoices } from "../../assets/data/index.js";
import { useClients } from "../../context/ClientsContext.jsx";
import { useEmployees } from "../../context/EmployeesContext.jsx";

const fileIcons = { pdf: "📕", img: "🖼️" };

const TABS = [
  { key: "overview", label: "Overview", icon: "fa-id-card" },
  { key: "billing", label: "Billing History", icon: "fa-file-invoice-dollar" },
  { key: "employees", label: "Assigned Employees", icon: "fa-users" },
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

// ClientProfile — client detail page with Overview, Billing History, Assigned Employees, and Documents tabs.
export default function ClientProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [tab, setTab] = useState("overview");

  const { getClientById, getDocumentsByClient, addDocument, deleteDocument } = useClients();
  const { employees: allEmployees } = useEmployees();

  const client = getClientById(id);

  const clientInvoices = invoices.filter((inv) => inv.client === client?.name);
  const assignedEmployees = allEmployees.filter((emp) => emp.client === client?.name);
  const documents = client ? getDocumentsByClient(client.id) : [];

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
    addDocument(client.id, { name: docName, type: docType, uploaded });
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

  const hasHistory = location.key !== "default";
  function handleBack() {
    if (hasHistory) navigate(-1);
    else navigate("/clients");
  }

  if (!client) {
    return (
      <section className="mt-4">
        <p className="text-muted mb-3">Client not found.</p>
        <Link to="/clients" className="btn btn-dark btn-sm">
          <i className="fas fa-arrow-left"></i> Back to Clients
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
            title={client.name}
            description={`${client.industry} · Client since ${client.clientSince || "—"}`}
            actions={
              <Link to={`/clients/${client.id}/edit`} className="btn btn-dark btn-sm d-inline-flex align-items-center gap-2">
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
              <DataCard title="Client Details">
                <div className="card-body">
                  <ProfileHeader
                    name={client.name}
                    subtitle={`${client.industry} · ${client.employees} employees deployed`}
                    subtitleIcon="fa-industry"
                    status={client.status}
                  />
                  <DetailList>
                    <DetailRow icon="fa-user" label="Contact Person">
                      {client.contact}
                    </DetailRow>
                    <DetailRow icon="fa-toggle-on" label="Status">
                      <Badge status={client.status} />
                    </DetailRow>
                    <DetailRow icon="fa-envelope" label="Email">
                      {client.email}
                    </DetailRow>
                    <DetailRow icon="fa-phone" label="Phone">
                      {client.phone}
                    </DetailRow>
                    <DetailRow icon="fa-calendar-day" label="Client Since">
                      {client.clientSince}
                    </DetailRow>
                    <DetailRow icon="fa-file-invoice-dollar" label="Billing">
                      {client.billing}
                    </DetailRow>
                    <DetailRow icon="fa-location-dot" label="Address">
                      {client.address}
                    </DetailRow>
                  </DetailList>
                </div>
              </DataCard>
            </div>

            <div className="col-12 col-lg-5">
              <DataCard title="Secondary Contact">
                <div className="card-body">
                  <DetailList>
                    <DetailRow icon="fa-user" label="Name">
                      {client.secondaryContact.name}
                    </DetailRow>
                    <DetailRow icon="fa-id-badge" label="Role">
                      {client.secondaryContact.role}
                    </DetailRow>
                    <DetailRow icon="fa-phone" label="Phone">
                      {client.secondaryContact.phone}
                    </DetailRow>
                  </DetailList>
                </div>
              </DataCard>
            </div>
          </div>
        </section>
      )}

      {tab === "billing" && (
        <section className="mb-3">
          <DataCard>
            {clientInvoices.length === 0 ? (
              <div className="text-center text-muted py-5 small">No invoices on record yet.</div>
            ) : (
              <>
                <Table headers={["Invoice #", "Invoice Date", "Due Date", "Amount", "Status"]} itemLabel="invoices">
                  {clientInvoices.map((inv) => (
                    <Tr key={inv.id}>
                      <Td bold>{inv.id}</Td>
                      <Td>{inv.invoiceDate}</Td>
                      <Td>{inv.dueDate}</Td>
                      <Td>{inv.amount}</Td>
                      <Td>
                        <Badge status={inv.status} />
                      </Td>
                    </Tr>
                  ))}
                </Table>
              </>
            )}
          </DataCard>
        </section>
      )}

      {tab === "employees" && (
        <section className="mb-3">
          <DataCard>
            {assignedEmployees.length === 0 ? (
              <div className="text-center text-muted py-5 small">No employees currently assigned to this client.</div>
            ) : (
              <>
                <Table headers={["Name", "Position", "Email", "Rate (₱/hr)", "Status"]} itemLabel="employees">
                  {assignedEmployees.map((emp) => (
                    <Tr key={emp.id}>
                      <Td bold>
                        <Link to={`/employees/${emp.id}`} className="text-decoration-none">
                          {emp.name}
                        </Link>
                      </Td>
                      <Td>{emp.position}</Td>
                      <Td>{emp.email}</Td>
                      <Td>{emp.rate}</Td>
                      <Td>
                        <Badge status={emp.status} />
                      </Td>
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
          <input type="file" id="client-document-file-input" className="d-none" accept=".pdf,.jpg,.jpeg,.png" onChange={handleFileInputChange} />

          {!docFile ? (
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => document.getElementById("client-document-file-input").click()}
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
              placeholder="e.g. Master Service Agreement.pdf"
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
    </>
  );
}
