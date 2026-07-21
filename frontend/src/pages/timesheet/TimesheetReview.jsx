import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { DataCard, Table, Tr, Td, Badge, BtnPrimary, BtnSecondary, BtnDanger, PageHeader, TabsNav } from "../../components/ui/index.jsx";
import { useTimesheets } from "../../context/TimesheetContext.jsx";
import { clientNames, employeeNames, sheetPeriods } from "../../assets/data/index.js";

// Suggestions for the sheet fields, taken from the same lists the rest of the app
// filters against. Each field stays typeable: OCR can read a name or a period that
// is not on the list yet, and the operator should be able to keep it.
const EMPLOYEE_OPTIONS = employeeNames;
const CLIENT_OPTIONS = clientNames;
const PERIOD_OPTIONS = sheetPeriods;
const HALF_OPTIONS = ["1-15", "16-31"];

// Minutes between two "HH:MM" strings, or 0 when either is blank.
function span(from, to) {
  if (!from || !to) return 0;
  const [fh, fm] = from.split(":").map(Number);
  const [th, tm] = to.split(":").map(Number);
  const mins = th * 60 + tm - (fh * 60 + fm);
  return mins > 0 ? mins : 0;
}

function hours(mins) {
  return Math.round((mins / 60) * 100) / 100;
}

// Recomputes a row from its times rather than reading the handwritten totals.
function rowTotals(row) {
  const regular = span(row.amIn, row.amOut) + span(row.pmIn, row.pmOut);
  const overtime = span(row.otIn, row.otOut);
  return { regular: hours(regular), overtime: hours(overtime), worked: regular > 0 };
}

// TimesheetReview — confirms what was read off one sheet before it is approved.
export default function TimesheetReview() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getFileById, approveFile } = useTimesheets();

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

  return <TimesheetReviewForm file={file} onBack={backToSheets} onApprove={approveFile} />;
}

// TimesheetReviewForm — the sheet itself, once we know it exists.
function TimesheetReviewForm({ file, onBack, onApprove }) {
  const [rows, setRows] = useState(file.rows);
  const [employee, setEmployee] = useState(file.employee.name || "");
  const [period, setPeriod] = useState(file.period.label || "");
  const [periodConfirmed, setPeriodConfirmed] = useState(file.period.confirmed);
  const [client, setClient] = useState(file.client || "");
  const [half, setHalf] = useState(file.half || "");

  const readOnly = file.status === "Approved";

  const computed = rows.reduce(
    (acc, r) => {
      const t = rowTotals(r);
      return {
        days: acc.days + (t.worked ? 1 : 0),
        regular: acc.regular + t.regular,
        overtime: acc.overtime + t.overtime,
        late: acc.late + (r.late || 0),
      };
    },
    { days: 0, regular: 0, overtime: 0, late: 0 },
  );

  const hw = file.handwritten || {};
  const mismatches = [
    computed.days !== hw.totalDays && { label: "Total Days", computed: computed.days, written: hw.totalDays },
    Math.round(computed.overtime) !== hw.regOt && { label: "Reg. OT", computed: Math.round(computed.overtime), written: hw.regOt },
    computed.late !== hw.totalLate && { label: "Total Late", computed: `${computed.late} mins`, written: `${hw.totalLate} mins` },
  ].filter(Boolean);

  const lowConfidenceCells = rows.reduce((n, r) => n + (r.lowConfidence ? r.lowConfidence.length : 0), 0);
  const blockers = [
    !periodConfirmed && { title: "Period Covered is not confirmed", sub: "Tick the confirmation box below once it matches the sheet." },
    file.employee.confidence < 0.85 && { title: "Employee name read with low confidence", sub: "Check the name against the sheet before approving." },
    !file.signatures.client && { title: "Client signature not detected", sub: "The client signature box appears to be empty." },
  ].filter(Boolean);

  // The scanned sheet holds the left column; the attention card and the details
  // stack in the right one, so their widths no longer depend on each other.
  const hasAttention = blockers.length > 0 || mismatches.length > 0 || lowConfidenceCells > 0;
  const attentionCount = blockers.length + mismatches.length + (lowConfidenceCells > 0 ? 1 : 0);

  // Mirrors File Requirements on the Upload tab: every finding is one list row
  // with an icon, what it is, and a pill saying what kind of finding it is.
  const attentionItems = [
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
          <button type="button" onClick={onBack} className="nav-icon-btn flex-shrink-0" style={{ marginTop: -6 }} aria-label="Back">
            <i className="fas fa-arrow-left"></i>
          </button>
          <div className="flex-grow-1">
            <PageHeader
              title="Timesheet Review"
              description={`${client} · ${period} · Form ${file.formCode}`}
              actions={<Badge status={file.status} />}
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
                <BtnPrimary
                  className="justify-content-center"
                  disabled={blockers.length > 0}
                  onClick={() => onApprove(file.id, rows)}
                >
                  <i className="fas fa-circle-check"></i> Approve Sheet
                </BtnPrimary>
                <BtnSecondary className="justify-content-center" onClick={onBack}>
                  Save and close
                </BtnSecondary>
                <BtnDanger className="justify-content-center">
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
                  <div className="ts-doc flex-grow-1 d-flex flex-column align-items-center justify-content-center text-muted rounded-3">
                    <i className="fas fa-file-lines mb-2" style={{ fontSize: 32 }}></i>
                    <div className="small">Document preview</div>
                    <div style={{ fontSize: 11.5 }}>Selecting a field highlights it here</div>
                  </div>
                  <div className="d-flex justify-content-center gap-2 mt-3">
                    <BtnSecondary>
                      <i className="fas fa-rotate-left"></i> Rotate
                    </BtnSecondary>
                    <BtnSecondary>
                      <i className="fas fa-magnifying-glass-plus"></i> Zoom
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
                          flagged={!periodConfirmed}
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
                          hint="Detected from the date column"
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
                lowConfidenceCells > 0 ? (
                  <span className="badge rounded-pill status-badge status-badge-warning">{lowConfidenceCells} flagged</span>
                ) : (
                  <span className="text-muted" style={{ fontSize: 11.5 }}>
                    {rows.length} days
                  </span>
                )
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
                        <input
                          type="text"
                          className="ts-cell ts-cell-late"
                          value={row.late || ""}
                          placeholder="0"
                          disabled={readOnly}
                          aria-label={`${row.date}, minutes late`}
                          onChange={(e) => updateCell(row.day, "late", Number(e.target.value) || 0)}
                        />
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
          <div className={mismatch ? "text-warning" : "text-muted"} style={{ fontSize: 11 }}>
            {mismatch && <i className="fas fa-triangle-exclamation me-1"></i>}
            Sheet says {written}
          </div>
        )}
      </div>
    </div>
  );
}
