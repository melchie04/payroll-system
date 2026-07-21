import { useState } from "react";
import { DataCard, BtnPrimary } from "../ui/index.jsx";

const REQUIREMENTS = [
  {
    icon: "fa-file-lines",
    tone: "text-secondary",
    title: "The standard STRON'L form",
    sub: "Days 1–15 or days 16–31 version",
    level: "Required",
  },
  {
    icon: "fa-user",
    tone: "text-secondary",
    title: "One employee per sheet",
    sub: "Do not combine people on one form",
    level: "Required",
  },
  {
    icon: "fa-calendar-days",
    tone: "text-secondary",
    title: "Period Covered, filled in and legible",
    sub: "Write the month and year in full",
    level: "Required",
  },
  {
    icon: "fa-signature",
    tone: "text-secondary",
    title: "Employee and supervisor signatures",
    sub: "Client signature where applicable",
    level: "Required",
  },
  {
    icon: "fa-file-pdf",
    tone: "text-danger",
    title: "Scanned PDF from 300 DPI",
    sub: "Photos accepted from 1600px on the long edge",
    level: "Preferred",
  },
  {
    icon: "fa-triangle-exclamation",
    tone: "text-warning",
    title: "No glare, folds or cropped edges",
    sub: "The whole grid must be visible and flat",
    level: "Avoid",
  },
];

// TimesheetUpload — the dropzone, what a good file looks like, and recent throughput.
export function TimesheetUpload({ summary }) {
  const [drag, setDrag] = useState(false);

  function openPicker() {
    document.getElementById("timesheet-file-input").click();
  }

  return (
    <section className="mb-3">
      <div className="row g-3">
        <div className="col-lg-5">
          <input type="file" id="timesheet-file-input" className="d-none" multiple accept=".pdf,.jpg,.jpeg,.png" />

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
            onClick={openPicker}
            className={`ts-dropzone h-100 d-flex flex-column align-items-center justify-content-center text-center p-4 ${
              drag ? "is-dragging" : ""
            }`}
          >
            <div className="ts-dropzone-icon d-flex align-items-center justify-content-center rounded-circle mb-2">
              <i className="fas fa-cloud-arrow-up"></i>
            </div>

            <div className="fw-semibold mb-1">Drop timesheet files here</div>
            <p className="text-muted small mb-3">One sheet per employee. You can drop several at once.</p>

            <BtnPrimary
              onClick={(e) => {
                e.stopPropagation();
                openPicker();
              }}
            >
              <i className="fas fa-folder-open"></i> Choose Files
            </BtnPrimary>

            <div className="ts-dropzone-meta mt-3 pt-3 w-100">
              <div className="d-flex flex-wrap justify-content-center gap-3 text-muted" style={{ fontSize: 11.5 }}>
                <span>
                  <i className="fas fa-file-pdf me-1"></i> PDF, JPG, PNG
                </span>
                <span>
                  <i className="fas fa-weight-hanging me-1"></i> Max 10MB
                </span>
                <span>
                  <i className="fas fa-lock me-1"></i> Used only for extraction
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-7 d-flex flex-column gap-3">
          <DataCard title="File Requirements">
            <div className="list-group list-group-flush">
              {REQUIREMENTS.map((r) => (
                <div className="list-group-item d-flex align-items-center gap-3 px-3 py-2" key={r.title}>
                  <div
                    className={`d-flex align-items-center justify-content-center flex-shrink-0 border rounded-2 bg-light ${r.tone}`}
                    style={{ width: 30, height: 30, fontSize: 12 }}
                  >
                    <i className={`fas ${r.icon}`}></i>
                  </div>

                  <div className="flex-grow-1" style={{ minWidth: 0 }}>
                    <div className="fw-semibold" style={{ fontSize: "0.8125rem" }}>
                      {r.title}
                    </div>
                    <div className="text-muted" style={{ fontSize: 11 }}>
                      {r.sub}
                    </div>
                  </div>

                  <span className="badge rounded-pill bg-secondary bg-opacity-10 text-secondary fw-normal py-1 flex-shrink-0">
                    {r.level}
                  </span>
                </div>
              ))}
            </div>
          </DataCard>

          <DataCard title="Extraction Summary (Last 7 Days)">
            <div className="card-body row g-2">
              {summary.map((s) => (
                <div className="col-6 col-md-3" key={s.label}>
                  <div className="border rounded-3 bg-light p-2 px-3 h-100 d-flex flex-column justify-content-between">
                    <div className="text-muted fw-semibold" style={{ fontSize: 12 }}>
                      {s.label}
                    </div>
                    <div className="fs-4 fw-bold mt-auto" style={s.color ? { color: s.color } : undefined}>
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
  );
}
