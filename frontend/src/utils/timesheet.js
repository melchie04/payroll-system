// Pure calculations over timesheet sheets: periods, totals, lateness and the checks a review runs.

const MONTH_INDEX = { jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5, jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11 };

// Reads a period label such as 1-15 Jul into its start and end dates.
export function parsePeriodLabel(label) {
  if (!label) return null;
  const [left, right] = String(label).split(/\s*[–—-]\s*/);
  if (!left || !right) return null;

  const year = (right.match(/\b(\d{4})\b/) || left.match(/\b(\d{4})\b/) || [])[1];
  if (!year) return null;

  // Reads the month name out of one half of a period label and returns its index.
  const monthOf = (part) => {
    const name = part.match(/([A-Za-z]{3,})/);
    const index = name ? MONTH_INDEX[name[1].slice(0, 3).toLowerCase()] : undefined;
    return index == null ? null : index;
  };
  // Reads the day number out of one half of a period label.
  const dayOf = (part) => {
    const day = part.match(/\b(\d{1,2})\b/);
    return day ? Number(day[1]) : null;
  };

  const leftMonth = monthOf(left);
  const rightMonth = monthOf(right);
  const fromMonth = leftMonth ?? rightMonth;
  const toMonth = rightMonth ?? leftMonth;
  const fromDay = dayOf(left);
  const toDay = dayOf(right);
  if (fromMonth == null || toMonth == null || fromDay == null || toDay == null) return null;

  const from = new Date(Number(year), fromMonth, fromDay);
  const to = new Date(Number(year), toMonth, toDay);
  if (from > to) return null;
  return { from, to };
}

// Works out whether a period is the first or second half of the month.
function halfFromPeriod(label) {
  const range = parsePeriodLabel(label);
  if (!range) return null;
  const first = range.from.getDate();
  const last = range.to.getDate();
  if (first === 1 && last <= 15) return "1-15";
  if (first === 16) return "16-31";
  return null;
}

// Flags a sheet whose dates fall outside the half it claims to cover.
export function checkPeriodHalf(label, half) {
  if (!label || !half) return { status: "unknown" };
  const range = parsePeriodLabel(label);
  if (!range) return { status: "unreadable" };
  const derived = halfFromPeriod(label);
  if (!derived) return { status: "not-a-half", range };
  if (derived !== half) return { status: "mismatch", expected: derived, range };
  return { status: "ok", range };
}

// Finds other sheets already filed for the same employee and period.
export function findDuplicateSheets(files, target, draft, roster = []) {
  const self = draft ? { name: draft.employee } : target?.employee;
  const selfResolved = resolveEmployee(self, roster);
  const key = selfResolved ? `id:${selfResolved.id}` : (self?.name || "").trim().toLowerCase();
  const range = parsePeriodLabel(draft ? draft.period : target?.period?.label);
  if (!key || !range) return [];

  return files.filter((other) => {
    if (String(other.id) === String(target?.id)) return false;
    if (other.status === "Failed" || other.status === "Processing") return false;
    const otherResolved = resolveEmployee(other.employee, roster);
    const otherKey = otherResolved ? `id:${otherResolved.id}` : (other.employee?.name || "").trim().toLowerCase();
    if (otherKey !== key) return false;
    const otherRange = parsePeriodLabel(other.period?.label);
    if (!otherRange) return false;
    return range.from <= otherRange.to && range.to >= otherRange.from;
  });
}

// Measures the hours between two times, allowing for an overnight shift.
function span(from, to) {
  if (!from || !to) return 0;
  const [fh, fm] = from.split(":").map(Number);
  const [th, tm] = to.split(":").map(Number);
  const mins = th * 60 + tm - (fh * 60 + fm);
  return mins > 0 ? mins : 0;
}

// Totals one day's worked hours, less the break.
function hours(mins) {
  return Math.round((mins / 60) * 100) / 100;
}

// Totals one row's regular, overtime and night-differential hours.
export function rowTotals(row) {
  const regular = span(row.amIn, row.amOut) + span(row.pmIn, row.pmOut);
  const overtime = span(row.otIn, row.otOut);
  return { regular: hours(regular), overtime: hours(overtime), worked: regular > 0 };
}

// Matches a sheet to an employee on the roster by name.
export function resolveEmployee(employee, roster = []) {
  if (!employee) return null;
  if (employee.employeeId != null) {
    const byId = roster.find((e) => e.id === employee.employeeId);
    if (byId) return byId;
  }
  const name = (employee.name || "").trim().toLowerCase();
  if (!name) return null;
  return (
    roster.find((e) => e.name.trim().toLowerCase() === name) ||
    roster.find((e) => (e.aliases || []).some((a) => a.trim().toLowerCase() === name)) ||
    null
  );
}

// Matches a sheet to a client by code, falling back to the name.
export function resolveClient(file, clients = []) {
  if (!file) return null;
  if (file.clientCode) {
    const byCode = clients.find((c) => c.code === file.clientCode);
    if (byCode) return byCode;
  }
  return clients.find((c) => c.name === file.client) || null;
}

// Parses an ISO date string, returning null rather than an invalid date.
function parseIsoDate(value) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(value || "").trim());
  return m ? new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3])) : null;
}

// Says whether an employee was posted to that client on that date.
export function deploymentState(employee, range) {
  if (!employee) return { expected: true, reason: null };
  if (employee.status && employee.status !== "Active") return { expected: false, reason: employee.status };
  if (!range) return { expected: true, reason: null };
  const start = parseIsoDate(employee.assignmentStart);
  if (start && start > range.to) return { expected: false, reason: "Not yet deployed" };
  const end = parseIsoDate(employee.assignmentEnd);
  if (end && end < range.from) return { expected: false, reason: "Assignment ended" };
  return { expected: true, reason: null };
}

// Finds the shift an employee was rostered to work that day.
export function scheduleFor(employeeName, roster = []) {
  return resolveEmployee({ name: employeeName }, roster)?.schedule || null;
}

// Measures how many minutes after the rostered start the employee clocked in.
function lateMinutes(row, schedule) {
  if (!schedule?.in || !row?.amIn) return null;
  return span(schedule.in, row.amIn);
}

// Reports lateness for one row, using its own schedule if it has one.
export function rowLate(row, schedule) {
  const derived = lateMinutes(row, schedule);
  return derived === null ? row.late || 0 : derived;
}

// Adds every row of a sheet into one set of totals.
export function sheetTotals(rows = [], schedule = null) {
  return rows.reduce(
    (acc, r) => {
      const t = rowTotals(r);
      return {
        days: acc.days + (t.worked ? 1 : 0),
        regular: acc.regular + t.regular,
        overtime: acc.overtime + t.overtime,
        late: acc.late + rowLate(r, schedule),
      };
    },
    { days: 0, regular: 0, overtime: 0, late: 0 },
  );
}

// Compares the computed totals against the ones printed on the sheet.
export function sheetMismatches(rows = [], handwritten, schedule = null) {
  const computed = sheetTotals(rows, schedule);
  const hw = handwritten || {};
  return [
    computed.days !== hw.totalDays && { label: "Total Days", computed: computed.days, written: hw.totalDays },
    Math.round(computed.overtime) !== hw.regOt && { label: "Reg. OT", computed: Math.round(computed.overtime), written: hw.regOt },
    computed.late !== hw.totalLate && { label: "Total Late", computed: `${computed.late} mins`, written: `${hw.totalLate} mins` },
  ].filter(Boolean);
}

// Collects everything the review screen would raise about a sheet.
function sheetFindings(file, allFiles = [], roster = [], clients = []) {
  if (!file) return ["Sheet not found"];
  const client = resolveClient(file, clients);
  const findings = [];

  if (file.status !== "Needs Review") findings.push("Not awaiting review");
  if (!file.employee?.name) findings.push("Employee not identified");
  else if ((file.employee.confidence || 0) < 0.85) findings.push("Employee name read with low confidence");

  const periodCheck = checkPeriodHalf(file.period?.label, file.half);
  if (periodCheck.status !== "ok") findings.push("Period Covered and Sheet Half do not agree");

  const signatures = file.signatures || {};
  if (!signatures.employee) findings.push("Employee signature not detected");
  if (!signatures.supervisor) findings.push("Supervisor signature not detected");
  if (client?.requiresClientSignature !== false && !signatures.client)
    findings.push(client?.approvingRep ? `Client signature (${client.approvingRep}) not detected` : "Client signature not detected");
  if (client?.approvedFormCodes?.length && file.formCode && !client.approvedFormCodes.includes(file.formCode))
    findings.push(`Form ${file.formCode} is not approved for this client`);

  if (findDuplicateSheets(allFiles, file, null, roster).length > 0) findings.push("Days already covered by another sheet");
  const matched = resolveEmployee(file.employee, roster);
  const deployment = deploymentState(matched, parsePeriodLabel(file.period?.label));
  if (!deployment.expected) findings.push(`Employee not deployed for this period (${deployment.reason})`);
  const schedule = matched?.schedule || null;
  if (sheetMismatches(file.rows, file.handwritten, schedule).length > 0) findings.push("Totals disagree with the handwritten figures");

  const lowConfidence = (file.rows || []).reduce((n, r) => n + (r.lowConfidence ? r.lowConfidence.length : 0), 0);
  if (lowConfidence > 0) findings.push(`${lowConfidence} cells read with low confidence`);
  if ((file.rows || []).length === 0) findings.push("Nothing was read from the sheet");

  return findings;
}

// A sheet is clean when it raises no findings at all.
export function isSheetClean(file, allFiles = [], roster = [], clients = []) {
  return sheetFindings(file, allFiles, roster, clients).length === 0;
}
