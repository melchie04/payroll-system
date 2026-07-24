import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { DataCard, BtnPrimary, BtnSecondary, IconBtn } from "../ui/index.jsx";
import { useTimesheets } from "../../context/TimesheetContext.jsx";

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

// The three rules a browser can actually check before a file leaves the machine.
const MAX_BYTES = 10 * 1024 * 1024;
const ACCEPTED = {
  "application/pdf": { type: "pdf", source: "Scan" },
  "image/jpeg": { type: "img", source: "Photo" },
  "image/png": { type: "img", source: "Photo" },
};
const ACCEPTED_EXTENSIONS = { pdf: "application/pdf", jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png" };

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// Browsers leave the MIME type blank often enough that the extension has to be
// the fallback, not the other way round.
function kindOf(file) {
  if (ACCEPTED[file.type]) return ACCEPTED[file.type];
  const ext = file.name.split(".").pop()?.toLowerCase();
  const mapped = ACCEPTED_EXTENSIONS[ext];
  return mapped ? ACCEPTED[mapped] : null;
}

// Everything that can be judged without a server. A rejected file never enters
// the queue, so the reason is given where the file was dropped.
function screen(file, taken) {
  if (taken.has(file.name.toLowerCase())) {
    return { reason: "Already in this batch", hint: "A sheet with this filename has already been added." };
  }
  if (!kindOf(file)) {
    return { reason: "Not a PDF, JPG or PNG", hint: "Scan or photograph the sheet and try again." };
  }
  if (file.size === 0) {
    return { reason: "File is empty", hint: "Nothing was read from the scanner." };
  }
  if (file.size > MAX_BYTES) {
    return { reason: `Over 10 MB (${formatSize(file.size)})`, hint: "Rescan at 300 DPI rather than the scanner's maximum." };
  }
  return null;
}

// TimesheetUpload — the dropzone, the queue of files being taken in, what a good
// file looks like, and recent throughput.
export function TimesheetUpload({ summary, client, canUpload = true, onOpenSheets }) {
  const { addSheets } = useTimesheets();

  const [drag, setDrag] = useState(false);
  const [queue, setQueue] = useState([]);
  const [rejected, setRejected] = useState([]);
  const readers = useRef(new Map());

  // A reader per queued file. Progress is the browser reading the file off disk,
  // which is the only part of an upload that exists until there is a server.
  useEffect(() => {
    const pending = queue.filter((q) => q.state === "reading" && !readers.current.has(q.id));

    for (const item of pending) {
      const reader = new FileReader();
      readers.current.set(item.id, reader);

      reader.onprogress = (e) => {
        if (!e.lengthComputable) return;
        const percent = Math.min(99, Math.round((e.loaded / e.total) * 100));
        setQueue((prev) => prev.map((q) => (q.id === item.id ? { ...q, percent } : q)));
      };
      reader.onload = () => {
        readers.current.delete(item.id);
        setQueue((prev) => prev.map((q) => (q.id === item.id ? { ...q, percent: 100, state: "done" } : q)));
      };
      reader.onerror = () => {
        readers.current.delete(item.id);
        setQueue((prev) => prev.map((q) => (q.id === item.id ? { ...q, state: "error" } : q)));
      };
      reader.onabort = () => readers.current.delete(item.id);

      reader.readAsArrayBuffer(item.file);
    }
  }, [queue]);

  // Abort anything still reading if the operator leaves the tab.
  useEffect(() => {
    const running = readers.current;
    return () => {
      for (const reader of running.values()) reader.abort();
      running.clear();
    };
  }, []);

  const done = useMemo(() => queue.filter((q) => q.state === "done"), [queue]);
  const busy = queue.some((q) => q.state === "reading");

  const accept = useCallback(
    (fileList) => {
      const incoming = Array.from(fileList || []);
      if (incoming.length === 0) return;

      const taken = new Set(queue.map((q) => q.name.toLowerCase()));
      const added = [];
      const refused = [];

      for (const file of incoming) {
        const problem = screen(file, taken);
        if (problem) {
          refused.push({ id: `${file.name}-${file.size}-${Math.random()}`, name: file.name, ...problem });
          continue;
        }
        taken.add(file.name.toLowerCase());
        const kind = kindOf(file);
        added.push({
          id: `${file.name}-${file.size}-${Math.random()}`,
          file,
          name: file.name,
          size: file.size,
          type: kind.type,
          source: kind.source,
          percent: 0,
          state: "reading",
        });
      }

      if (added.length) setQueue((prev) => [...prev, ...added]);
      if (refused.length) setRejected((prev) => [...prev, ...refused]);
    },
    [queue],
  );

  function openPicker() {
    if (!canUpload) return;
    document.getElementById("timesheet-file-input").click();
  }

  function handleInput(e) {
    accept(e.target.files);
    e.target.value = "";
  }

  function removeQueued(id) {
    readers.current.get(id)?.abort();
    readers.current.delete(id);
    setQueue((prev) => prev.filter((q) => q.id !== id));
  }

  // Hands the finished files to the sheets list, where extraction picks them up.
  function fileThem() {
    if (done.length === 0) return;
    addSheets(
      done.map((q) => ({
        name: q.name,
        type: q.type,
        source: q.source,
        client,
        previewUrl: URL.createObjectURL(q.file),
      })),
    );
    setQueue((prev) => prev.filter((q) => q.state !== "done"));
    setRejected([]);
    onOpenSheets?.();
  }

  return (
    <section className="mb-3">
      <div className="row g-3">
        <div className="col-lg-5 d-flex flex-column gap-3">
          <input type="file" id="timesheet-file-input" className="d-none" multiple accept=".pdf,.jpg,.jpeg,.png" onChange={handleInput} />

          <div
            onDragOver={(e) => {
              e.preventDefault();
              if (canUpload) setDrag(true);
            }}
            onDragLeave={() => setDrag(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDrag(false);
              if (canUpload) accept(e.dataTransfer.files);
            }}
            onClick={openPicker}
            className={`ts-dropzone flex-grow-1 d-flex flex-column align-items-center justify-content-center text-center p-4 ${
              drag ? "is-dragging" : ""
            } ${canUpload ? "" : "is-disabled"}`}
          >
            <div className="ts-dropzone-icon d-flex align-items-center justify-content-center rounded-circle mb-2">
              <i className="fas fa-cloud-arrow-up"></i>
            </div>

            {canUpload ? (
              <>
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
              </>
            ) : (
              <>
                <div className="fw-semibold mb-1">Choose a client first</div>
                <p className="text-muted small mb-3">
                  Sheets are filed against the client picked above, so uploading is off while All Clients is selected.
                </p>
              </>
            )}

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

          {(queue.length > 0 || rejected.length > 0) && (
            <div>
              <DataCard
                title="Upload Queue"
                action={
                  <span className="text-muted" style={{ fontSize: 11.5 }}>
                    {done.length} of {queue.length} ready
                    {rejected.length > 0 && ` · ${rejected.length} rejected`}
                  </span>
                }
              >
                <div className="list-group list-group-flush">
                  {queue.map((q) => (
                    <div className="list-group-item px-3 py-2" key={q.id}>
                      <div className="d-flex align-items-center gap-3">
                        <div
                          className={`d-flex align-items-center justify-content-center flex-shrink-0 border rounded-2 bg-light ${
                            q.state === "error" ? "text-danger" : q.state === "done" ? "text-success" : "text-secondary"
                          }`}
                          style={{ width: 30, height: 30, fontSize: 12 }}
                        >
                          <i className={`fas ${q.type === "pdf" ? "fa-file-pdf" : "fa-file-image"}`}></i>
                        </div>

                        <div className="flex-grow-1" style={{ minWidth: 0 }}>
                          <div className="fw-semibold text-truncate" style={{ fontSize: "0.8125rem" }} title={q.name}>
                            {q.name}
                          </div>
                          <div className="text-muted" style={{ fontSize: 11 }}>
                            {formatSize(q.size)} · {q.source}
                            {q.state === "done" && " · Ready to file"}
                            {q.state === "error" && " · Could not be read"}
                          </div>
                        </div>

                        <IconBtn title="Remove" onClick={() => removeQueued(q.id)}>
                          <i className="fas fa-xmark"></i>
                        </IconBtn>
                      </div>

                      {q.state !== "done" && (
                        <div className="ts-progress mt-2" role="progressbar" aria-valuenow={q.percent} aria-valuemin={0} aria-valuemax={100}>
                          <div
                            className={`ts-progress-bar ${q.state === "error" ? "is-error" : ""}`}
                            style={{ width: `${q.state === "error" ? 100 : q.percent}%` }}
                          />
                        </div>
                      )}
                    </div>
                  ))}

                  {rejected.map((r) => (
                    <div className="list-group-item px-3 py-2 d-flex align-items-center gap-3" key={r.id}>
                      <div
                        className="d-flex align-items-center justify-content-center flex-shrink-0 border rounded-2 bg-light text-danger"
                        style={{ width: 30, height: 30, fontSize: 12 }}
                      >
                        <i className="fas fa-file-circle-xmark"></i>
                      </div>

                      <div className="flex-grow-1" style={{ minWidth: 0 }}>
                        <div className="fw-semibold text-truncate text-decoration-line-through" style={{ fontSize: "0.8125rem" }} title={r.name}>
                          {r.name}
                        </div>
                        <div className="text-danger" style={{ fontSize: 11 }}>
                          {r.reason} — {r.hint}
                        </div>
                      </div>

                      <IconBtn title="Dismiss" onClick={() => setRejected((prev) => prev.filter((x) => x.id !== r.id))}>
                        <i className="fas fa-xmark"></i>
                      </IconBtn>
                    </div>
                  ))}
                </div>

                <div className="card-body d-flex flex-column flex-sm-row gap-2">
                  <BtnPrimary className="justify-content-center" disabled={done.length === 0 || busy} onClick={fileThem}>
                    <i className="fas fa-inbox"></i> Add {done.length || ""} to Uploaded Sheets
                  </BtnPrimary>
                  <BtnSecondary
                    className="justify-content-center"
                    onClick={() => {
                      for (const q of queue) readers.current.get(q.id)?.abort();
                      readers.current.clear();
                      setQueue([]);
                      setRejected([]);
                    }}
                  >
                    Clear Queue
                  </BtnSecondary>
                </div>
              </DataCard>
            </div>
          )}
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
            <div className="card-body row g-2 py-2">
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
