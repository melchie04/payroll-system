// Wrapper that loads one uploaded sheet for review.

import { Link, useLocation, useNavigate, useParams } from "react-router";
import { useTimesheets } from "../../context/TimesheetContext.jsx";
import { useActivity } from "../../context/ActivityContext.jsx";
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

  const backToSheets = () => (location.key !== "default" ? navigate(-1) : navigate("/timesheet", { state: { tab: "sheets" } }));

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
