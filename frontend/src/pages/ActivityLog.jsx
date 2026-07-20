import { DataCard, Table, Tr, Td, FilterSelect, SearchInput, ExportMenu, PageHeader } from "../components/ui/index.jsx";
import { activityLog } from "../assets/data/index.js";
import { exportToCsv } from "../utils/exportToCsv.js";

// ActivityLog — filterable, exportable audit log table.
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
      <section>
        <div className="mt-4">
          <PageHeader title="Activity Log" description="Track every action taken across your payroll system." />
        </div>
      </section>

      <hr className="my-3 opacity-25" />

      <section>
        <div className="row g-3 align-items-end">
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
            <SearchInput label="Search Log" placeholder="Search activity" />
          </div>
        </div>
      </section>

      <hr className="my-3 opacity-25" />

      <section className="mb-3 print-area">
        <DataCard title="Activity" action={<ExportMenu onExportCsv={handleExportAll} />}>
          <Table headers={["User", "Action", "Details", "Module", "Timestamp"]} itemLabel="activities">
            {activityLog.map((log) => (
              <Tr key={log.id}>
                <Td bold>{log.user}</Td>
                <Td>{log.action}</Td>
                <Td className="text-muted">{log.detail}</Td>
                <Td>
                  <span className="badge rounded-pill bg-secondary bg-opacity-10 text-secondary fw-normal py-1">{log.module}</span>
                </Td>
                <Td className="text-nowrap">{log.timestamp}</Td>
              </Tr>
            ))}
          </Table>
        </DataCard>
      </section>
    </>
  );
}
