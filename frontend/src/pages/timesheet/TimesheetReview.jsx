import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { DataCard, Table, Tr, Td, Badge, BtnPrimary, BtnSecondary, BtnDanger, Modal, PageHeader, TabsNav } from "../../components/ui/index.jsx";
import {
  useTimesheets,
  checkPeriodHalf,
  findDuplicateSheets,
  rowTotals,
  rowLate,
  scheduleFor,
  sheetTotals,
  sheetMismatches,
} from "../../context/TimesheetContext.jsx";
import { clientNames, employeeNames, sheetPeriods } from "../../assets/data/index.js";

// Suggestions for the sheet fields, taken from the same lists the rest of the app
// filters against. Each field stays typeable: OCR can read a name or a period that
// is not on the list yet, and the operator should be able to keep it.
const EMPLOYEE_OPTIONS = employeeNames;
const CLIENT_OPTIONS = clientNames;
const PERIOD_OPTIONS = sheetPeriods;
const HALF_OPTIONS = ["1-15", "16-31"];

// Zoom cycles rather than stepping in and out, so the viewer keeps the two buttons
// the toolbar already had instead of growing a control strip.
const ZOOM_STEPS = [1, 1.5, 2, 3];

// The rejection list from the upload requirements, in the words the sender needs
// to act on. Whatever is ticked here is what goes back to them.
const REJECT_REASONS = [
  "Not the standard STRON'L form",
  "Part of the sheet is outside the frame",
  "Blurred, skewed, or glare on the page",
  "Period Covered is blank or unreadable",
  "More than one document in the image",
  "Wrong form half for the dates written",
  "Handwriting cannot be read reliably",
];


// TimesheetReview — confirms what was read off one sheet before it is approved.
export default function TimesheetReview() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { files, getFileById, approveFile, saveFile, rejectFile } = useTimesheets();

  const file = getFileById(id);

  if (!file) {
    return (
      <section className="mt-4">
        <p className="text-muted mb-3">Timesheet not found.</p>
        <Link to="/timesheet" state={{ tab: "sheets" }} className="btn btn-dark btn-sm d-inline-flex align-items-center gap-2">
          <i className="fas fa-arrow-left"></i> Back to Timesheets
        </Link>
      </section>
    );
  }

  // Sheets are opened from the Uploaded Sheets tab, so that is where leaving returns to.
  const backToSheets = () => navigate("/timesheet", { state: { tab: "sheets" } });

  // key resets the form when the reviewer moves straight from one sheet to another.
  return (
    <TimesheetReviewForm
      key={file.id}
      file={file}
      files={files}
      onBack={backToSheets}
      onApprove={approveFile}
      onSave={saveFile}
      onReject={rejectFile}
    />
  );
}

// TimesheetReviewForm — the sheet itself, once we know it exists.
function TimesheetReviewForm({ file, files, onBack, onApprove, onSave, onReject }) {
  const [rows, setRows] = useState(file.rows);
  const [employee, setEmployee] = useState(file.employee.name || "");
  const [period, setPeriod] = useState(file.period.label || "");
  const [periodConfirmed, setPeriodConfirmed] = useState(file.period.confirmed);
  const [client, setClient] = useState(file.client || "");
  const [half, setHalf] = useState(file.half || "");

  const readOnly = file.status === "Approved" || file.status === "Rejected";

  // Document viewer. Rotate and zoom act on the image the browser is holding; a PDF
  // is handed to the browser's own viewer, which brings its own controls.
  const [rotation, setRotation] = useState(0);
  const [zoomStep, setZoomStep] = useState(0);
  const [docError, setDocError] = useState(false);
  const hasDocument = Boolean(file.previewUrl) && !docError;
  const isImage = file.type !== "pdf";
  const canTransform = hasDocument && isImage;
  const zoom = ZOOM_STEPS[zoomStep];
  const transformHint = !hasDocument ? "There is no document to show" : "A PDF opens in the browser's own viewer, which brings its own controls";

  const [rejectReasons, setRejectReasons] = useState([]);
  const [rejectNote, setRejectNote] = useState("");
  const canReject = rejectReasons.length > 0 || rejectNote.trim().length > 0;

  function toggleReason(reason) {
    setRejectReasons((prev) => (prev.includes(reason) ? prev.filter((r) => r !== reason) : [...prev, reason]));
  }

  // What is on screen versus what was last written to the sheet. Comparing the two
  // is what tells the reviewer whether anything would be lost by leaving.
  const draft = { rows, employee, client, period, half, periodConfirmed };
  const savedState = useMemo(
    () => ({
      rows: file.rows,
      employee: file.employee.name || "",
      client: file.client || "",
      period: file.period.label || "",
      half: file.half || "",
      periodConfirmed: file.period.confirmed,
    }),
    [file],
  );

  const changed = [
    employee !== savedState.employee && "Employee",
    client !== savedState.client && "Client",
    period !== savedState.period && "Period Covered",
    half !== savedState.half && "Sheet Half",
    periodConfirmed !== savedState.periodConfirmed && "Period confirmation",
    JSON.stringify(rows) !== JSON.stringify(savedState.rows) && "Daily entries",
  ].filter(Boolean);

  const isDirty = !readOnly && changed.length > 0;
  const savedAt = file.savedAt ? new Date(file.savedAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }) : null;

  // The browser's own prompt is the only thing that can cover a refresh or a
  // closed tab, so it is armed only while there is unsaved work.
  useEffect(() => {
    if (!isDirty) return undefined;
    const warn = (e) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [isDirty]);

  // Leaves the sheet. When the prompt is open it is dismissed first and the page
  // waits for Bootstrap to finish hiding it, so navigating never strands a backdrop.
  function leaveVia(modalId, closeId) {
    const modal = document.getElementById(modalId);
    if (modal?.classList.contains("show")) {
      modal.addEventListener("hidden.bs.modal", onBack, { once: true });
      document.getElementById(closeId)?.click();
      return;
    }
    onBack();
  }

  function leave() {
    leaveVia("timesheetUnsavedModal", "timesheetUnsavedClose");
  }

  // Rejecting supersedes any unsaved corrections, so it does not go through the
  // unsaved prompt: the sheet is going back either way.
  function handleReject() {
    onReject(file.id, { reasons: rejectReasons, note: rejectNote });
    leaveVia("timesheetRejectModal", "timesheetRejectClose");
  }

  function handleSaveAndClose() {
    onSave(file.id, draft);
    leave();
  }

  function handleDiscardAndClose() {
    leave();
  }

  // Leaving is only interrupted when there is something to lose.
  function handleBack() {
    if (!isDirty) {
      onBack();
      return;
    }
    document.getElementById("timesheetUnsavedTrigger")?.click();
  }

  // Late follows the employee currently named in the field, not the one the OCR
  // first guessed, so correcting a misread name recalculates the column at once.
  const schedule = scheduleFor(employee);

  const computed = sheetTotals(rows, schedule);
  const hw = file.handwritten || {};
  const mismatches = sheetMismatches(rows, file.handwritten, schedule);

  const lowConfidenceCells = rows.reduce((n, r) => n + (r.lowConfidence ? r.lowConfidence.length : 0), 0);

  // Period Covered and Sheet Half describe the same thing twice. When they disagree,
  // the days would be filed against the wrong half of the month.
  const periodCheck = checkPeriodHalf(period, half);
  const periodConflict = periodCheck.status === "mismatch" || periodCheck.status === "not-a-half";

  // Days already carried by another sheet for the same person would be paid twice.
  // A clash with an approved sheet blocks; a clash with one still under review is a
  // warning, because the reviewer is the one who decides which of the two to keep.
  const duplicates = findDuplicateSheets(files || [], file, draft);
  const approvedDuplicates = duplicates.filter((d) => d.status === "Approved");
  const pendingDuplicates = duplicates.filter((d) => d.status !== "Approved");

  const blockers = [
    !periodConfirmed && { title: "Period Covered is not confirmed", sub: "Tick the confirmation box below once it matches the sheet." },
    periodCheck.status === "mismatch" && {
      title: "Period Covered and Sheet Half do not agree",
      sub: `${period} is the ${periodCheck.expected} half of the month, but Sheet Half reads ${half}.`,
    },
    periodCheck.status === "not-a-half" && {
      title: "Period Covered is not a half-month range",
      sub: "A sheet covers days 1–15 or 16–31. Check the dates written on the form.",
    },
    approvedDuplicates.length > 0 && {
      title: "These days are already approved on another sheet",
      sub: `${approvedDuplicates.map((d) => d.name).join(", ")} — approving this would pay the same days twice.`,
    },
    file.employee.confidence < 0.85 && { title: "Employee name read with low confidence", sub: "Check the name against the sheet before approving." },
    !file.signatures.client && { title: "Client signature not detected", sub: "The client signature box appears to be empty." },
  ].filter(Boolean);

  // The scanned sheet holds the left column; the attention card and the details
  // stack in the right one, so their widths no longer depend on each other.
  const hasAttention = Boolean(file.rejection) || blockers.length > 0 || mismatches.length > 0 || lowConfidenceCells > 0;
  const attentionCount = (file.rejection ? 1 : 0) + blockers.length + mismatches.length + (lowConfidenceCells > 0 ? 1 : 0);

  // Mirrors File Requirements on the Upload tab: every finding is one list row
  // with an icon, what it is, and a pill saying what kind of finding it is.
  const rejection = file.rejection;
  const attentionItems = [
    ...(rejection
      ? [
          {
            icon: "fa-rotate-left",
            tone: "text-danger",
            title: "Sent back to be re-scanned",
            sub: [rejection.reasons.join(" · "), rejection.note].filter(Boolean).join(" — ") || "No reason recorded.",
            level: "Rejected",
          },
        ]
      : []),
    ...mismatches.map((m) => ({
      icon: "fa-scale-unbalanced",
      tone: "text-warning",
      title: `${m.label} does not match the sheet`,
      sub: `Sheet says ${m.written} · entries read ${m.computed}`,
      level: "Mismatch",
    })),
    ...blockers.map((b) => ({ icon: "fa-circle-exclamation", tone: "text-warning", title: b.title, sub: b.sub, level: "Blocking" })),
    ...(lowConfidenceCells > 0
      ? [
          {
            icon: "fa-triangle-exclamation",
            tone: "text-warning",
            title: `${lowConfidenceCells} cells were read with low confidence`,
            sub: "They are highlighted in the Daily Entries tab.",
            level: "Check",
          },
        ]
      : []),
    ...(periodCheck.status === "unreadable"
      ? [
          {
            icon: "fa-calendar-xmark",
            tone: "text-warning",
            title: "Period Covered could not be read as a date range",
            sub: "Write it in full with the month and year, for example Jun 1 – Jun 15, 2026.",
            level: "Check",
          },
        ]
      : []),
    ...(pendingDuplicates.length > 0
      ? [
          {
            icon: "fa-clone",
            tone: "text-warning",
            title: `The same days appear on ${pendingDuplicates.length} other sheet${pendingDuplicates.length === 1 ? "" : "s"} awaiting review`,
            sub: `${pendingDuplicates.map((d) => d.name).join(", ")} — only one of them should be approved.`,
            level: "Check",
          },
        ]
      : []),
  ];

  // Mirrors the toolbar on the Timesheet page: tabs on the left, and the page's
  // actions on the right where its filters sit.
  const [tab, setTab] = useState("sheet");
  const TABS = [
    { key: "sheet", label: "Sheet Details", icon: "fa-file-lines", badge: attentionCount || null },
    { key: "entries", label: "Daily Entries", icon: "fa-table-list", badge: lowConfidenceCells || null },
  ];

  function updateCell(day, field, value) {
    setRows((prev) => prev.map((r) => (r.day === day ? { ...r, [field]: value } : r)));
  }

  function cellClass(row, field) {
    return `ts-cell ${row.lowConfidence && row.lowConfidence.includes(field) ? "ts-cell-flagged" : ""}`;
  }

  return (
    <>
      <section>
        <div className="mt-4 d-flex align-items-start gap-2">
          <button type="button" onClick={handleBack} className="nav-icon-btn flex-shrink-0" style={{ marginTop: -6 }} aria-label="Back">
            <i className="fas fa-arrow-left"></i>
          </button>
          <div className="flex-grow-1">
            <PageHeader
              title="Timesheet Review"
              description={`${client} · ${period} · Form ${file.formCode}`}
              actions={
                <div className="d-flex align-items-center gap-2">
                  {isDirty ? (
                    <span className="badge rounded-pill status-badge status-badge-warning text-nowrap">Unsaved changes</span>
                  ) : (
                    savedAt && (
                      <span className="text-muted text-nowrap" style={{ fontSize: 11.5 }}>
                        Saved {savedAt}
                      </span>
                    )
                  )}
                  <Badge status={file.status} />
                </div>
              }
            />
          </div>
        </div>
      </section>

      <hr className="my-3 opacity-25" />

      <section className="ts-toolbar mb-4">
        <div className="row g-3 align-items-end">
          <div className="col-12 col-xl-6">
            <TabsNav tabs={TABS} active={tab} onChange={setTab} />
          </div>
          {!readOnly && (
            <div className="col-12 col-xl-6">
              <div className="d-flex flex-column flex-sm-row flex-wrap gap-2 justify-content-xl-end">
                <BtnPrimary className="justify-content-center" disabled={blockers.length > 0} onClick={() => onApprove(file.id, draft)}>
                  <i className="fas fa-circle-check"></i> Approve Sheet
                </BtnPrimary>
                <BtnSecondary className="justify-content-center" onClick={handleSaveAndClose}>
                  <i className="fas fa-floppy-disk"></i> Save and close
                </BtnSecondary>
                <BtnDanger className="justify-content-center" data-bs-toggle="modal" data-bs-target="#timesheetRejectModal">
                  <i className="fas fa-rotate-left"></i> Reject and re-scan
                </BtnDanger>
              </div>
            </div>
          )}
        </div>
      </section>

      {tab === "sheet" && (
        <section className="mb-3">
          <div className="row g-3">
            <div className="col-12 col-lg-5">
              <DataCard
                title="Scanned Sheet"
                action={
                  <span className="text-muted text-truncate d-inline-block ms-3" style={{ fontSize: 11.5, maxWidth: 260 }} title={file.name}>
                    <i className="fas fa-paperclip me-1"></i>
                    {file.name}
                  </span>
                }
              >
                <div className="card-body d-flex flex-column">
                  <div className={`ts-doc flex-grow-1 d-flex rounded-3 ${hasDocument ? "has-document" : "flex-column align-items-center justify-content-center text-muted"}`}>
                    {!hasDocument ? (
                      <>
                        <i className={`fas ${docError ? "fa-file-circle-xmark" : "fa-file-lines"} mb-2`} style={{ fontSize: 32 }}></i>
                        <div className="small">{docError ? "Document could not be displayed" : "Document not available"}</div>
                        <div className="text-center px-3" style={{ fontSize: 11.5 }}>
                          {docError
                            ? "The file may have been moved or is no longer readable."
                            : "The original file is not stored for this sheet."}
                        </div>
                      </>
                    ) : isImage ? (
                      <div className="ts-doc-viewport">
                        <img
                          src={file.previewUrl}
                          alt={file.name}
                          className="ts-doc-media"
                          style={{ transform: `rotate(${rotation}deg) scale(${zoom})` }}
                          onError={() => setDocError(true)}
                        />
                      </div>
                    ) : (
                      <iframe src={file.previewUrl} title={file.name} className="ts-doc-frame" onError={() => setDocError(true)} />
                    )}
                  </div>

                  <div className="d-flex justify-content-center gap-2 mt-3">
                    <BtnSecondary
                      disabled={!canTransform}
                      title={canTransform ? "Turn the page a quarter turn" : transformHint}
                      onClick={() => setRotation((r) => (r + 90) % 360)}
                    >
                      <i className="fas fa-rotate-left"></i> Rotate
                    </BtnSecondary>
                    <BtnSecondary
                      disabled={!canTransform}
                      title={canTransform ? "Cycle through the zoom levels" : transformHint}
                      onClick={() => setZoomStep((z) => (z + 1) % ZOOM_STEPS.length)}
                    >
                      <i className="fas fa-magnifying-glass-plus"></i> Zoom {Math.round(zoom * 100)}%
                    </BtnSecondary>
                  </div>
                </div>
              </DataCard>
            </div>

            <div className="col-12 col-lg-7 d-flex flex-column gap-3">
              {hasAttention && (
                <div>
                  <DataCard
                    title="Needs Attention"
                    action={<span className="badge rounded-pill status-badge status-badge-warning">{attentionCount}</span>}
                  >
                    <div className="list-group list-group-flush">
                      {attentionItems.map((a) => (
                        <div className="list-group-item d-flex align-items-center gap-3 px-3 py-2" key={a.title}>
                          <div
                            className={`d-flex align-items-center justify-content-center flex-shrink-0 border rounded-2 bg-light ${a.tone}`}
                            style={{ width: 30, height: 30, fontSize: 12 }}
                          >
                            <i className={`fas ${a.icon}`}></i>
                          </div>

                          <div className="flex-grow-1" style={{ minWidth: 0 }}>
                            <div className="fw-semibold" style={{ fontSize: "0.8125rem" }}>
                              {a.title}
                            </div>
                            <div className="text-muted" style={{ fontSize: 11 }}>
                              {a.sub}
                            </div>
                          </div>

                          <span className="badge rounded-pill bg-secondary bg-opacity-10 text-secondary fw-normal py-1 flex-shrink-0">
                            {a.level}
                          </span>
                        </div>
                      ))}
                    </div>
                  </DataCard>
                </div>
              )}

              <div className="flex-grow-1">
                <DataCard title="Sheet Details">
                  <div className="card-body">
                    <div className="row g-3">
                      <div className="col-12 col-md-6 col-xl-3">
                        <SuggestField
                          label="Employee"
                          value={employee}
                          onChange={setEmployee}
                          options={EMPLOYEE_OPTIONS}
                          disabled={readOnly}
                          hint={`Read with ${Math.round(file.employee.confidence * 100)}% confidence`}
                        />
                      </div>

                      <div className="col-12 col-md-6 col-xl-3">
                        <SuggestField
                          label="Client"
                          value={client}
                          onChange={setClient}
                          options={CLIENT_OPTIONS}
                          disabled={readOnly}
                          hint="From the upload batch"
                        />
                      </div>

                      <div className="col-12 col-md-6 col-xl-3">
                        <SuggestField
                          label="Period Covered"
                          value={period}
                          onChange={setPeriod}
                          options={PERIOD_OPTIONS}
                          disabled={readOnly}
                          flagged={!periodConfirmed || periodConflict}
                          hint={readOnly ? "Confirmed against the sheet" : undefined}
                        >
                          {!readOnly && (
                            <div className="form-check mt-2">
                              <input
                                className="form-check-input"
                                type="checkbox"
                                id="confirm-period"
                                checked={periodConfirmed}
                                onChange={(e) => setPeriodConfirmed(e.target.checked)}
                              />
                              <label className="form-check-label ts-field-hint" htmlFor="confirm-period">
                                Checked against the sheet
                              </label>
                            </div>
                          )}
                        </SuggestField>
                      </div>

                      <div className="col-12 col-md-6 col-xl-3">
                        <SuggestField
                          label="Sheet Half"
                          value={half}
                          onChange={setHalf}
                          options={HALF_OPTIONS}
                          disabled={readOnly}
                          flagged={periodConflict}
                          hint={periodCheck.status === "mismatch" ? `Period Covered reads as ${periodCheck.expected}` : "Detected from the date column"}
                        />
                      </div>
                    </div>

                    <div className="mt-3">
                      <div className="form-label text-uppercase text-muted fw-semibold mb-1" style={{ fontSize: 11, letterSpacing: 0.5 }}>
                        Signatures
                      </div>
                      <div className="row g-2">
                        <SignatureItem signed={file.signatures.employee} label="Employee" />
                        <SignatureItem signed={file.signatures.supervisor} label="Supervisor" />
                        <SignatureItem signed={file.signatures.client} label="Client" />
                      </div>
                    </div>
                  </div>
                </DataCard>
              </div>
            </div>
          </div>
        </section>
      )}

      {tab === "entries" && (
        <>
          <section className="mb-4">
            <DataCard
              title="Daily Entries"
              action={
                <div className="d-flex align-items-center gap-2">
                  {schedule && (
                    <span className="text-muted text-nowrap" style={{ fontSize: 11.5 }}>
                      Late from a {schedule.in} start
                    </span>
                  )}
                  {lowConfidenceCells > 0 ? (
                    <span className="badge rounded-pill status-badge status-badge-warning">{lowConfidenceCells} flagged</span>
                  ) : (
                    <span className="text-muted text-nowrap" style={{ fontSize: 11.5 }}>
                      {rows.length} days
                    </span>
                  )}
                </div>
              }
            >
              <Table
                headers={["Date", "Morning", "Afternoon", "Overtime", "Late (mins)", "Hours"]}
                itemLabel="days"
                pageSize={40}
                mobilePageSize={40}
              >
                {rows.map((row) => {
                  const t = rowTotals(row);
                  return (
                    <Tr key={row.day}>
                      <Td bold>
                        <div>{row.day}</div>
                        <div className="text-muted fw-normal" style={{ fontSize: 11.5 }}>
                          {row.date}
                        </div>
                      </Td>
                      {[
                        ["Morning", "amIn", "amOut"],
                        ["Afternoon", "pmIn", "pmOut"],
                        ["Overtime", "otIn", "otOut"],
                      ].map(([session, inField, outField]) => (
                        <Td key={session}>
                          <div className="ts-pair">
                            <input
                              type="text"
                              className={cellClass(row, inField)}
                              value={row[inField]}
                              placeholder="--:--"
                              disabled={readOnly}
                              aria-label={`${row.date}, ${session} in`}
                              onChange={(e) => updateCell(row.day, inField, e.target.value)}
                            />
                            <span className="ts-pair-sep text-muted">&ndash;</span>
                            <input
                              type="text"
                              className={cellClass(row, outField)}
                              value={row[outField]}
                              placeholder="--:--"
                              disabled={readOnly}
                              aria-label={`${row.date}, ${session} out`}
                              onChange={(e) => updateCell(row.day, outField, e.target.value)}
                            />
                          </div>
                        </Td>
                      ))}
                      <Td>
                        {schedule ? (
                          <span
                            className={rowLate(row, schedule) > 0 ? "fw-semibold ts-warn" : "text-muted"}
                            title={`In at ${row.amIn || "—"} against a ${schedule.in} start`}
                          >
                            {rowLate(row, schedule) || (row.amIn ? 0 : "—")}
                          </span>
                        ) : (
                          <input
                            type="text"
                            className="ts-cell ts-cell-late"
                            value={row.late || ""}
                            placeholder="0"
                            disabled={readOnly}
                            aria-label={`${row.date}, minutes late`}
                            onChange={(e) => updateCell(row.day, "late", Number(e.target.value) || 0)}
                          />
                        )}
                      </Td>
                      <Td bold>
                        {t.regular > 0 || t.overtime > 0 ? (
                          <>
                            {t.regular}
                            {t.overtime > 0 && <span className="text-muted fw-normal"> +{t.overtime} OT</span>}
                          </>
                        ) : (
                          <span className="text-muted fw-normal">&mdash;</span>
                        )}
                      </Td>
                    </Tr>
                  );
                })}
              </Table>
            </DataCard>
          </section>

          <section className="mb-3">
            <DataCard title="Sheet Totals">
              <div className="card-body row g-2">
                <TotalItem label="Days Worked" value={computed.days} written={hw.totalDays} />
                <TotalItem label="Regular Hours" value={computed.regular} />
                <TotalItem label="Overtime Hours" value={computed.overtime} written={hw.regOt} />
                <TotalItem label="Total Late" value={`${computed.late} mins`} written={hw.totalLate != null ? `${hw.totalLate} mins` : null} />
              </div>
            </DataCard>
          </section>
        </>
      )}

      <Modal
        id="timesheetRejectModal"
        title="Reject and Re-scan"
        footer={
          <>
            <BtnSecondary id="timesheetRejectClose" data-bs-dismiss="modal">
              Cancel
            </BtnSecondary>
            <BtnDanger disabled={!canReject} onClick={handleReject}>
              <i className="fas fa-rotate-left"></i> Reject Sheet
            </BtnDanger>
          </>
        }
      >
        <p className="text-muted small mb-3">
          Tick everything that has to be fixed. This is what goes back to whoever sent the sheet, so the same scan is not simply uploaded again.
        </p>

        <div className="border rounded-3 overflow-hidden mb-3">
          <div className="list-group list-group-flush">
            {REJECT_REASONS.map((reason) => (
              <label className="list-group-item d-flex align-items-center gap-2 px-3 py-2 mb-0" key={reason} style={{ cursor: "pointer" }}>
                <input
                  className="form-check-input flex-shrink-0 mt-0"
                  type="checkbox"
                  checked={rejectReasons.includes(reason)}
                  onChange={() => toggleReason(reason)}
                />
                <span style={{ fontSize: "0.8125rem" }}>{reason}</span>
              </label>
            ))}
          </div>
        </div>

        <label className="form-label text-uppercase text-muted fw-semibold mb-1 d-block" style={{ fontSize: 11, letterSpacing: 0.5 }}>
          Note (optional)
        </label>
        <textarea
          className="form-control"
          rows={2}
          value={rejectNote}
          onChange={(e) => setRejectNote(e.target.value)}
          placeholder="e.g. days 8 to 14 are covered by a shadow"
        />
      </Modal>

      <button type="button" id="timesheetUnsavedTrigger" className="d-none" data-bs-toggle="modal" data-bs-target="#timesheetUnsavedModal" />

      <Modal
        id="timesheetUnsavedModal"
        title="Unsaved Changes"
        footer={
          <>
            <BtnSecondary id="timesheetUnsavedClose" data-bs-dismiss="modal">
              Keep Editing
            </BtnSecondary>
            <BtnDanger onClick={handleDiscardAndClose}>
              <i className="fas fa-trash"></i> Discard Changes
            </BtnDanger>
            <BtnPrimary onClick={handleSaveAndClose}>
              <i className="fas fa-floppy-disk"></i> Save and Close
            </BtnPrimary>
          </>
        }
      >
        <div className="d-flex align-items-start gap-3">
          <div
            className="d-flex align-items-center justify-content-center flex-shrink-0 rounded-3 bg-warning bg-opacity-10 text-warning"
            style={{ width: 40, height: 40, fontSize: 15 }}
          >
            <i className="fas fa-triangle-exclamation"></i>
          </div>
          <div style={{ minWidth: 0 }}>
            <p className="mb-1" style={{ overflowWrap: "anywhere" }}>
              Leave <strong>{file.name}</strong> without saving?
            </p>
            <p className="text-muted small mb-0">
              {changed.length === 1 ? "One section has" : `${changed.length} sections have`} been edited since this sheet was last saved:{" "}
              {changed.join(", ")}.
            </p>
          </div>
        </div>
      </Modal>
    </>
  );
}

// SuggestField — a typeable field that reads as one control: the caret sits inside
// the box like a select's, and opens the app's own dropdown rather than the
// browser's native list.
function SuggestField({ label, value, onChange, options, disabled, hint, flagged, children }) {
  return (
    <div className="ts-field">
      <label className="form-label text-uppercase text-muted fw-semibold mb-1 d-block" style={{ fontSize: 11, letterSpacing: 0.5 }}>
        {label}
      </label>
      <div className="dropdown ts-suggest">
        <input
          type="text"
          className={`form-control ${flagged ? "ts-cell-flagged" : ""}`}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          autoComplete="off"
        />
        <button
          type="button"
          className="ts-suggest-toggle"
          data-bs-toggle="dropdown"
          aria-expanded="false"
          aria-label={`Choose ${label}`}
          disabled={disabled}
        >
          <i className="fas fa-chevron-down"></i>
        </button>
        <ul className="dropdown-menu dropdown-menu-end shadow-sm py-2" style={{ fontSize: "0.85rem" }}>
          {options.map((o) => (
            <li key={o}>
              <button
                type="button"
                className={`dropdown-item d-flex align-items-center gap-2 py-2 ${o === value ? "active" : ""}`}
                onClick={() => onChange(o)}
              >
                {o}
              </button>
            </li>
          ))}
        </ul>
      </div>
      {hint && <div className="ts-field-hint text-muted">{hint}</div>}
      {children}
    </div>
  );
}

// SignatureItem — whether ink was detected in one signature box.
function SignatureItem({ signed, label }) {
  return (
    <div className="col-12 col-sm-4">
      <div className="border rounded-3 bg-light p-2 px-3 h-100 d-flex flex-column justify-content-between">
        <div className="text-muted fw-semibold" style={{ fontSize: 12 }}>
          {label}
        </div>
        <div className={`fw-semibold mt-auto d-flex align-items-center gap-2 ${signed ? "text-success" : "text-danger"}`}>
          <i className={`fas ${signed ? "fa-circle-check" : "fa-circle-xmark"}`} style={{ fontSize: "0.8rem" }}></i>
          <span style={{ fontSize: "0.8125rem" }}>{signed ? "Signed" : "Not detected"}</span>
        </div>
      </div>
    </div>
  );
}

// TotalItem — a calculated total, with the handwritten figure beneath it.
function TotalItem({ label, value, written }) {
  const mismatch = written != null && String(written) !== String(value);
  return (
    <div className="col-6 col-md-3">
      <div className="border rounded-3 bg-light p-2 px-3 h-100 d-flex flex-column justify-content-between">
        <div className="text-muted fw-semibold" style={{ fontSize: 12 }}>
          {label}
        </div>
        <div className="fs-4 fw-bold mt-auto" style={mismatch ? { color: "#d97706" } : undefined}>
          {value}
        </div>
        {written != null && (
          <div className={mismatch ? "ts-warn" : "text-muted"} style={{ fontSize: 11 }}>
            {mismatch && <i className="fas fa-triangle-exclamation me-1"></i>}
            Sheet says {written}
          </div>
        )}
      </div>
    </div>
  );
}
