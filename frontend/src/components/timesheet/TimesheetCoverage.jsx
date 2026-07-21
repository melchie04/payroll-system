import { DataCard, Table, Tr, Td, Badge } from "../ui/index.jsx";

// TimesheetCoverage — which employees have approved days for the selected period.
// A gap means paperwork is missing, not that the person did not work.
// Rows arrive already scoped to the client and pay period chosen on the page.
export function TimesheetCoverage({ rows = [], period }) {
  const covered = rows.filter((r) => !r.gap).length;
  const gaps = rows.length - covered;
  const complete = covered === rows.length;
  const sheets = rows.reduce((sum, r) => sum + r.sheets, 0);

  const stats = [
    { label: "Employees", value: rows.length },
    { label: "Sheets Received", value: sheets },
    { label: "With Gaps", value: gaps, color: gaps > 0 ? "#d97706" : "#16a34a" },
  ];

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
          <div className="row g-2">
            <div className="col-6 col-md-3">
              <div className="border rounded-3 bg-light p-2 px-3 h-100 d-flex flex-column justify-content-between">
                <div className="text-muted fw-semibold" style={{ fontSize: 12 }}>
                  Pay Period
                </div>
                <div className="fw-bold mt-auto" style={{ fontSize: "0.95rem", lineHeight: 1.4 }}>
                  {period}
                </div>
              </div>
            </div>
            {stats.map((s) => (
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
          <p className="text-muted small mb-0 mt-2">
            Payroll collects approved days only, so any employee with a gap below will be missing hours from the run.
          </p>
        </div>

        {rows.length === 0 ? (
          <div className="text-center text-muted py-5 small">No employees to show for this client and pay period.</div>
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
