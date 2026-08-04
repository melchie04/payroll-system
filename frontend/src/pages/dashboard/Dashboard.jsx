// Dashboard: headline figures, payroll status and recent activity.

import { Link } from "react-router";
import { StatCard, DataCard, Table, Tr, Td, Badge, PageHeader } from "../../components/ui/index.jsx";
import { payPeriods, sheetPeriods } from "../../assets/data/index.js";
import { formatCurrency } from "../../utils/currency.js";
import { computeDeductions } from "../../utils/payslip.js";
import { buildPayrollRows } from "../../utils/payrollRun.js";
import { billableFor } from "../../utils/billing.js";
import { useClients } from "../../context/hooks.js";
import { useEmployees } from "../../context/hooks.js";
import { useTimesheets } from "../../context/hooks.js";
import { useInvoices } from "../../context/hooks.js";
import { usePayroll } from "../../context/hooks.js";
import { useActivity } from "../../context/hooks.js";

const SEGMENTS = [
  { label: "Ready", colour: "var(--bs-success)" },
  { label: "Pending", colour: "var(--bs-warning)" },
  { label: "Paid", colour: "var(--bs-primary)" },
];

const MODULE_ICON = {
  Payroll: "\ud83d\udcb3",
  Billing: "\ud83e\uddfe",
  Timesheet: "\ud83d\udcc4",
  Employees: "\ud83d\udc64",
  Clients: "\ud83c\udfe2",
  Settings: "\u2699\ufe0f",
  Auth: "\ud83d\udd10",
};

// Pulls figures from every context into one overview.
export default function Dashboard() {
  const { clients } = useClients();
  const { employees } = useEmployees();
  const { files } = useTimesheets();
  const { invoices } = useInvoices();
  const { overrides } = usePayroll();
  const { entries } = useActivity();

  const period = payPeriods[0];
  const rows = buildPayrollRows({ period, employees, files, clients, overrides });

  const unbilled = clients.reduce((total, client) => {
    return (
      total +
      sheetPeriods.reduce((clientTotal, label) => {
        const alreadyInvoiced = invoices.some((inv) => inv.clientCode === client.code && inv.period === label);
        if (alreadyInvoiced) return clientTotal;
        const due = billableFor({ files, client, periodLabel: label, roster: employees, clients });
        return clientTotal + (due.ready ? due.total : 0);
      }, 0)
    );
  }, 0);

  const pendingPayroll = rows.filter((r) => r.status !== "Paid").reduce((sum, r) => sum + r.gross, 0);
  const overdue = invoices.filter((inv) => inv.status === "Overdue");
  const overdueTotal = overdue.reduce((sum, inv) => sum + Number(String(inv.amount).replace(/[^\d.]/g, "")), 0);
  const activeClients = clients.filter((c) => c.status === "Active");

  const stats = [
    { to: "/clients", label: "Active Clients", value: String(activeClients.length), icon: "fa-building", sub: `${clients.length} on file` },
    {
      to: "/payroll",
      label: "Pending Payroll",
      value: formatCurrency(pendingPayroll),
      sub: `For ${rows.filter((r) => r.status !== "Paid").length} employees`,
    },
    {
      to: "/billing",
      label: "Unbilled Amount",
      value: formatCurrency(unbilled),
      icon: "fa-file-invoice-dollar",
      sub: "Approved work not yet invoiced",
    },
    {
      to: "/billing",
      label: "Overdue Invoices",
      value: formatCurrency(overdueTotal),
      sub: `For ${overdue.length} invoice${overdue.length === 1 ? "" : "s"}`,
      valueColor: "var(--bs-danger)",
    },
  ];

  const total = rows.length;
  const slices = SEGMENTS.map((segment) => {
    const count = rows.filter((r) => r.status === segment.label).length;
    return { ...segment, count, pct: total > 0 ? (count / total) * 100 : 0 };
  });

  const ring = slices.map((slice, i) => ({
    ...slice,
    dash: `${slice.pct} ${100 - slice.pct}`,
    offset: -slices.slice(0, i).reduce((sum, s) => sum + s.pct, 0),
  }));

  const recent = entries.slice(0, 5);

  return (
    <>
      <section>
        <div className="mt-4">
          <PageHeader title="Dashboard" description="Here's what's happening with your business today." />
        </div>
      </section>

      <hr className="my-3 opacity-25" />

      <section className="mb-4">
        <div className="row g-3">
          {stats.map((s) => (
            <div className="col-xl-3 col-md-6" key={s.label}>
              <Link to={s.to} className="text-decoration-none text-reset d-block h-100">
                <StatCard label={s.label} value={s.value} sub={s.sub} valueColor={s.valueColor} icon={s.icon} />
              </Link>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-4">
        <div className="row g-3">
          <div className="col-xl-5">
            <DataCard title="Payroll Status Overview">
              <div className="card-body d-flex justify-content-center align-items-center flex-wrap gap-4 mx-2">
                <div className="position-relative flex-shrink-0" style={{ width: 140, height: 140 }}>
                  <svg width="140" height="140" viewBox="0 0 42 42" style={{ transform: "rotate(-90deg)" }}>
                    <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="var(--app-chart-track)" strokeWidth="4.2" />
                    {ring.map((arc) => (
                      <circle
                        key={arc.label}
                        cx="21"
                        cy="21"
                        r="15.915"
                        fill="transparent"
                        stroke={arc.colour}
                        strokeWidth="4.2"
                        strokeDasharray={arc.dash}
                        strokeDashoffset={arc.offset}
                      />
                    ))}
                  </svg>
                  <div className="position-absolute top-50 start-50 translate-middle text-center">
                    <div className="lh-1 fw-bold text-body" style={{ fontSize: "var(--app-fs-7)", letterSpacing: "-0.5px" }}>
                      {total}
                    </div>
                    <div className="app-label fw-bold mt-1">Total</div>
                  </div>
                </div>
                <div className="d-flex flex-column gap-2 flex-grow-1" style={{ minWidth: "180px" }}>
                  {ring.map((arc) => (
                    <div className="d-flex align-items-center justify-content-between py-1 border-bottom" key={arc.label}>
                      <div className="d-flex align-items-center gap-2">
                        <span
                          className="d-inline-block flex-shrink-0"
                          style={{ width: 10, height: 10, borderRadius: "50%", background: arc.colour }}
                        />
                        <span className="text-secondary" style={{ fontSize: "var(--app-fs-3)" }}>
                          {arc.label}
                        </span>
                      </div>
                      <div className="text-end ps-3">
                        <span className="fw-semibold text-body" style={{ fontSize: "var(--app-fs-3)" }}>
                          {arc.count}
                        </span>
                        <span className="text-muted ms-1" style={{ fontSize: "var(--app-fs-1)" }}>
                          ({Math.round(arc.pct)}%)
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </DataCard>
          </div>
          <div className="col-xl-7">
            <DataCard
              title="Recent Activity"
              action={
                <Link to="/activity-log" className="small text-muted">
                  View all
                </Link>
              }
            >
              {recent.length === 0 ? (
                <div className="text-center text-muted py-5 small">Nothing has happened yet.</div>
              ) : (
                <div className="list-group list-group-flush">
                  {recent.map((entry) => (
                    <div className="list-group-item d-flex align-items-start gap-3 py-3 py-md-2" key={entry.id}>
                      <div
                        className="d-flex align-items-center justify-content-center flex-shrink-0 border rounded-2 bg-light text-secondary"
                        style={{ width: "var(--app-icon-md)", height: "var(--app-icon-md)", fontSize: "var(--app-fs-4)" }}
                      >
                        {MODULE_ICON[entry.module] || "\ud83d\udcdd"}
                      </div>
                      <div className="flex-grow-1">
                        <div className="d-flex justify-content-between align-items-start gap-2 mb-1">
                          <div className="small text-body lh-sm">
                            <span>{entry.action} </span>
                            <strong className="fw-semibold">{entry.user}</strong>
                          </div>
                          <div className="text-muted text-nowrap" style={{ fontSize: "var(--app-fs-1)", marginTop: "1px" }}>
                            {entry.timestamp}
                          </div>
                        </div>
                        <div className="text-muted" style={{ fontSize: "var(--app-fs-2)", lineHeight: "1.4" }}>
                          {entry.detail}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </DataCard>
          </div>
        </div>
      </section>

      <section className="mb-3">
        <DataCard
          title="Upcoming Payroll"
          action={
            <Link to="/payroll" className="small text-muted">
              View all
            </Link>
          }
        >
          {rows.length === 0 ? (
            <div className="text-center text-muted py-5 small">No employees are deployed for this pay period.</div>
          ) : (
            <Table headers={["Employee", "Client", "Pay Period", "Status", "Gross Pay", "Net Pay"]} itemLabel="payroll runs">
              {rows.map((row) => (
                <Tr key={row.key}>
                  <Td bold>
                    <Link to={`/payroll/${row.employeeId}`} className="fw-semibold text-decoration-none">
                      {row.name}
                    </Link>
                  </Td>
                  <Td>{row.client}</Td>
                  <Td>{row.period}</Td>
                  <Td>
                    <Badge status={row.status} />
                  </Td>
                  <Td>{formatCurrency(row.gross)}</Td>
                  <Td>{formatCurrency(computeDeductions(row.gross).net)}</Td>
                </Tr>
              ))}
            </Table>
          )}
        </DataCard>
      </section>
    </>
  );
}
