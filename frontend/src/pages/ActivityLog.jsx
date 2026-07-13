import { DataCard, Table, Tr, Td, FilterSelect, SearchInput, ExportMenu, PageHeader, Pagination } from "../components/ui/index.jsx";
import { activityLog } from "../assets/data/index.js";
import { exportToCsv } from "../utils/exportToCsv.js";

const moduleVariant = {
  Payroll: "primary",
  Billing: "success",
  Timesheet: "warning",
  Employees: "secondary",
  Clients: "secondary",
  Settings: "dark",
  Auth: "danger",
};

export default function ActivityLog() {
  function handleExportAll() {
    exportToCsv(
      "activity-log",
      ["User", "Action", "Details", "Module", "Timestamp"],
      activityLog.map((log) => [log.user, log.action, log.detail, log.module, log.timestamp]),
    );
  }

  return (
    <>
      {/* ========================================================== */}
      {/* DIVISION 1: HEADER                                         */}
      {/* ========================================================== */}
      <section>
        <div className="mt-4">
          <PageHeader
            title="Activity Log"
            description="Track every action taken across your payroll system."
            actions={<ExportMenu onExportCsv={handleExportAll} />}
          />
        </div>
      </section>

      {/* LINE DIVIDER */}
      <hr className="my-3 opacity-25" />

      {/* ========================================================== */}
      {/* DIVISION 2: CONTROLS                                       */}
      {/* ========================================================== */}
      <section>
        <div className="row g-3 align-items-end mb-4">
          <div className="col-12 col-md-4">
            <FilterSelect label="Module">
              <option>All Modules</option>
              <option>Payroll</option>
              <option>Billing</option>
              <option>Timesheet</option>
              <option>Employees</option>
              <option>Clients</option>
              <option>Settings</option>
              <option>Auth</option>
            </FilterSelect>
          </div>
          <div className="col-12 col-md-4">
            <FilterSelect label="User">
              <option>All Users</option>
              <option>Admin</option>
              <option>Sarah Lee</option>
              <option>Michael Brown</option>
              <option>John Doe</option>
            </FilterSelect>
          </div>
          <div className="col-12 col-md-4">
            <label className="form-label text-uppercase text-muted fw-semibold mb-1 d-block" style={{ fontSize: 11, letterSpacing: 0.5 }}>
              Search Log
            </label>
            <SearchInput placeholder="Search activity" />
          </div>
        </div>
      </section>

      {/* LINE DIVIDER */}
      <hr className="my-3 opacity-25" />

      {/* ========================================================== */}
      {/* DIVISION 3: TABLE                                          */}
      {/* ========================================================== */}
      <section className="mb-3 print-area">
        <DataCard>
          <Table headers={["User", "Action", "Details", "Module", "Timestamp"]}>
            {activityLog.map((log) => (
              <Tr key={log.id}>
                <Td bold>{log.user}</Td>
                <Td>{log.action}</Td>
                <Td className="text-muted">{log.detail}</Td>
                <Td>
                  <span
                    className={`badge rounded-pill bg-${moduleVariant[log.module] || "secondary"} ${moduleVariant[log.module] === "warning" ? "text-dark" : ""}`}
                  >
                    {log.module}
                  </span>
                </Td>
                <Td className="text-nowrap">{log.timestamp}</Td>
              </Tr>
            ))}
          </Table>
          <Pagination current={1} total={3} label="Showing 1 to 8 of 24 activities" />
        </DataCard>
      </section>
    </>
  );
}
