import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { DataCard, Table, Tr, Td, Badge, BtnSecondary, BtnDanger, Modal, ActionsMenu, FilterSelect, SearchInput } from "../ui/index.jsx";
import { useTimesheets, findDuplicateSheets, isSheetClean, sheetTotals } from "../../context/TimesheetContext.jsx";

const ALL_STATUSES = "All Statuses";
const ALL_SOURCES = "All Sources";
const STATUS_OPTIONS = ["Needs Review", "Approved", "Processing", "Rejected", "Failed"];
const SOURCE_OPTIONS = ["Scan", "Photo"];

// TimesheetFiles — uploaded sheets tab; owns its table and its own modals.
// The list arrives already scoped to the client and pay period chosen on the page,
// and is narrowed further by the three filters below.
export function TimesheetFiles({ files = [] }) {
  const navigate = useNavigate();
  const { files: allFiles, retryFile, discardFile, approveMany } = useTimesheets();

  const [status, setStatus] = useState(ALL_STATUSES);
  const [source, setSource] = useState(ALL_SOURCES);
  const [search, setSearch] = useState("");

  const [retryTarget, setRetryTarget] = useState(null);
  const [discardTarget, setDiscardTarget] = useState(null);
  const [bulkConfirmed, setBulkConfirmed] = useState(false);

  const visible = useMemo(() => {
    const query = search.trim().toLowerCase();
    return files.filter((f) => {
      if (status !== ALL_STATUSES && f.status !== status) return false;
      if (source !== ALL_SOURCES && f.source !== source) return false;
      if (!query) return true;
      return `${f.name} ${f.employee?.name || ""}`.toLowerCase().includes(query);
    });
  }, [files, status, source, search]);

  const filtered = visible.length !== files.length;

  // Sheets awaiting review with nothing flagged on them at all. Opening each one
  // would show an empty Needs Attention card, so the reviewer is offered the batch.
  const clean = useMemo(() => visible.filter((f) => isSheetClean(f, allFiles)), [visible, allFiles]);

  // The stored preview is the uploaded file itself, so the download is the original
  // document rather than anything regenerated from it.
  function downloadOriginal(f) {
    if (!f.previewUrl) return;
    const link = document.createElement("a");
    link.href = f.previewUrl;
    link.download = f.name;
    document.body.appendChild(link);
    link.click();
    link.remove();
  }

  function handleBulkApprove() {
    approveMany(clean.map((f) => f.id));
    setBulkConfirmed(false);
    document.getElementById("timesheetBulkClose")?.click();
  }

  // Sheets that carry days already covered elsewhere for the same person. Checked
  // against every sheet on file, not just the ones the filters are showing, so
  // narrowing the list cannot hide a clash.
  const duplicates = useMemo(() => {
    const map = new Map();
    for (const f of files) {
      const clashes = findDuplicateSheets(allFiles, f, null);
      if (clashes.length > 0) map.set(f.id, clashes);
    }
    return map;
  }, [files, allFiles]);

  function handleRetry() {
    if (retryTarget) {
      retryFile(retryTarget.id);
      setRetryTarget(null);
    }
    document.getElementById("timesheetRetryClose")?.click();
  }

  function handleDiscard() {
    if (discardTarget) {
      discardFile(discardTarget.id);
      setDiscardTarget(null);
    }
    document.getElementById("timesheetDiscardClose")?.click();
  }

  return (
    <>
      <section className="mb-4">
        <div className="row g-3 align-items-end">
          <div className="col-12 col-md-4">
            <FilterSelect label="Status" value={status} onChange={(e) => setStatus(e.target.value)}>
              <option>{ALL_STATUSES}</option>
              {STATUS_OPTIONS.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </FilterSelect>
          </div>
          <div className="col-12 col-md-4">
            <FilterSelect label="Source" value={source} onChange={(e) => setSource(e.target.value)}>
              <option>{ALL_SOURCES}</option>
              {SOURCE_OPTIONS.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </FilterSelect>
          </div>
          <div className="col-12 col-md-4">
            <SearchInput
              label="Search Sheets"
              placeholder="Search file or employee"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </section>

      <section className="mb-3">
        <DataCard
          title="Uploaded Sheets"
          action={
            <span className="text-muted" style={{ fontSize: 11.5 }}>
              {filtered ? `${visible.length} of ${files.length} sheets` : `${files.length} sheet${files.length === 1 ? "" : "s"}`}
            </span>
          }
        >
          {files.length === 0 ? (
            <div className="text-center text-muted py-5 small">No sheets uploaded for this client and pay period yet.</div>
          ) : visible.length === 0 ? (
            <div className="text-center text-muted py-5 small">
              <div>No sheets match the filters above.</div>
              <BtnSecondary
                className="mt-3"
                onClick={() => {
                  setStatus(ALL_STATUSES);
                  setSource(ALL_SOURCES);
                  setSearch("");
                }}
              >
                <i className="fas fa-rotate-left"></i> Clear Filters
              </BtnSecondary>
            </div>
          ) : (
            <>
              {clean.length > 0 && (
                <div className="ts-notice ts-notice-success d-flex flex-column flex-sm-row align-items-sm-center gap-2 gap-sm-3 mx-3 mt-3 mb-3 py-2 px-3">
                  <i className="fas fa-circle-check ts-notice-icon flex-shrink-0"></i>
                  <div className="flex-grow-1" style={{ fontSize: "0.8125rem" }}>
                    <strong>
                      {clean.length} sheet{clean.length === 1 ? "" : "s"} with nothing flagged
                    </strong>
                    <div className="ts-notice-sub" style={{ fontSize: 11.5 }}>
                      Names matched, signatures present, totals agree with the handwritten figures.
                    </div>
                  </div>
                  <BtnSecondary
                    className="flex-shrink-0"
                    data-bs-toggle="modal"
                    data-bs-target="#timesheetBulkModal"
                    onClick={() => setBulkConfirmed(false)}
                  >
                    <i className="fas fa-circle-check"></i> Review and Approve
                  </BtnSecondary>
                </div>
              )}

              <Table headers={["Sheet", "Uploaded", "Employee", "Sheet Period", "Status", "Actions"]} itemLabel="sheets" pageSize={10} mobilePageSize={4}>
                {visible.map((f) => (
                  <Tr key={f.id}>
                    <Td>
                      <div className="fw-semibold text-truncate" style={{ maxWidth: 440 }} title={f.name}>
                        {f.name}
                      </div>
                      {f.rejection && (
                        <div
                          className="text-danger d-flex align-items-center gap-1 text-truncate"
                          style={{ fontSize: 11.5, maxWidth: 440 }}
                          title={[f.rejection.reasons.join(" · "), f.rejection.note].filter(Boolean).join(" — ")}
                        >
                          <i className="fas fa-rotate-left flex-shrink-0"></i>
                          <span className="text-truncate">
                            {f.rejection.reasons[0] || f.rejection.note || "Sent back to be re-scanned"}
                            {f.rejection.reasons.length > 1 && ` +${f.rejection.reasons.length - 1} more`}
                          </span>
                        </div>
                      )}
                      {duplicates.has(f.id) && (
                        <div
                          className="ts-warn d-flex align-items-center gap-1"
                          style={{ fontSize: 11.5 }}
                          title={`Same days as ${duplicates
                            .get(f.id)
                            .map((d) => d.name)
                            .join(", ")}`}
                        >
                          <i className="fas fa-clone"></i>
                          Duplicate days
                        </div>
                      )}
                    </Td>

                    <Td>{f.uploaded}</Td>

                    <Td>
                      {f.employee.name ? (
                        <div className="fw-semibold">{f.employee.name}</div>
                      ) : (
                        <span className="text-muted">Not identified yet</span>
                      )}
                    </Td>

                    <Td>{f.period.label || <span className="text-muted">&mdash;</span>}</Td>

                    <Td>
                      <Badge status={f.status} />
                    </Td>

                    <Td>
                      <ActionsMenu
                        items={[
                          f.status === "Needs Review" && {
                            label: "Review sheet",
                            icon: "fa-list-check",
                            onClick: () => navigate(`/timesheet/${f.id}`),
                          },
                          (f.status === "Approved" || f.status === "Rejected") && {
                            label: "View sheet",
                            icon: "fa-eye",
                            onClick: () => navigate(`/timesheet/${f.id}`),
                          },
                          f.status === "Rejected" && {
                            label: "Read again",
                            icon: "fa-rotate-left",
                            modalTarget: "timesheetRetryModal",
                            onClick: () => setRetryTarget(f),
                          },
                          f.status === "Failed" && {
                            label: "Retry extraction",
                            icon: "fa-rotate-left",
                            modalTarget: "timesheetRetryModal",
                            onClick: () => setRetryTarget(f),
                          },
                          {
                            label: "Download original",
                            icon: "fa-download",
                            disabled: !f.previewUrl,
                            title: f.previewUrl ? `Save ${f.name}` : "The original file is not stored for this sheet",
                            onClick: () => downloadOriginal(f),
                          },
                          { divider: true },
                          {
                            label: "Discard sheet",
                            icon: "fa-trash",
                            danger: true,
                            modalTarget: "timesheetDiscardModal",
                            onClick: () => setDiscardTarget(f),
                          },
                        ].filter(Boolean)}
                      />
                    </Td>
                  </Tr>
                ))}
              </Table>
            </>
          )}
        </DataCard>
      </section>

      <Modal
        id="timesheetBulkModal"
        title={`Approve ${clean.length} Sheet${clean.length === 1 ? "" : "s"}`}
        footer={
          <>
            <BtnSecondary id="timesheetBulkClose" data-bs-dismiss="modal">
              Cancel
            </BtnSecondary>
            <button
              type="button"
              className="btn btn-dark btn-sm d-inline-flex align-items-center gap-2"
              disabled={!bulkConfirmed || clean.length === 0}
              onClick={handleBulkApprove}
            >
              <i className="fas fa-circle-check"></i> Approve {clean.length} Sheet{clean.length === 1 ? "" : "s"}
            </button>
          </>
        }
      >
        <p className="text-muted small mb-3">
          Nothing was flagged on these sheets. Check the period on each one against the paper before approving — it is the only line that says
          which month the days belong to.
        </p>

        <div className="border rounded-3 overflow-hidden mb-3">
          <div className="list-group list-group-flush">
            {clean.map((f) => {
              const totals = sheetTotals(f.rows);
              return (
                <div className="list-group-item px-3 py-2" key={f.id}>
                  <div className="d-flex flex-wrap align-items-baseline gap-2">
                    <span className="fw-semibold" style={{ fontSize: "0.8125rem" }}>
                      {f.employee.name}
                    </span>
                    <span className="text-muted" style={{ fontSize: 11.5 }}>
                      {f.client}
                    </span>
                  </div>
                  <div className="text-muted" style={{ fontSize: 11.5 }}>
                    {f.period.label} · {totals.days} days · {totals.regular} hrs
                    {totals.late > 0 && ` · ${totals.late} mins late`}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <label className="d-flex align-items-center gap-2 mb-0" style={{ cursor: "pointer" }}>
          <input
            className="form-check-input flex-shrink-0 mt-0"
            type="checkbox"
            checked={bulkConfirmed}
            onChange={(e) => setBulkConfirmed(e.target.checked)}
          />
          <span style={{ fontSize: "0.8125rem" }}>I have checked the Period Covered on each sheet above</span>
        </label>
      </Modal>

      <Modal
        id="timesheetRetryModal"
        title="Retry Extraction"
        footer={
          <>
            <BtnSecondary id="timesheetRetryClose" data-bs-dismiss="modal">
              Cancel
            </BtnSecondary>
            <button type="button" className="btn btn-dark btn-sm d-inline-flex align-items-center gap-2" onClick={handleRetry}>
              <i className="fas fa-rotate-left"></i> Retry
            </button>
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
              Read <strong>{retryTarget?.name}</strong> again?
            </p>
            <p className="text-muted small mb-0">
              {retryTarget?.failureReason ||
                [retryTarget?.rejection?.reasons.join(" · "), retryTarget?.rejection?.note].filter(Boolean).join(" — ") ||
                "The sheet will be read again from the uploaded document."}
            </p>
          </div>
        </div>
      </Modal>

      <Modal
        id="timesheetDiscardModal"
        title="Discard Sheet"
        footer={
          <>
            <BtnSecondary id="timesheetDiscardClose" data-bs-dismiss="modal">
              Cancel
            </BtnSecondary>
            <BtnDanger onClick={handleDiscard}>
              <i className="fas fa-trash"></i> Discard Sheet
            </BtnDanger>
          </>
        }
      >
        <div className="d-flex align-items-start gap-3">
          <div
            className="d-flex align-items-center justify-content-center flex-shrink-0 rounded-3 bg-danger bg-opacity-10 text-danger"
            style={{ width: 40, height: 40, fontSize: 15 }}
          >
            <i className="fas fa-triangle-exclamation"></i>
          </div>
          <div style={{ minWidth: 0 }}>
            <p className="mb-1" style={{ overflowWrap: "anywhere" }}>
              Discard <strong>{discardTarget?.name}</strong>?
            </p>
            <p className="text-muted small mb-0">
              The uploaded document and anything read from it will be removed. This action cannot be undone.
            </p>
          </div>
        </div>
      </Modal>
    </>
  );
}
