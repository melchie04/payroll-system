# Payroll System — Feature Audit, Suggestions & Summary

Based on a full read-through of the current UI/code. This is a front-end-only
prototype (mock data, no backend), so every feature below is described as it
actually behaves right now — including where something looks functional but
isn't wired up yet.

---

## 1. Features & Functions — by Page

### Global (present on every dashboard page)
- Top navigation bar with brand logo (links to Dashboard)
- Sidebar toggle button (collapses/expands the side menu)
- Notification bell with unread-dot indicator and a dropdown preview of the 3 latest notifications, with a link to the full Notifications page
- Profile dropdown menu: Settings link, Activity Log link, Light/Dark theme toggle (persists via `localStorage`), Logout (returns to Login page)
- Sidebar navigation: Dashboard, Payroll, Billing, Timesheet Upload, Employees, Clients
- Sidebar "Help" link (present but not wired to anything yet — see Suggestions)
- Light/Dark theme switching, saved across sessions
- Footer with copyright text and Privacy Policy / Terms & Conditions links (static, not real pages)

### Login (`/login`)
- Email + password sign-in form
- Show/hide password toggle
- "Forgot password?" link
- Submitting the form (with anything typed in) logs you in and redirects to the Dashboard — there's no real credential check yet

### Forgot Password (`/forgot-password`)
- Email input to request a password reset
- On submit, shows a "Check your email" confirmation screen
- "Back to Sign In" link

### Reset Password (`/reset-password/:token`)
- New password + confirm password fields, each with show/hide toggle
- Live requirement checklist (8+ characters, uppercase+lowercase, a number, a special character, passwords match) — submit is blocked until all are satisfied
- Success screen with "Back to Sign In"
- Dev-only badge showing the token from the URL (for testing, since there's no real email being sent)

### Change Password — first-time login (`/change-password` or `/change-password/:token`)
- Same as Reset Password, plus a "Temporary Password" field (the one emailed to a new user by an admin)
- Same live requirement checklist
- Success screen with "Continue to Dashboard"

### Dashboard (`/`)
- 4 top-level stat cards: Active Clients, Pending Payroll, Unbilled Amount, Overdue Invoices
- Payroll Status Overview donut chart (On Track / At Risk / Delayed / Completed breakdown)
- Recent Activity feed (latest 4 events) with a "View all" link to the Activity Log
- Upcoming Payroll table (employee, client, pay period, status, gross/net pay)

### Payroll (`/payroll`)
- 4 stat cards: Total Employees, Total Hours, Gross Payroll, Net Payroll
- Filters: Client, Pay Period, Status (dropdowns) + a filter-icon dropdown with checkbox filters + a search box
- Payroll table with row checkboxes (multi-select, no bulk action wired up yet) and pagination
- Row actions menu (⋮): View Payslip, Edit Hours, Mark as Paid *(these three are visual-only — no click behavior yet)*, and Delete
- Delete row → confirmation modal → removes the row from the table
- Header buttons: "Import Timesheet" and "Run Payroll" *(both visual-only, no action wired up)*

### Billing (`/billing`)
- 4 stat cards for billing totals
- Filters: Client, Invoice Status, Date Range + filter dropdown + search
- Invoices table: invoice #, client, dates, amount, status badge
- Per-row eye icon to mask/unmask the invoice amount (privacy toggle)
- "Create Invoice" modal — client, invoice date, due date, amount, status; submitting adds a real new row to the top of the table
- "Export" header button *(visual-only, no action wired up)*
- Pagination

### Timesheet Upload (`/timesheet`)
- Client / Employee / Pay Period filter dropdowns
- Drag-and-drop dropzone, plus a "Choose Files" button that opens the OS file picker
- Uploaded Files list, each with a status badge (Processing / Extracted / Failed) and a context-appropriate action icon (cancel / view / retry)
- Clicking a file's action opens a confirm modal; confirming actually updates state — Processing gets removed (cancel), Failed flips back to Processing (retry)
- Extraction Summary card (last 7 days stats)
- Header "Upload New" button is currently commented out in the code (was intentionally disabled, not deleted)

### Employees (`/employees`)
- Filters (Client, Position dropdowns + filter-checkbox dropdown + search)
- Employee table: name, client, position, email, rate, status, row checkboxes
- "Add Employee" modal — adds a real new row
- Row actions (⋮): **View Profile** (read-only modal: avatar, client, status, email, rate), **Edit** (pre-filled modal, saves changes to the row), **Delete** (confirm modal, removes the row)
- Pagination

### Clients (`/clients`)
- 4 stat cards: client totals (active clients, employees deployed, outstanding billing, etc.)
- Filters (Status, Industry dropdowns + filter-checkbox dropdown + search)
- Clients table: name, contact person, email, phone, industry, employee count, billing, status
- "Add Client" modal — adds a real new row
- Row actions (⋮): **View Details** (read-only modal), **Edit** (pre-filled modal), **Delete** (confirm modal)
- Pagination

### Settings (`/settings`)
Four tabs:
- **General** — Company Name, Support Email, Default Currency, Pay Schedule fields; "Save Changes" shows a green confirmation banner that disappears after ~4 seconds or when you leave the tab *(fields aren't actually persisted anywhere — this is a UI-only save confirmation)*
- **Users** — table of system users (name, email, role, status); "Create User" modal; row actions: Edit User (pre-filled modal), Reset Password (sets a new password for that user, with the same live requirement checklist), Delete User (confirm modal)
- **Roles & Permissions** — card grid of roles, each showing its description, user count, and module-access badges; "Create Role" modal (blocks duplicate role names); Edit Role (pre-filled, also blocks renaming into a duplicate); Delete Role (confirm modal)
- **Change Password** — self-service password change (current password + new + confirm), same live requirement checklist, same auto-dismissing success banner as General

### Notifications (`/notifications`)
- Full list of all notifications (not just the top-3 preview from the bell icon)
- All / Unread filter tabs, with an unread-count badge
- "Mark all as read" button
- Per-item "Mark as read" for unread notifications

### Activity Log (`/activity-log`)
- Filters: Module, User dropdowns + search
- Table: user, action, details, module (color-coded badge), timestamp
- Pagination
- *(Static list — nothing on the site currently writes new entries into it when you take actions elsewhere; see Suggestions)*

### Error Pages
- **404 Not Found** — catches any unmatched URL automatically
- **403 Access Denied** — reachable only by typing `/403` directly; nothing currently redirects here (no role-based route guarding is implemented yet, even though Roles & Permissions data exists)
- **500 Server Error** — reachable only by typing `/500` directly; includes a "Try Again" (reloads the page) and "Back to Dashboard"

---

## 2. Suggestions

Things that would make sense as a next step, given what's already built:

- **A real client-side data layer (or backend).** Right now every page's data resets on page refresh because it only lives in React state. Even before a real backend, moving all mock data into something like `localStorage` or a small mock API layer would make demos/testing feel more real.
- **Wire up the currently-inert buttons.** Several buttons exist visually but don't do anything yet: Payroll's "Import Timesheet" / "Run Payroll", Billing's "Export", Payroll row actions "View Payslip" / "Edit Hours" / "Mark as Paid". These are natural next features rather than true gaps in the design — worth flagging so you know they're stubs, not accidental omissions.
- **Employee Profile page (not just a modal).** Right now "View Profile" is a small modal with 4 fields. As the system grows, employees likely need a dedicated detail page — payslip history, timesheet history, documents, emergency contact info, etc. A modal is fine for a quick glance, but won't scale.
- **Payslip view/download.** "View Payslip" in the Payroll row menu has no target yet. A payslip modal or generated PDF would close the loop on "Run Payroll" actually producing something an employee could see.
- **Invoice detail / PDF view.** Similarly, invoices only show as table rows — there's no "view full invoice" page or downloadable PDF yet, which is normally expected in a billing module.
- **Role-based access enforcement.** The Roles & Permissions system (module checkboxes per role) is fully built, but nothing in the app actually checks "does this logged-in user's role include this module" before rendering a page. Right now anyone can visit any route. This is what the 403 page was built for — it just needs a route guard to actually use it.
- **A real authenticated session.** Login currently accepts anything and just navigates to `/`. There's no logged-in user state anywhere in the app (the profile dropdown always says "Admin" regardless of who "logged in"). This connects to the role-based access point above — you can't check permissions without knowing who's logged in.
- **Activity Log should log real actions.** It's currently static seed data. Once real actions exist (creating an invoice, deleting an employee, resetting a password), those should append entries here automatically — that's the whole point of an audit trail.
- **Bulk actions for table checkboxes.** Payroll, Employees, and Clients tables all have row checkboxes for multi-select, but there's no bulk action bar (e.g., "Delete selected," "Export selected," "Mark selected as paid") that appears once something is checked. Right now the checkboxes don't do anything after you check them.
- **A Help / Support page or widget.** The sidebar's "Help" link currently only does a `console.log` — there's no actual help content, FAQ, or contact form behind it.
- **Search that actually filters.** Every page's search box and filter dropdowns are visual — typing in Payroll's or Clients' search field doesn't currently narrow the table. Worth deciding whether this becomes real client-side filtering or is deferred until there's a real backend to query.
- **Dashboard date range / period selector.** The Dashboard currently only shows one fixed snapshot. A "This Week / This Month / Custom Range" control would make it feel like a live dashboard rather than a fixed mockup.
- **A "My Profile" page for the logged-in user.** Right now, editing your own info (name, avatar, email) isn't possible anywhere — Settings' "Change Password" tab handles password only. A small "My Account" section (perhaps replacing the static "Admin" label everywhere) would round this out.
- **Export/print for tables.** Employees, Clients, Payroll, and Activity Log are all natural candidates for a CSV/PDF export button, especially since Billing already has a (currently inert) "Export" button suggesting this was intended.
- **Terms & Conditions / Privacy Policy pages.** The footer links to these but they don't go anywhere yet — even a simple static page would complete that footer.
- **A "first login forces Change Password" redirect.** The `/change-password` page exists and works standalone, but nothing currently detects "this user has never changed their temp password" and redirects them there automatically after login — right now it's only reachable by direct link.

---

## 3. How the System Works (Current State Summary)

This is a payroll and billing management system for an agency or outsourcing
company that manages employees across multiple external **clients**. An
admin signs in, lands on a **Dashboard** that summarizes active clients,
pending payroll, unbilled amounts, and overdue invoices at a glance, along
with a quick view of recent activity and what payroll is coming up next.

From there, the workflow follows a natural cycle: **Employees** are added
and assigned to a **Client**, with a position and hourly rate. Their worked
hours come in through **Timesheet Upload**, where documents are dragged in
or picked via file browser and (conceptually) OCR-scanned to extract hours —
each file tracks its own processing status and can be cancelled or retried.
Those hours feed into **Payroll**, where gross/net pay is calculated per
employee per pay period, and an admin can review and eventually "Run
Payroll" for a batch. Once work is billable back to a client, **Billing**
turns it into an invoice — tracking sent/paid/overdue status and letting
amounts be temporarily hidden on-screen for privacy.

Administration lives in **Settings**: a company profile, a list of
system users each assigned a **role**, and the roles themselves define
which modules of the app they're meant to have access to (though this isn't
enforced yet — anyone can currently reach any page). Admins can create
users, reset their passwords, and manage roles without touching code.
Everything that happens across the app is meant to be traceable via the
**Activity Log**, and users get an in-app **Notifications** feed for
things like completed uploads or overdue invoices.

Authentication is a simple email/password **Login**, with **Forgot
Password** and **Reset Password** flows for existing users, and a
**Change Password** flow specifically for a brand-new user's first
sign-in with a temporary password. Right now this is all front-end only —
no real backend validates credentials, persists data past a page refresh,
or enforces who can see what — so today it functions as a fully clickable,
realistic **prototype** of the eventual product rather than a
production-ready payroll system.
