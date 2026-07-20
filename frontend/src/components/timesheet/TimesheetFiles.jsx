import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { DataCard, Table, Tr, Td, Badge, BtnSecondary, BtnDanger, Modal, ActionsMenu, FilterSelect, SearchInput } from "../ui/index.jsx";
import { useTimesheets } from "../../context/TimesheetContext.jsx";

// TimesheetFiles — uploaded sheets tab; owns its table and its own modals.
export function TimesheetFiles() {
  const navigate = useNavigate();
  const { files, retryFile, discardFile } = useTimesheets();

  const [retryTarget, setRetryTarget] = useState(null);
  const [discardTarget, setDiscardTarget] = useState(null);

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
            <FilterSelect label="Status">
              <option>All Statuses</option>
              <option>Needs Review</option>
              <option>Approved</option>
              <option>Processing</option>
              <option>Failed</option>
            </FilterSelect>
          </div>
          <div className="col-12 col-md-4">
            <FilterSelect label="Source">
              <option>All Sources</option>
              <option>Scan</option>
              <option>Photo</option>
            </FilterSelect>
          </div>
          <div className="col-12 col-md-4">
            <SearchInput label="Search Sheets" placeholder="Search file or employee" />
          </div>
        </div>
      </section>

      <section className="mb-3">
        <DataCard title="Uploaded Sheets">
          {files.length === 0 ? (
            <div className="text-center text-muted py-5 small">No sheets uploaded for this client and pay period yet.</div>
          ) : (
            <Table headers={["Sheet", "Employee", "Sheet Period", "Status", "Actions"]} itemLabel="sheets" pageSize={10} mobilePageSize={4}>
              {files.map((f) => (
                <Tr key={f.id}>
                  <Td>
                    <div className="fw-semibold text-truncate" style={{ maxWidth: 440 }} title={f.name}>
                      {f.name}
                    </div>
                    <div className="text-muted" style={{ fontSize: 11.5 }}>
                      {f.source} &middot; {f.uploaded}
                    </div>
                  </Td>

                  <Td>
                    {f.employee.name ? (
                      <>
                        <div className="fw-semibold">{f.employee.name}</div>
                        <div className={f.employee.confidence < 0.85 ? "text-warning" : "text-muted"} style={{ fontSize: 11.5 }}>
                          {f.employee.confidence < 0.85 ? "Needs confirming" : "Matched"}
                        </div>
                      </>
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
                        f.status === "Approved" && { label: "View sheet", icon: "fa-eye", onClick: () => navigate(`/timesheet/${f.id}`) },
                        f.status === "Failed" && {
                          label: "Retry extraction",
                          icon: "fa-rotate-left",
                          modalTarget: "timesheetRetryModal",
                          onClick: () => setRetryTarget(f),
                        },
                        { label: "Download original", icon: "fa-download" },
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
          )}
        </DataCard>
      </section>

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
            <p className="text-muted small mb-0">{retryTarget?.failureReason}</p>
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
