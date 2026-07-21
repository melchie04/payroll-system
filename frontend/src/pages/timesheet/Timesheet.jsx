import { useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { PageHeader, TabsNav, FilterSelect } from "../../components/ui/index.jsx";
import { timesheetCoverage, extractionSummary, payPeriods, clientNames } from "../../assets/data/index.js";
import { useTimesheets } from "../../context/TimesheetContext.jsx";
import { TimesheetUpload } from "../../components/timesheet/TimesheetUpload.jsx";
import { TimesheetFiles } from "../../components/timesheet/TimesheetFiles.jsx";
import { TimesheetCoverage } from "../../components/timesheet/TimesheetCoverage.jsx";

// Pay periods are set by the admin, so they can straddle the 15th.
const ALL_CLIENTS = "All Clients";

function toTime(value) {
  const parsed = value ? Date.parse(value) : NaN;
  return Number.isNaN(parsed) ? null : parsed;
}

// A sheet belongs to a pay period when the days it covers overlap that period.
// A sheet whose period has not been read yet stays visible, because hiding it
// would bury work that still has to be reviewed.
function inPeriod(file, period) {
  const from = toTime(file.period?.from);
  const to = toTime(file.period?.to);
  if (from === null || to === null) return true;
  return from <= toTime(period.to) && to >= toTime(period.from);
}

// Timesheet — intake for scanned timesheets. Payroll collects approved days from here.
export default function Timesheet() {
  const { files } = useTimesheets();
  const location = useLocation();

  // Upload is the default; returning from a sheet review reopens the tab it came from.
  const [tab, setTab] = useState(location.state?.tab || "upload");
  const [client, setClient] = useState("Acme Corp");
  const [period, setPeriod] = useState(payPeriods[0].label);

  const activePeriod = useMemo(() => payPeriods.find((p) => p.label === period) || payPeriods[0], [period]);

  // The Client and Pay Period filters scope both tabs below, so the counts on
  // the tabs always describe what the user is actually looking at.
  const visibleFiles = useMemo(
    () => files.filter((f) => (client === ALL_CLIENTS || f.client === client) && inPeriod(f, activePeriod)),
    [files, client, activePeriod],
  );

  const visibleCoverage = useMemo(
    () => timesheetCoverage.filter((r) => r.period === activePeriod.label && (client === ALL_CLIENTS || r.client === client)),
    [client, activePeriod],
  );

  const needsReview = visibleFiles.filter((f) => f.status === "Needs Review").length;
  const gaps = visibleCoverage.filter((r) => r.gap).length;

  const TABS = [
    { key: "upload", label: "Upload", icon: "fa-cloud-arrow-up" },
    { key: "sheets", label: "Uploaded Sheets", icon: "fa-file-lines", badge: needsReview || null },
    { key: "coverage", label: "Coverage", icon: "fa-list-check", badge: gaps || null },
  ];

  return (
    <>
      <section>
        <div className="mt-4">
          <PageHeader
            title="Timesheet Upload"
            description="OCR-scan uploaded sheets, confirm what was read, and file the hours per employee."
          />
        </div>
      </section>

      <hr className="my-3 opacity-25" />

      <section className="ts-toolbar mb-4">
        <div className="row g-3 align-items-end">
          <div className="col-12 col-xl-6">
            <TabsNav tabs={TABS} active={tab} onChange={setTab} />
          </div>
          <div className="col-12 col-md-6 col-xl-3">
            <FilterSelect label="Client" value={client} onChange={(e) => setClient(e.target.value)}>
              <option>{ALL_CLIENTS}</option>
              {clientNames.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </FilterSelect>
          </div>
          <div className="col-12 col-md-6 col-xl-3">
            <FilterSelect label="Pay Period" value={period} onChange={(e) => setPeriod(e.target.value)}>
              {payPeriods.map((p) => (
                <option key={p.label}>{p.label}</option>
              ))}
            </FilterSelect>
          </div>
        </div>
      </section>

      {tab === "upload" && <TimesheetUpload summary={extractionSummary} />}

      {tab === "sheets" && <TimesheetFiles files={visibleFiles} />}

      {tab === "coverage" && <TimesheetCoverage rows={visibleCoverage} period={period} />}
    </>
  );
}
