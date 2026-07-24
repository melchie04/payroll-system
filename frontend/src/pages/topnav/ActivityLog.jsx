import { useMemo, useState } from "react";
import {
  DataCard,
  Table,
  Tr,
  Td,
  BtnSecondary,
  FilterSelect,
  FilterMenu,
  FilterCheckGroup,
  SearchInput,
  ExportMenu,
  PageHeader,
} from "../../components/ui/index.jsx";
import { activityLog } from "../../assets/data/index.js";
import { exportToCsv } from "../../utils/exportToCsv.js";

const ALL_MODULES = "All Modules";
const ALL_USERS = "All Users";
const ALL_TIME = "All Time";
const RANGE_DAYS = { Today: 1, "Last 7 Days": 7, "Last 30 Days": 30 };
const DATE_RANGES = [ALL_TIME, ...Object.keys(RANGE_DAYS)];

// Timestamps are stored as display text ("Jul 4, 2026 9:42 AM"), so a range check has
// to read them back as dates. One that cannot be read stays visible rather than
// disappearing from an audit trail.
function withinRange(stamp, range) {
  if (range === ALL_TIME) return true;
  const logged = Date.parse(stamp);
  if (Number.isNaN(logged)) return true;
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  return logged >= start.getTime() - (RANGE_DAYS[range] - 1) * 86400000;
}

// ActivityLog — filterable, exportable audit log table.
export default function ActivityLog() {
  const [module, setModule] = useState(ALL_MODULES);
  const [user, setUser] = useState(ALL_USERS);
  const [search, setSearch] = useState("");
  // the menu edits a draft and only commits it on Apply, matching the roster filter menu
  const [range, setRange] = useState(ALL_TIME);
  const [rangeDraft, setRangeDraft] = useState(ALL_TIME);

  // Both option lists are read from the log, so an entry from a new module or a new
  // person can never end up unfilterable.
  const modules = useMemo(() => [...new Set(activityLog.map((log) => log.module))], []);
  const userNames = useMemo(() => [...new Set(activityLog.map((log) => log.user))], []);

  const visible = useMemo(() => {
    const query = search.trim().toLowerCase();
    return activityLog.filter((log) => {
      if (module !== ALL_MODULES && log.module !== module) return false;
      if (user !== ALL_USERS && log.user !== user) return false;
      if (!withinRange(log.timestamp, range)) return false;
      if (!query) return true;
      return `${log.user} ${log.action} ${log.detail} ${log.module}`.toLowerCase().includes(query);
    });
  }, [module, user, range, search]);

  const filtered = visible.length !== activityLog.length;

  function clearFilters() {
    setModule(ALL_MODULES);
    setUser(ALL_USERS);
    setSearch("");
    setRangeDraft(ALL_TIME);
    setRange(ALL_TIME);
  }

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

      <section className="mb-4">
        <div className="row g-3 align-items-end">
          <div className="col-12 col-md-4">
            <FilterSelect label="Module" value={module} onChange={(e) => setModule(e.target.value)}>
              <option>{ALL_MODULES}</option>
              {modules.map((m) => (
                <option key={m}>{m}</option>
              ))}
            </FilterSelect>
          </div>
          <div className="col-12 col-md-4">
            <FilterSelect label="User" value={user} onChange={(e) => setUser(e.target.value)}>
              <option>{ALL_USERS}</option>
              {userNames.map((u) => (
                <option key={u}>{u}</option>
              ))}
            </FilterSelect>
          </div>
          <div className="col-12 col-md-4">
            {/* the search label makes this block taller than the 31px filter button, so the two align on their bottom edge */}
            <div className="d-flex gap-2 align-items-end w-100">
              <SearchInput label="Search Log" placeholder="Search activity" value={search} onChange={(e) => setSearch(e.target.value)} />
              <FilterMenu
                onApply={() => setRange(rangeDraft)}
                onReset={() => {
                  setRangeDraft(ALL_TIME);
                  setRange(ALL_TIME);
                }}
              >
                <FilterCheckGroup single label="Date Range" options={DATE_RANGES} selected={rangeDraft} onToggle={setRangeDraft} />
              </FilterMenu>
            </div>
          </div>
        </div>
      </section>

      <section className="mb-3 print-area">
        <DataCard
          title="Activity"
          action={
            <div className="d-flex align-items-center gap-3">
              <span className="text-muted" style={{ fontSize: 11.5 }}>
                {filtered ? `${visible.length} of ${activityLog.length} activities` : `${activityLog.length} activities`}
              </span>
              <ExportMenu onExportCsv={handleExportAll} />
            </div>
          }
        >
          {visible.length === 0 ? (
            <div className="text-center text-muted py-5 small">
              <div>No activity matches the filters above.</div>
              <BtnSecondary className="mt-3" onClick={clearFilters}>
                <i className="fas fa-rotate-left"></i> Clear Filters
              </BtnSecondary>
            </div>
          ) : (
            <Table headers={["User", "Action", "Details", "Module", "Timestamp"]} itemLabel="activities">
              {visible.map((log) => (
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
          )}
        </DataCard>
      </section>
    </>
  );
}
