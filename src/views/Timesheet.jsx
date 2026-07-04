import { useEffect, useRef, useState } from "react";
import { Modal as BsModal } from "bootstrap";
import {
  DataCard,
  Badge,
  BtnPrimary,
  BtnSecondary,
  FilterSelect,
  IconBtn,
  Modal,
  PageHeader,
} from "../components/ui/index.jsx";
import {
  uploadedFiles as initialFiles,
  extractionSummary,
} from "../data/index.js";

const fileIcons = { pdf: "📕", img: "🖼️" };
const statusActions = {
  Processing: { icon: "fa-xmark", label: "cancel this upload" },
  Extracted: { icon: "fa-eye", label: "view the extracted data for" },
  Failed: { icon: "fa-rotate-left", label: "retry the upload for" },
};

export default function Timesheet() {
  const [drag, setDrag] = useState(false);
  const [files, setFiles] = useState(initialFiles);
  const [target, setTarget] = useState(null); // file pending confirmation
  const modalInstance = useRef(null);

  useEffect(() => {
    modalInstance.current = new BsModal(
      document.getElementById("timesheetConfirmModal"),
    );
  }, []);

  function openConfirm(file) {
    setTarget(file);
    modalInstance.current?.show();
  }

  function handleConfirm() {
    if (!target) return;
    if (target.status === "Processing") {
      // Cancel: remove the file from the list
      setFiles((prev) => prev.filter((f) => f.id !== target.id));
    } else if (target.status === "Failed") {
      // Retry: flip it back to Processing
      setFiles((prev) =>
        prev.map((f) =>
          f.id === target.id ? { ...f, status: "Processing" } : f,
        ),
      );
    }
    // Extracted (view) has no state change — it's just informational.
    modalInstance.current?.hide();
    setTarget(null);
  }

  return (
    <>
      <input
        type="file"
        id="file-input"
        className="d-none"
        multiple
        accept=".pdf,.jpg,.png"
      />

      {/* ========================================================== */}
      {/* DIVISION 1: HEADER                                         */}
      {/* ========================================================== */}
      <section>
        <div className="mt-4">
          <PageHeader
            title="Timesheet Upload / OCR Scan"
            description="Upload timesheet documents and extract data using OCR."
            actions={
              <BtnPrimary
                onClick={() => document.getElementById("file-input").click()}
              >
                <i className="fas fa-upload"></i> Upload New
              </BtnPrimary>
            }
          />
        </div>
      </section>

      {/* LINE DIVIDER */}
      <hr className="my-3 opacity-25" />

      {/* ========================================================== */}
      {/* DIVISION 2: CONTROLS                                       */}
      {/* ========================================================== */}
      <section>
        <div className="row g-3 align-items-end mb-4">
          <div className="col-12 col-md-4">
            <FilterSelect label="Client">
              <option>Select Client</option>
              <option>Acme Corp</option>
              <option>Globex Inc</option>
            </FilterSelect>
          </div>
          <div className="col-12 col-md-4">
            <FilterSelect label="Employee">
              <option>Select Employee</option>
              <option>John Doe</option>
              <option>Jane Smith</option>
            </FilterSelect>
          </div>
          <div className="col-12 col-md-4">
            <FilterSelect label="Pay Period">
              <option>May 12 – May 25, 2024</option>
            </FilterSelect>
          </div>
        </div>
      </section>

      {/* LINE DIVIDER */}
      <hr className="my-3 opacity-25" />

      {/* ========================================================== */}
      {/* DIVISION 3: DATA CARDS                                     */}
      {/* ========================================================== */}
      <section className="mb-3">
        <div className="row g-3">
          <div className="col-lg-5">
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDrag(true);
              }}
              onDragLeave={() => setDrag(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDrag(false);
              }}
              onClick={() => document.getElementById("file-input").click()}
              className={`text-center rounded-3 py-5 px-3 ${drag ? "bg-light" : ""} h-100`}
              style={{
                border: `2px dashed ${drag ? "#aaa" : "var(--bs-border-color)"}`,
                cursor: "pointer",
              }}
            >
              <div className="mb-2" style={{ fontSize: 40 }}>
                <i className="fas fa-cloud-arrow-up text-muted"></i>
              </div>
              <div className="fw-medium mb-1">
                Drag and drop timesheet files here
              </div>
              <div className="text-muted small mb-3">or</div>
              <BtnSecondary
                onClick={(e) => {
                  // Stop the click from also bubbling to the dropzone div
                  // (which would otherwise try to open the dialog a second time),
                  // then open the native file browser ourselves.
                  e.stopPropagation();
                  document.getElementById("file-input").click();
                }}
              >
                Choose Files
              </BtnSecondary>
              <div className="text-muted mt-3" style={{ fontSize: 11 }}>
                Supports: PDF, JPG, PNG (Max size: 10MB)
              </div>
            </div>
            <div className="text-muted mt-3" style={{ fontSize: 11.5 }}>
              <i className="fas fa-lock"></i> Your files are secure and will
              only be used for data extraction.
            </div>
          </div>
          <div className="col-lg-7 d-flex flex-column gap-3">
            <DataCard title="Uploaded Files">
              <div className="list-group list-group-flush">
                {files.length === 0 && (
                  <div className="text-center text-muted py-4 small">
                    No files uploaded yet.
                  </div>
                )}
                {files.map((file) => (
                  <div
                    className="list-group-item d-flex align-items-start gap-3 py-2"
                    key={file.id}
                  >
                    <span
                      className="flex-shrink-0"
                      style={{ fontSize: 24, marginTop: "2px" }}
                    >
                      {fileIcons[file.type]}
                    </span>
                    <div className="d-flex flex-column flex-sm-row flex-grow-1 justify-content-sm-between align-items-sm-center gap-2 min-w-0 small">
                      <div className="text-truncate">
                        <div className="small fw-semibold text-dark text-wrap text-sm-truncate">
                          {file.name}
                        </div>
                        <div className="text-muted" style={{ fontSize: 11.5 }}>
                          Uploaded on {file.uploaded}
                        </div>
                      </div>
                      <div className="d-flex align-items-center gap-2 ms-sm-auto flex-shrink-0">
                        <Badge status={file.status} />
                        <IconBtn
                          title={statusActions[file.status]?.label}
                          onClick={() => openConfirm(file)}
                        >
                          <i
                            className={`fas ${statusActions[file.status]?.icon}`}
                          ></i>
                        </IconBtn>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </DataCard>
            <DataCard title="Extraction Summary (Last 7 Days)">
              <div className="card-body row g-2">
                {extractionSummary.map((s) => (
                  <div className="col-6 col-md-3" key={s.label}>
                    <div className="border rounded bg-light p-3 h-100 d-flex flex-column justify-content-between">
                      <div
                        className="text-muted fw-medium text-capitalize"
                        style={{ fontSize: 13 }}
                      >
                        {s.label.toLowerCase()}
                      </div>
                      <div
                        className="fs-3 fw-bold mt-auto"
                        style={{ color: s.color }}
                      >
                        {s.value}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </DataCard>
          </div>
        </div>
      </section>

      {/* ========================================================== */}
      {/* MODAL: CONFIRM FILE ACTION                                 */}
      {/* ========================================================== */}
      <Modal
        id="timesheetConfirmModal"
        title="Please Confirm"
        footer={
          <>
            <BtnSecondary data-bs-dismiss="modal">Cancel</BtnSecondary>
            <button
              type="button"
              className={`btn btn-sm ${target?.status === "Failed" ? "btn-dark" : "btn-danger"}`}
              onClick={handleConfirm}
            >
              Yes, Continue
            </button>
          </>
        }
      >
        <p className="mb-0">
          Are you sure you want to {statusActions[target?.status]?.label}{" "}
          <strong>{target?.name}</strong>?
        </p>
      </Modal>
    </>
  );
}
