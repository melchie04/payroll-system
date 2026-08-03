import { Link, useLocation, useNavigate, useParams } from "react-router";
import {
  useTimesheets,
} from "../../context/TimesheetContext.jsx";
import { useActivity } from "../../context/ActivityContext.jsx";
import { TimesheetReviewForm } from "./tabs/TimesheetReviewForm.jsx";

// TimesheetReview — confirms what was read off one sheet before it is approved.
export default function TimesheetReview() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { files, getFileById, approveFile, saveFile, rejectFile } = useTimesheets();
  const { logActivity } = useActivity();

  const file = getFileById(id);

  if (!file) {
    return (
      <section className="mt-4">
        <p className="text-muted mb-3">Timesheet not found.</p>
        <Link to="/timesheet" state={{ tab: "sheets" }} className="btn btn-dark btn-sm d-inline-flex align-items-center gap-2">
          <i className="fas fa-arrow-left"></i> Back to Timesheets
        </Link>
      </section>
    );
  }

  // Return to wherever the sheet was opened from (e.g. an employee profile), falling
  // back to the Uploaded Sheets tab when the review was loaded directly.
  const backToSheets = () =>
    location.key !== "default" ? navigate(-1) : navigate("/timesheet", { state: { tab: "sheets" } });

  // Approving is what turns a sheet into money, so each outcome is recorded. The name
  // is read from the draft, since a reviewer may have corrected it on this screen.
  const who = (draft) => draft?.employee || file.employee?.name || "an unidentified employee";
  const trail = (action, detail) => logActivity({ action, detail, module: "Timesheet" });

  const handleApprove = (id, draft) => {
    approveFile(id, draft);
    trail("Approved timesheet", `Approved ${file.name} for ${who(draft)}`);
  };
  const handleSave = (id, draft) => {
    saveFile(id, draft);
    trail("Saved timesheet review", `Saved corrections to ${file.name}`);
  };
  const handleReject = (id, rejection) => {
    rejectFile(id, rejection);
    trail("Rejected timesheet", `Rejected ${file.name} (${rejection?.reasons?.length || 0} reason(s))`);
  };

  // key resets the form when the reviewer moves straight from one sheet to another.
  return (
    <TimesheetReviewForm
      key={file.id}
      file={file}
      files={files}
      onBack={backToSheets}
      onApprove={handleApprove}
      onSave={handleSave}
      onReject={handleReject}
    />
  );
}

// TimesheetReviewForm — the sheet itself, once we know it exists.
