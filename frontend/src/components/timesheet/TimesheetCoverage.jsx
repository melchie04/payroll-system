import { DataCard, Table, Tr, Td, Badge } from "../ui/index.jsx";

// TimesheetCoverage — which employees have approved days for the selected period.
// A gap means paperwork is missing, not that the person did not work.
export function TimesheetCoverage({ rows, period }) {
  const covered = rows.filter((r) => !r.gap).length;
  const complete = covered === rows.length;

  return (
    <section className="mb-3">
      <DataCard
        title="Period Coverage"
        action={
          <span className={`badge rounded-pill status-badge ${complete ? "status-badge-success" : "status-badge-warning"}`}>
            {covered} of {rows.length} covered
          </span>
        }
      >
        <div className="card-body pb-2">
          <div className="d-flex align-items-start gap-3">
            <div
              className={`d-flex align-items-center justify-content-center flex-shrink-0 rounded-3 ${
                complete ? "bg-success bg-opacity-10 text-success" : "bg-warning bg-opacity-10 text-warning"
              }`}
              style={{ width: 40, height: 40, fontSize: 15 }}
            >
              <i className={`fas ${complete ? "fa-circle-check" : "fa-triangle-exclamation"}`}></i>
            </div>
            <div style={{ minWidth: 0 }}>
              <div className="fw-semibold mb-1">{period}</div>
              <p className="text-muted small mb-0">
                Payroll collects approved days only, so any employee with a gap below will be missing hours from the run.
              </p>
            </div>
          </div>
        </div>

        {rows.length === 0 ? (
          <div className="text-center text-muted py-5 small">No employees assigned to this client yet.</div>
        ) : (
          <Table headers={["Employee", "Client", "Sheets", "Days Covered", "Status"]} itemLabel="employees" pageSize={10} mobilePageSize={4}>
            {rows.map((r) => (
              <Tr key={r.id}>
                <Td bold>{r.employee}</Td>
                <Td>{r.client}</Td>
                <Td>{r.sheets}</Td>
                <Td>
                  {r.covered || <span className="text-muted">&mdash;</span>}
                  {r.gap && (
                    <div className="text-warning" style={{ fontSize: 11.5 }}>
                      Missing {r.gap}
                    </div>
                  )}
                </Td>
                <Td>
                  <Badge status={r.gap ? "Not Covered" : "Covered"} />
                </Td>
              </Tr>
            ))}
          </Table>
        )}
      </DataCard>
    </section>
  );
}
