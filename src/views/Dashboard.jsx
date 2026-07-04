import {
  StatCard,
  DataCard,
  Table,
  Tr,
  Td,
  Badge,
  PageHeader,
} from "../components/ui/index.jsx";
import { Link } from "react-router-dom";
import {
  dashboardStats,
  payrollStatusData,
  recentActivity,
  upcomingPayroll,
} from "../data/index.js";

export default function Dashboard() {
  return (
    <>
      {/* ========================================================== */}
      {/* DIVISION 1: HEADER                                         */}
      {/* ========================================================== */}
      <section>
        <div className="mt-4">
          <PageHeader
            title="Dashboard"
            description="Here's what's happening with your business today."
          />
        </div>
      </section>

      {/* LINE DIVIDER */}
      <hr className="my-3 opacity-25" />

      {/* ========================================================== */}
      {/* DIVISION 2: STATUS CARDS                                   */}
      {/* ========================================================== */}
      <section>
        <div className="row g-3">
          {dashboardStats.map((s) => (
            <div className="col-xl-3 col-md-6" key={s.label}>
              <StatCard {...s} />
            </div>
          ))}
        </div>
      </section>

      {/* LINE DIVIDER */}
      <hr className="my-3 opacity-25" />

      {/* ========================================================== */}
      {/* DIVISION 3: DATA CARDS                                     */}
      {/* ========================================================== */}
      <section>
        <div className="row g-3">
          <div className="col-xl-5">
            <DataCard title="Payroll Status Overview">
              <div className="card-body d-flex justify-content-center align-items-center flex-wrap gap-4 mx-2">
                {/* SVG Donut Chart Section */}
                <div
                  className="position-relative flex-shrink-0"
                  style={{ width: 140, height: 140 }}
                >
                  <svg
                    width="140"
                    height="140"
                    viewBox="0 0 42 42"
                    style={{ transform: "rotate(-90deg)" }}
                  >
                    {/* Background Track */}
                    <circle
                      cx="21"
                      cy="21"
                      r="15.915"
                      fill="transparent"
                      stroke="#f3f4f6"
                      strokeWidth="4.2"
                    />
                    {/* Segment 1: On Track (50%) - Green */}
                    <circle
                      cx="21"
                      cy="21"
                      r="15.915"
                      fill="transparent"
                      stroke="#10b981"
                      strokeWidth="4.2"
                      strokeDasharray="50 50"
                      strokeDashoffset="0"
                    />
                    {/* Segment 2: At Risk (29%) - Orange */}
                    <circle
                      cx="21"
                      cy="21"
                      r="15.915"
                      fill="transparent"
                      stroke="#f59e0b"
                      strokeWidth="4.2"
                      strokeDasharray="29 71"
                      strokeDashoffset="-50"
                    />
                    {/* Segment 3: Delayed (13%) - Red */}
                    <circle
                      cx="21"
                      cy="21"
                      r="15.915"
                      fill="transparent"
                      stroke="#ef4444"
                      strokeWidth="4.2"
                      strokeDasharray="13 87"
                      strokeDashoffset="-79"
                    />
                    {/* Segment 4: Completed (8%) - Blue */}
                    <circle
                      cx="21"
                      cy="21"
                      r="15.915"
                      fill="transparent"
                      stroke="#3b82f6"
                      strokeWidth="4.2"
                      strokeDasharray="8 92"
                      strokeDashoffset="-92"
                    />
                  </svg>
                  {/* Center Content Indicator */}
                  <div className="position-absolute top-50 start-50 translate-middle text-center">
                    <div
                      className="lh-1 fw-extrabold text-dark"
                      style={{ fontSize: "1.6rem", letterSpacing: "-0.5px" }}
                    >
                      24
                    </div>
                    <div
                      className="text-uppercase text-muted fw-bold mt-1"
                      style={{ fontSize: "10px", letterSpacing: "0.5px" }}
                    >
                      Total
                    </div>
                  </div>
                </div>
                <div
                  className="d-flex flex-column gap-2 flex-grow-1"
                  style={{ minWidth: "180px" }}
                >
                  {payrollStatusData.map((row) => {
                    const colorMap = {
                      "On Track": "#10b981",
                      "At Risk": "#f59e0b",
                      Delayed: "#ef4444",
                      Completed: "#3b82f6",
                    };
                    const segmentColor = colorMap[row.label] || row.color;

                    return (
                      <div
                        className="d-flex align-items-center justify-content-between py-1 border-bottom border-light-subtle"
                        key={row.label}
                      >
                        <div className="d-flex align-items-center gap-2">
                          <span
                            className="d-inline-block flex-shrink-0"
                            style={{
                              width: 10,
                              height: 10,
                              borderRadius: "50%",
                              background: segmentColor,
                            }}
                          />
                          <span
                            className="text-secondary fw-medium"
                            style={{ fontSize: "13px" }}
                          >
                            {row.label}
                          </span>
                        </div>
                        <div className="text-end ps-3">
                          <span
                            className="fw-semibold text-dark"
                            style={{ fontSize: "13px" }}
                          >
                            {row.count}
                          </span>
                          <span
                            className="text-muted ms-1"
                            style={{ fontSize: "11.5px" }}
                          >
                            ({row.pct})
                          </span>
                        </div>
                      </div>
                    );
                  })}
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
              <div className="list-group list-group-flush">
                {recentActivity.map((act, i) => (
                  <div
                    className="list-group-item d-flex align-items-start gap-3 py-3 py-md-2"
                    key={i}
                  >
                    <div
                      className="d-flex align-items-center justify-content-center flex-shrink-0 border rounded-2 bg-light text-secondary"
                      style={{ width: 36, height: 36, fontSize: 14 }}
                    >
                      {act.icon}
                    </div>
                    <div className="flex-grow-1">
                      <div className="d-flex justify-content-between align-items-start gap-2 mb-1">
                        <div className="small text-dark lh-sm">
                          <span>{act.title} </span>
                          <strong className="fw-semibold">{act.bold}</strong>
                        </div>
                        <div
                          className="text-muted text-nowrap"
                          style={{ fontSize: "11px", marginTop: "1px" }}
                        >
                          {act.time}
                        </div>
                      </div>
                      <div
                        className="text-muted"
                        style={{ fontSize: "12px", lineHeight: "1.4" }}
                      >
                        {act.sub}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </DataCard>
          </div>
        </div>
      </section>

      {/* LINE DIVIDER */}
      <hr className="my-3 opacity-25" />

      {/* ========================================================== */}
      {/* DIVISION 4: TABLES                                         */}
      {/* ========================================================== */}
      <section className="mb-3">
        <DataCard title="Upcoming Payroll">
          <Table
            headers={[
              "Employee",
              "Client",
              "Pay Period",
              "Status",
              "Gross Pay",
              "Net Pay",
            ]}
          >
            {upcomingPayroll.map((row, i) => (
              <Tr key={i}>
                <Td>{row.employee}</Td>
                <Td>{row.client}</Td>
                <Td>{row.period}</Td>
                <Td>
                  <Badge status={row.status} />
                </Td>
                <Td>{row.grossPay}</Td>
                <Td>{row.netPay}</Td>
              </Tr>
            ))}
          </Table>
        </DataCard>
      </section>
    </>
  );
}
