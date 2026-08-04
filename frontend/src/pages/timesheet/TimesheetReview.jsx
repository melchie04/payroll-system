// Wrapper that loads one uploaded sheet for review.

import { Link, useLocation, useNavigate, useParams } from "react-router";
import { useTimesheets } from "../../context/hooks.js";
import { useActivity } from "../../context/hooks.js";
import { TimesheetReviewForm } from "./tabs/TimesheetReviewForm.jsx";

// Loads the sheet named in the URL and hands it to the review form.
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

  // Goes back the way the user came, falling back to the Uploaded Sheets tab on a direct load.
  const backToSheets = () => (location.key !== "default" ? navigate(-1) : navigate("/timesheet", { state: { tab: "sheets" } }));

  // Names the employee on the sheet, preferring the reviewer's correction over the scanned name.
  const who = (draft) => draft?.employee || file.employee?.name || "an unidentified employee";
  // Writes one Timesheet entry to the activity log.
  const trail = (action, detail) => logActivity({ action, detail, module: "Timesheet" });

  // Approves the sheet and records the approval in the activity log.
  const handleApprove = (id, draft) => {
    approveFile(id, draft);
    trail("Approved timesheet", `Approved ${file.name} for ${who(draft)}`);
  };
  // Saves the reviewer's corrections and records them in the activity log.
  const handleSave = (id, draft) => {
    saveFile(id, draft);
    trail("Saved timesheet review", `Saved corrections to ${file.name}`);
  };
  // Rejects the sheet and records the reasons in the activity log.
  const handleReject = (id, rejection) => {
    rejectFile(id, rejection);
    trail("Rejected timesheet", `Rejected ${file.name} (${rejection?.reasons?.length || 0} reason(s))`);
  };

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
