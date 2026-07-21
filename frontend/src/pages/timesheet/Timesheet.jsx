import { useState } from "react";
import { useLocation } from "react-router-dom";
import { PageHeader, TabsNav, FilterSelect } from "../../components/ui/index.jsx";
import { timesheetCoverage, extractionSummary } from "../../assets/data/index.js";
import { useTimesheets } from "../../context/TimesheetContext.jsx";
import { TimesheetUpload } from "../../components/timesheet/TimesheetUpload.jsx";
import { TimesheetFiles } from "../../components/timesheet/TimesheetFiles.jsx";
import { TimesheetCoverage } from "../../components/timesheet/TimesheetCoverage.jsx";

// Pay periods are set by the admin, so they can straddle the 15th.
const PERIODS = ["Jun 12 – Jun 25, 2026", "May 26 – Jun 11, 2026"];

// Timesheet — intake for scanned timesheets. Payroll collects approved days from here.
export default function Timesheet() {
  const { files } = useTimesheets();
  const location = useLocation();

  // Upload is the default; returning from a sheet review reopens the tab it came from.
  const [tab, setTab] = useState(location.state?.tab || "upload");
  const [client, setClient] = useState("Acme Corp");
  const [period, setPeriod] = useState(PERIODS[0]);

  const needsReview = files.filter((f) => f.status === "Needs Review").length;
  const gaps = timesheetCoverage.filter((r) => r.gap).length;

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
            title="Timesheet Upload / OCR Scan"
            description="Upload scanned timesheets, confirm what was read, and file the hours against each employee."
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
              <option>Acme Corp</option>
              <option>Globex Inc</option>
              <option>Wayne Construction</option>
            </FilterSelect>
          </div>
          <div className="col-12 col-md-6 col-xl-3">
            <FilterSelect label="Pay Period" value={period} onChange={(e) => setPeriod(e.target.value)}>
              {PERIODS.map((p) => (
                <option key={p}>{p}</option>
              ))}
            </FilterSelect>
          </div>
        </div>
      </section>

      {tab === "upload" && <TimesheetUpload summary={extractionSummary} />}

      {tab === "sheets" && <TimesheetFiles />}

      {tab === "coverage" && <TimesheetCoverage rows={timesheetCoverage} period={period} />}
    </>
  );
}
