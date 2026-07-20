import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { DataCard, Table, Tr, Td, Badge, BtnPrimary, BtnSecondary, BtnDanger, FormField, SectionHeading } from "../../components/ui/index.jsx";
import { useTimesheets } from "../../context/TimesheetContext.jsx";

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
        <Link to="/timesheet" className="btn btn-dark btn-sm">
          <i className="fas fa-arrow-left"></i> Back to Timesheets
        </Link>
      </section>
    );
  }

  return <TimesheetReviewForm file={file} onBack={() => navigate("/timesheet")} onApprove={approveFile} />;
}

// TimesheetReviewForm — the sheet itself, once we know it exists.
function TimesheetReviewForm({ file, onBack, onApprove }) {
  const [rows, setRows] = useState(file.rows);
  const [employee, setEmployee] = useState(file.employee.name || "");
  const [period, setPeriod] = useState(file.period.label || "");
  const [periodConfirmed, setPeriodConfirmed] = useState(file.period.confirmed);

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
    !periodConfirmed && "Period Covered has not been confirmed.",
    file.employee.confidence < 0.85 && "The employee name was read with low confidence.",
    !file.signatures.client && "The client signature box appears to be empty.",
  ].filter(Boolean);

  function updateCell(day, field, value) {
    setRows((prev) => prev.map((r) => (r.day === day ? { ...r, [field]: value } : r)));
  }

  function cellClass(row, field) {
    return `ts-cell ${row.lowConfidence && row.lowConfidence.includes(field) ? "ts-cell-flagged" : ""}`;
  }

  return (
    <>
      <section>
        <div className="mt-4 d-flex flex-column flex-sm-row justify-content-between align-items-start gap-2">
          <div style={{ minWidth: 0 }}>
            <Link to="/timesheet" className="btn btn-link btn-sm p-0 text-decoration-none mb-1">
              <i className="fas fa-arrow-left me-1"></i> Back to uploads
            </Link>
            <h1 className="h4 fw-bold mb-1" style={{ overflowWrap: "anywhere" }}>
              {file.name}
            </h1>
            <div className="d-flex align-items-center flex-wrap gap-2">
              <Badge status={file.status} />
              <span className="badge rounded-pill bg-secondary bg-opacity-10 text-secondary fw-normal py-1">{file.source}</span>
              <span className="text-muted" style={{ fontSize: 12 }}>
                Form {file.formCode}
              </span>
            </div>
          </div>
        </div>
      </section>

      <hr className="my-3 opacity-25" />

      <section className="mb-4">
        <div className="row g-3">
          <div className="col-lg-5">
            <DataCard title="Scanned Sheet">
              <div className="card-body">
                <div className="ts-doc d-flex flex-column align-items-center justify-content-center text-muted rounded-3">
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

          <div className="col-lg-7">
            <DataCard title="Sheet Details">
              <div className="card-body">
                <SectionHeading>Who and when</SectionHeading>

                <div className="row g-3">
                  <div className="col-12 col-md-6">
                    <FormField label="Employee">
                      <select
                        className="form-select"
                        value={employee}
                        onChange={(e) => setEmployee(e.target.value)}
                        disabled={readOnly}
                      >
                        <option>Juan Dela Cruz</option>
                        <option>Maria Santos</option>
                        <option>Pedro Reyes</option>
                        <option>Ana Lim</option>
                      </select>
                    </FormField>
                    <div className="text-muted" style={{ fontSize: 11.5 }}>
                      Read from the sheet with {Math.round(file.employee.confidence * 100)}% confidence.
                    </div>
                  </div>

                  <div className="col-12 col-md-6">
                    <FormField label="Period Covered">
                      <input
                        type="text"
                        className={`form-control ${!periodConfirmed ? "ts-cell-flagged" : ""}`}
                        value={period}
                        onChange={(e) => setPeriod(e.target.value)}
                        disabled={readOnly}
                      />
                    </FormField>
                    {!readOnly && (
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="confirm-period"
                          checked={periodConfirmed}
                          onChange={(e) => setPeriodConfirmed(e.target.checked)}
                        />
                        <label className="form-check-label small" htmlFor="confirm-period">
                          I have checked this against the sheet
                        </label>
                      </div>
                    )}
                  </div>

                  <div className="col-12 col-md-6">
                    <FormField label="Sheet Half">
                      <input type="text" className="form-control" value={`Days ${file.half}`} disabled readOnly />
                    </FormField>
                    <div className="text-muted" style={{ fontSize: 11.5 }}>
                      Detected from the printed date column.
                    </div>
                  </div>

                  <div className="col-12 col-md-6">
                    <FormField label="Client">
                      <input type="text" className="form-control" value={file.client} disabled readOnly />
                    </FormField>
                  </div>
                </div>

                <SectionHeading>Signatures</SectionHeading>
                <div className="d-flex flex-wrap gap-3">
                  <SignatureItem signed={file.signatures.employee} label="Employee" />
                  <SignatureItem signed={file.signatures.supervisor} label="Supervisor" />
                  <SignatureItem signed={file.signatures.client} label="Client" />
                </div>
              </div>
            </DataCard>
          </div>
        </div>
      </section>

      {(blockers.length > 0 || mismatches.length > 0 || lowConfidenceCells > 0) && (
        <section className="mb-4">
          <DataCard title="Needs Attention">
            <div className="card-body">
              {lowConfidenceCells > 0 && (
                <div className="alert alert-warning py-2 small d-flex align-items-start gap-2 mb-3">
                  <i className="fas fa-triangle-exclamation mt-1"></i>
                  <span>
                    <strong>{lowConfidenceCells} cells</strong> were read with low confidence. They are highlighted in the grid below.
                  </span>
                </div>
              )}

              {mismatches.length > 0 && (
                <>
                  <SectionHeading>Totals do not match the sheet</SectionHeading>
                  <div className="row row-cols-1 row-cols-md-3 g-2 mb-3">
                    {mismatches.map((m) => (
                      <div className="col" key={m.label}>
                        <div className="border rounded-3 p-3 h-100">
                          <div className="text-uppercase text-muted fw-semibold mb-2" style={{ fontSize: 11, letterSpacing: 0.5 }}>
                            {m.label}
                          </div>
                          <div className="small">
                            Calculated <strong>{m.computed}</strong>
                          </div>
                          <div className="small text-muted">Written on sheet {m.written}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {blockers.length > 0 && (
                <>
                  <SectionHeading>Before this can be approved</SectionHeading>
                  <ul className="mb-0 ps-3 small text-muted">
                    {blockers.map((b) => (
                      <li key={b}>{b}</li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          </DataCard>
        </section>
      )}

      <section className="mb-4">
        <DataCard title="Daily Entries">
          <Table
            headers={["Date", "AM In", "AM Out", "PM In", "PM Out", "OT In", "OT Out", "Late (mins)", "Hours"]}
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
                  {["amIn", "amOut", "pmIn", "pmOut", "otIn", "otOut"].map((field) => (
                    <Td key={field}>
                      <input
                        type="text"
                        className={cellClass(row, field)}
                        value={row[field]}
                        placeholder="--:--"
                        disabled={readOnly}
                        onChange={(e) => updateCell(row.day, field, e.target.value)}
                      />
                    </Td>
                  ))}
                  <Td>
                    <input
                      type="text"
                      className="ts-cell"
                      value={row.late || ""}
                      placeholder="0"
                      disabled={readOnly}
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

      <section className="mb-4">
        <DataCard title="Sheet Totals">
          <div className="card-body row g-3">
            <TotalItem label="Days Worked" value={computed.days} written={hw.totalDays} />
            <TotalItem label="Regular Hours" value={computed.regular} />
            <TotalItem label="Overtime Hours" value={computed.overtime} written={hw.regOt} />
            <TotalItem label="Total Late" value={`${computed.late} mins`} written={hw.totalLate != null ? `${hw.totalLate} mins` : null} />
          </div>
        </DataCard>
      </section>

      {!readOnly && (
        <section className="mb-3 d-flex flex-column flex-sm-row gap-2">
          <BtnPrimary disabled={blockers.length > 0} onClick={() => onApprove(file.id, rows)}>
            <i className="fas fa-circle-check"></i> Approve Sheet
          </BtnPrimary>
          <BtnSecondary onClick={onBack}>Save and close</BtnSecondary>
          <BtnDanger className="ms-sm-auto">
            <i className="fas fa-rotate-left"></i> Reject and re-scan
          </BtnDanger>
        </section>
      )}
    </>
  );
}

// SignatureItem — whether ink was detected in one signature box.
function SignatureItem({ signed, label }) {
  return (
    <div className="d-flex align-items-center gap-2">
      <i className={`fas ${signed ? "fa-circle-check text-success" : "fa-circle-xmark text-danger"}`} style={{ fontSize: "0.8rem" }}></i>
      <span className="small">{label}</span>
    </div>
  );
}

// TotalItem — a calculated total, with the handwritten figure beneath it.
function TotalItem({ label, value, written }) {
  const mismatch = written != null && String(written) !== String(value);
  return (
    <div className="col-6 col-md-3">
      <div className="border rounded-3 p-3 h-100">
        <div className="text-uppercase text-muted fw-semibold mb-2" style={{ fontSize: 11, letterSpacing: 0.5 }}>
          {label}
        </div>
        <div className="fs-4 fw-bold">{value}</div>
        {written != null && (
          <div className={mismatch ? "text-warning" : "text-muted"} style={{ fontSize: 11.5 }}>
            {mismatch && <i className="fas fa-triangle-exclamation me-1"></i>}
            Sheet says {written}
          </div>
        )}
      </div>
    </div>
  );
}
