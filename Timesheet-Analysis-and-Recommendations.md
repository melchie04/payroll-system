# Timesheet Module — Workflow, Evaluation & Recommendations

**Prepared as:** Senior Software Engineer / Business Analyst review
**Scope:** Frontend UI (Vite + React + Bootstrap + Sass) and the Timesheet Upload Requirements document
**Date:** July 2026

**Files reviewed:** `Timesheet.jsx`, `TimesheetUpload.jsx`, `TimesheetFiles.jsx`, `TimesheetCoverage.jsx`, `TimesheetReview.jsx`, `TimesheetContext.jsx`, the Employees and Clients pages, and the shared sample-data file.

---

## Contents

1. [How the Timesheet process works today](#1-how-the-timesheet-process-works-today)
2. [Review of the Timesheet page](#2-review-of-the-timesheet-page)
3. [Recommendations for the Employees & Clients pages](#3-recommendations-for-the-employees-and-clients-pages)
4. [Suggested priority order](#4-suggested-priority-order)

---

## 1. How the Timesheet process works today

Think of the page as a **paper-to-payroll conveyor belt** with three stations, shown as three tabs at the top: **Upload → Uploaded Sheets → Coverage**.

Above the tabs sit two dropdowns — **Client** and **Pay Period** — which set the context for everything below ("I am working on Acme Corp, for June 12–25").

### Step 1 — Upload the paper

The user opens the page on the **Upload** tab (the default). The left half is a large drop area: drag files in, or click to browse. It accepts PDF, JPG, PNG up to 10MB, and several at once.

The right half is a **cheat sheet**, so the user doesn't have to memorise the rules: standard STRON'L form, one employee per sheet, Period Covered written in full, signatures present, scanned PDF preferred, no glare or cut-off edges. Below that, an **Extraction Summary** showing how the last 7 days have gone (how many sheets processed, how accurate, etc.).

### Step 2 — Let the system read it, then check its work

Uploaded files land in the **Uploaded Sheets** tab as a list: filename, upload date, employee it thinks it found, sheet period, and a status.

Four statuses tell the whole story:

| Status | Meaning |
|---|---|
| **Processing** | The computer is still reading it. |
| **Needs Review** | Read successfully, but a human must confirm it. |
| **Approved** | A human has confirmed it; the hours are now available to payroll. |
| **Failed** | Couldn't be read at all (blurred, password-protected, wrong form). |

Each row has a menu: *Review sheet*, *View sheet*, *Retry extraction* (for failures), *Download original*, and *Discard sheet*. Retry and Discard both ask for confirmation first.

### Step 3 — Review one sheet

Clicking *Review sheet* opens a dedicated page for that single sheet. It also has two tabs, with the three decision buttons — **Approve Sheet**, **Save and close**, **Reject and re-scan** — parked on the right.

**Tab A — Sheet Details.** On the left, a preview of the scanned page (with Rotate and Zoom). On the right:

- A **Needs Attention** card listing everything that looks wrong — a name read with low confidence, a Period Covered not yet confirmed, a missing client signature, or totals that don't match what's handwritten on the sheet.
- A **Sheet Details** panel with four editable fields — Employee, Client, Period Covered, Sheet Half (1–15 or 16–31). Each has a dropdown of suggestions but stays typeable, so the reviewer can keep a name the system read but doesn't yet know.
- A **Signatures** strip showing whether ink was detected in the Employee, Supervisor, and Client boxes.
- A tick-box: *"Checked against the sheet"* for Period Covered. Until it's ticked, **Approve is disabled**.

**Tab B — Daily Entries.** The day-by-day grid, mirroring the paper form: each day has Morning in/out, Afternoon in/out, Overtime in/out, minutes Late, and a computed Hours column. Cells the computer wasn't confident about are visually flagged. Everything is editable.

Underneath, **Sheet Totals** recalculates days worked, regular hours, overtime, and total late — and prints the handwritten figure beneath each one, in amber when they disagree. This is the safety net: **the system never trusts the handwritten total**, it re-adds the daily times and shows you the difference.

### Step 4 — Approve, and payroll picks it up

Once nothing is blocking, the user hits **Approve Sheet**, the status flips to Approved, and the page becomes read-only.

Back on the Timesheet page, the **Coverage** tab answers the payroll manager's real question: *"is anyone about to be paid short?"* It lists every employee for the period, how many sheets were received, days covered, and flags anyone with a **gap** — because payroll only collects approved days, a gap means missing pay, not missing work.

---

## 2. Review of the Timesheet page

### What's working well

The concept is genuinely strong. Three things in particular are better than what most systems of this kind do:

- **Recalculating totals instead of trusting the handwriting.** This catches the single most expensive error class — a wrong total getting paid.
- **The blocking checklist.** Approve stays switched off until the Period Covered is confirmed. That's the field the requirements doc calls out as the one thing identifying the month, and the UI treats it with the seriousness it deserves.
- **Coverage as its own tab.** Most systems tell you what you *have*. This one tells you what's *missing*, which is the thing that actually causes payroll complaints.

### Gaps worth closing

#### A. The upload doesn't finish the job it starts

The drop area and file picker exist, but nothing happens after a file is dropped — there's no upload queue, no per-file progress, no "3 of 5 uploaded", no error if a file is 12MB or password-protected. Right now the user drops a file and the screen looks identical.

> **Fix:** files should appear immediately in a small queue with a progress bar and a clear reject message ("Over 10MB — please rescan at a lower quality").

#### B. The filters are decorative

The Client and Pay Period dropdowns at the top don't actually narrow the sheets list or the coverage table, and the Status/Source/Search filters inside the Uploaded Sheets tab have no effect either. This is the most misleading thing on the page — a user will filter to "Globex Inc", see Acme sheets, and lose trust in everything else.

> **Fix:** wire them up, and show an "X of Y sheets" count so the filter's effect is visible.

#### C. "Save and close" doesn't save

It navigates back and the reviewer's typed corrections are discarded. A reviewer half-way through a 31-day grid who steps away will lose their work with no warning.

> **Fix:** persist a draft, plus an "unsaved changes" prompt if they hit Back.

#### D. "Reject and re-scan" has no behaviour and asks for no reason

Rejection is the message that goes back to the branch or supervisor who submitted the sheet. Without a reason ("glare on days 8–14", "wrong form half"), they'll just resubmit the same bad scan.

> **Fix:** open a small modal with common reasons pre-listed; show the chosen reason on the sheet's row afterwards.

#### E. The document preview is a placeholder

The card promises *"Selecting a field highlights it here"* — that's exactly the right idea, and it's the feature that makes review fast instead of painful. Until the actual image renders with clickable regions, the reviewer is checking numbers against a piece of paper on their desk, which defeats much of the point.

#### F. Nothing enforces the rules the requirements doc says matter most

Three checks are described in the doc but have no representation in the UI:

- **Duplicate sheets** ("rejected because they would be paid twice") — nothing warns you that this employee already has an approved sheet covering these days.
- **Two documents in one image** — no flag.
- **Period vs. Sheet Half consistency** — you can currently set Period Covered to *June 1–15* and Sheet Half to *16–31* and still approve. That's a silent, expensive mistake.

#### G. Bulk work is missing

A payroll clerk processing 40 sheets on a cut-off day has to open, review, and approve each one individually.

> **Fix:** sheets with zero findings — high confidence, all signatures, totals matching — could be approvable straight from the list, with a "3 clean sheets — approve all?" prompt.

#### H. No trail of who did what

Approving a sheet changes someone's pay. There's no record of which reviewer approved it, when, or which values they changed from what the machine read. For a payroll system this is close to mandatory, and it's also how you'd ever measure whether the OCR is improving.

#### I. Smaller items

- **No cut-off warning.** The doc says sheets missing the cut-off simply vanish from the run — the page should say "Cut-off in 2 days" somewhere prominent.
- **"Download original" does nothing.**
- **Coverage gaps offer no action.** A "Chase" or "Upload for this employee" button on a gap row would close the loop.
- **Sample data is inconsistent.** The employee names offered in the review dropdowns (Juan Dela Cruz, Maria Santos) don't exist in the Employees list (John Doe, Jane Smith). Worth aligning before anyone demos it.
- **Late minutes are typed by hand,** though they could be derived if the system knew the employee's expected start time — see Section 3.

---

## 3. Recommendations for the Employees and Clients pages

> **The theme:** the Timesheet page can only be as smart as the records behind it. Almost every manual step in review exists because the system doesn't know something it could have been told once.

### 3.1 Employees page

#### Missing fields to add

| Field | Why the Timesheet page needs it |
|---|---|
| **Employee number / code** | Names are the weakest possible identifier. A code printed or written on the sheet lets matching be exact instead of a 71%-confidence guess. |
| **Name variants / aliases** | Handwritten sheets say "J. Dela Cruz", "Juan D. Cruz", "Juan DelaCruz". A short list of accepted spellings turns most low-confidence matches into certainties. |
| **Assignment start and end date** | Prevents a sheet being filed against someone who wasn't deployed on those days — and stops ex-employees appearing in Coverage as permanent "gaps". |
| **Multiple client assignments** | Today an employee belongs to exactly one client. A person who worked two sites in one period cannot be represented at all. |
| **Standard schedule / expected daily hours** | Lets the system calculate Late automatically and flag "worked 14 hours on a Sunday" as suspicious rather than accepting it silently. |
| **Overtime eligibility, night-differential eligibility, rest day** | The data file already carries a `nightDiff` field that nothing uses. Without eligibility rules, OT is captured but can't be validated. |
| **Rate effective date, and rate per client** | A rate that changed mid-period will silently mispay. Rates need a "from" date and the system needs to pick the right one. |

#### UX enhancements

1. **A "Timesheet Status" column** on the roster — *Complete*, *Missing*, *Pending Review* for the current period. Same information as Coverage, but where a supervisor is already looking.
2. **Make the existing Timesheet History tab real.** It currently shows placeholder rows from 2024 and doesn't link anywhere. Each row should open the actual reviewed sheet.
3. **Bulk import.** Onboarding 200 deployed staff one form at a time isn't viable; a CSV/Excel import with a preview-and-fix screen is standard for this kind of system.
4. **Required-field discipline.** The form validates Name and Email but silently accepts a blank Position or Date Hired. Mark what's genuinely required and say so before submit, not after.
5. **Deactivate instead of Delete.** Deleting an employee who has approved timesheets and payslips destroys payroll history. Delete should be reserved for records with no history; everything else should be *Archive*.
6. **Document expiry dates.** Contracts, IDs, and clearances expire. A simple expiry field plus an "expiring soon" flag turns a filing cabinet into a compliance tool.

### 3.2 Clients page

#### Missing fields to add

| Field | Why the Timesheet page needs it |
|---|---|
| **Approved timesheet form code(s)** | The requirements doc says the printed form code must be visible, and a non-standard form is rejected. Storing which codes a client uses lets the system verify this instead of asking a human to eyeball it. |
| **Pay period definition & cut-off date** | Pay Period is currently a hardcoded list of two strings shared by every client. Periods should be generated from each client's own cycle, and the cut-off should drive the deadline warning on the Timesheet page. |
| **Approving representative(s)** | The doc requires a client signature. The system should know *whose* signature it expects, and the review screen should name them: "Client signature (R. Cruz) not detected". |
| **Signature policy** | Some clients genuinely don't sign. A per-client setting — *required / optional* — stops the review screen raising an alarm that's actually normal for that account. |
| **Overtime and night-differential rules; billing rate vs. pay rate** | Billing is currently one frozen string. Approved hours can't flow into an invoice without the client's own multipliers and rates. |
| **Site / location list** | Clients with multiple sites need hours attributed per site, or invoicing and coverage are both wrong. |

#### UX enhancements

1. **A "Timesheet Coverage" tab on the client profile** — the same table as the Coverage tab, scoped to this client. It's the view an account manager actually wants before a client call.
2. **Make the assigned-employee count live.** `employees: 8` is a stored number, not a count. It will drift the first time someone is reassigned, and the Coverage tab will disagree with the client profile.
3. **A single source of truth for client names.** The client dropdowns differ page to page — the Timesheet page offers Wayne Construction, the Employees form offers Initech and Soylent Corp, the Clients filter offers a third set. All should read from the same client list, or filters will quietly fail to match.
4. **Client-level upload instructions.** A short free-text field ("Sheets come from the Parañaque site every Monday; night shift uses the 16–31 form only") shown on the Timesheet page when that client is selected.
5. **Same archive-vs-delete discipline** as Employees — a client with invoice history should never be hard-deleted.
6. **Contract start/end and rate effective dates**, so a rate change mid-period doesn't silently rewrite past invoices.

---

## 4. Suggested priority order

### Do first — the UI currently promises things it doesn't deliver

- Wire up the Client / Pay Period / Status / Source / Search filters
- Make the upload actually queue files, show progress, and report rejections
- Make "Save and close" persist the reviewer's corrections
- Add the Period-vs-Sheet-Half consistency check

*A missing feature is fine; a control that appears to work but doesn't is worse.*

### Do next — small record changes, large reduction in manual work

- Employee code + name aliases
- Per-client pay periods and cut-off dates
- Assignment start/end dates

### Do before launch — protects money and history

- Audit trail on approval (who, when, what changed)
- Duplicate-sheet detection
- Archive instead of hard delete, on both Employees and Clients
