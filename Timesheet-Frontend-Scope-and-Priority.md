# Timesheet Gaps A–I — Frontend-Only Scope & Priority

**Companion to:** *Timesheet Module — Workflow, Evaluation & Recommendations*, Section 2 ("Gaps Worth Closing")
**Constraint:** Backend data persistence is deliberately out of scope for this phase.
**Date:** July 2026

---

## About the constraint

This constraint rules out less than it might appear. The app already keeps everything in memory while the browser tab is open (that is what `TimesheetContext` does), so a saved change survives moving between pages. It only vanishes on refresh.

That is enough to build almost all of A–I properly now, and to swap in the real backend later without redesigning the screens.

> **Session-only** — used throughout this document — means the change works fully, but a browser refresh resets it to the sample data. Fine for a pilot or a demo. Users should simply not be told their work is permanently saved yet.

---

## Contents

1. [What can be built right now](#1-what-can-be-built-right-now)
2. [Priority order](#2-priority-order)
3. [Why this order](#3-why-this-order)

---

## 1. What can be built right now

| Item | Verdict | Note |
|---|---|---|
| **A** — Upload queue, progress, size/type rejection | ✅ Yes | The browser can inspect a file's size and type itself. The queue, progress bar, and "Over 10MB" message are all UI. The file just doesn't leave the machine. |
| **B** — Make the filters actually filter | ✅ Yes | Pure UI. Nothing about it needs a server. |
| **C** — "Save and close" saves; warn on unsaved changes | ✅ Yes | Session-only, but the button stops lying. |
| **D** — Reject reason capture | ✅ Yes | Modal, reason list, new "Rejected" status, reason shown on the row. Session-only. |
| **E** — Real document preview | ⚠️ Partial | Showing the actual scanned page with working Zoom/Rotate: yes, for files uploaded in this session. **Click-a-field-and-it-highlights-on-the-page** needs the OCR's coordinates, which come from the backend. Build the viewer now, wire the highlighting later (or fake it with hardcoded coordinates on one sample sheet for demos). |
| **F1** — Period vs. Sheet Half consistency check | ✅ Yes | Pure arithmetic on two fields already on screen. |
| **F2** — Duplicate sheet detection | ✅ Yes, with a caveat | Can compare against every sheet currently loaded. It will catch duplicates within a session; it cannot know about sheets uploaded last Tuesday until there is a database. |
| **F3** — "Two documents in one image" | ❌ No | That is image analysis. Backend / OCR work. |
| **G** — Bulk-approve clean sheets | ✅ Yes | "Clean" is calculated from data already on screen. |
| **H** — Audit trail | ⚠️ Mostly defer | The panel can be built and entries recorded in session, but an audit trail that disappears on refresh is worse than none — it creates false confidence. Build the *data shape* now, the feature later. |
| **I1** — Cut-off countdown banner | ✅ Yes | Hardcode the cut-off in the sample data for now. |
| **I2** — Coverage gap → action button | ✅ Yes | The "jump to upload, pre-filtered to this employee" version is pure navigation. |
| **I3** — "Download original" | ⚠️ Partial | Works for files uploaded this session. Sample-data rows have no real file behind them — grey the button out there. |
| **I4** — Align the sample data (names, client lists) | ✅ Yes | Editing one file. |
| **I5** — Derive Late from a schedule | ✅ Yes | Add an expected start time to the mock employee records. Low priority though. |

**Short answer:** everything except **F3** and the meaningful half of **H**, with **E** and **I3** landing partially.

---

## 2. Priority order

| # | Item(s) | Summary |
|---|---|---|
| 1 | **B** + **I4** | Wire up the filters, and align the sample data |
| 2 | **C** | Make "Save and close" actually save, plus an unsaved-changes warning |
| 3 | **F1** + **F2** | Period/Half consistency check, and duplicate detection |
| 4 | **A** | Upload queue with progress and client-side rejection |
| 5 | **D** | Reject-and-re-scan reason capture |
| 6 | **E** | The real document viewer (without field highlighting) |
| 7 | **G** | Bulk approve for clean sheets |
| 8 | **I1** + **I2** + **I3** | Cut-off banner, coverage gap actions, download original |
| 9 | **I5** | Late derived from schedule |

**Deferred to the backend phase:** **F3**, **H**, and the field-highlighting half of **E**.

---

## 3. Why this order

### Broken promises before missing features (1–2)

A button that appears to work but doesn't is more damaging than one that isn't there yet. Filters that show the wrong client's sheets teach a user that the screen can't be trusted — and once that happens, they stop trusting the totals too, which is the part that is genuinely excellent.

The sample-data mismatch (**I4**) rides along with **B** because the filters will look broken while three pages each offer a different client list.

**C** is next for a related reason: a reviewer who loses twenty minutes of typing once will never trust the review screen again.

### Then protect the money (3)

The Period/Half check and duplicate detection are the two places where a wrong click becomes a wrong payslip. Both are pure logic on data already in front of you — very small effort, very high consequence. This is the best cost-to-value ratio on the whole list, which is why it outranks the more visible upload work.

### Then fix the dead end at the front door (4)

Upload is the landing tab and the first thing anyone touches. It ranks below the three above only because "nothing happens" is honest, while "wrong data shown" and "work silently lost" are not.

It is also the item that unlocks the ones after it — real files must be in the queue before a real viewer or a real download button has anything to show.

### Then close the feedback loop (5)

Rejection is how bad scans stop arriving. Without a captured reason, the same glared photo comes back on Monday. It sits after upload because it is less frequently used, but it is what makes the intake process improve over time rather than staying at the same error rate forever.

### Then speed and polish (6–9)

The viewer, bulk approve, and the small items all make the work faster or more pleasant, but nothing is wrong or lost without them.

Bulk approve in particular is worth doing only **after** the validation in step 3 exists — approving twelve sheets at once is a great feature and a terrible one, depending on whether the checks behind it are trustworthy.

### On the two deferrals

**F3** genuinely needs image analysis.

**H** is the one to push back on if it is wanted early: a session-only audit trail looks like a control while providing none, and in a payroll context that is a worse position than an obvious blank. Worth designing the record shape now so the backend phase has a target, but not worth shipping.
