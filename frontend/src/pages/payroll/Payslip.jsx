import { useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router";
import { DataCard, Table, Tr, Td, BtnPrimary, FilterSelect, PayslipDetails, PageHeader } from "../../components/ui/index.jsx";
import { payPeriods } from "../../assets/data/index.js";
import { formatCurrency } from "../../utils/currency.js";
import { computeDeductions } from "../../utils/payslip.js";
import { buildPayrollRows, sheetsForEmployee } from "../../utils/payrollRun.js";
import { useClients } from "../../context/ClientsContext.jsx";
import { useEmployees } from "../../context/EmployeesContext.jsx";
import { useTimesheets } from "../../context/TimesheetContext.jsx";
import { usePayroll } from "../../context/PayrollContext.jsx";
import { useActivity } from "../../context/ActivityContext.jsx";

// Payslip — one employee's pay for one period, and the approved sheets behind it.
export default function Payslip() {
  // Every hook stays above the not-found return below, so the order never changes.
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { clients } = useClients();
  const { employees } = useEmployees();
  const { files } = useTimesheets();
  const { overrides, setStatus } = usePayroll();
  const { logActivity } = useActivity();
  const [periodLabel, setPeriodLabel] = useState(location.state?.period || payPeriods[0].label);

  const employee = employees.find((e) => String(e.id) === String(id));
  const period = payPeriods.find((p) => p.label === periodLabel) || payPeriods[0];

  function handleBack() {
    if (location.key !== "default") navigate(-1);
    else navigate("/payroll");
  }

  if (!employee) {
    return (
      <section className="mt-4">
        <p className="text-muted mb-3">Employee not found.</p>
        <Link to="/payroll" className="btn btn-dark btn-sm">
          <i className="fas fa-arrow-left"></i> Back to Payroll
        </Link>
      </section>
    );
  }

  const row = buildPayrollRows({ period, employees, files, clients, overrides }).find((r) => r.employeeId === employee.id);
  const sheets = sheetsForEmployee(employee, period, files, employees, clients);
  const deductions = computeDeductions(row?.gross || 0);

  function markPaid() {
    if (!row || row.status === "Paid") return;
    setStatus(row.key, "Paid");
    logActivity({ action: "Marked payroll paid", detail: `${employee.name} (${employee.code}) for ${period.label}`, module: "Payroll" });
  }

  return (
    <>
      <section>
        <div className="mt-4 d-flex align-items-start gap-2">
          <button type="button" onClick={handleBack} className="nav-icon-btn flex-shrink-0" style={{ marginTop: -6 }} aria-label="Back" title="Back">
            <i className="fas fa-arrow-left"></i>
          </button>
          <div className="flex-grow-1">
            <PageHeader
              title={employee.name}
              description={`${employee.code} · ${employee.position} · ${row?.client || "—"}`}
              actions={
                <>
                  <button
                    type="button"
                    className="btn btn-outline-secondary btn-sm d-inline-flex align-items-center gap-2"
                    onClick={() => window.print()}
                  >
                    <i className="fas fa-file-pdf"></i> Download PDF
                  </button>
                  {row && row.status !== "Paid" && (
                    <BtnPrimary onClick={markPaid}>
                      <i className="fas fa-check"></i> Mark as Paid
                    </BtnPrimary>
                  )}
                </>
              }
            />
          </div>
        </div>
      </section>

      <hr className="my-3 opacity-25" />

      <section className="mb-3">
        <div className="row g-3">
          <div className="col-12 col-md-4">
            <FilterSelect label="Pay Period" value={periodLabel} onChange={(e) => setPeriodLabel(e.target.value)}>
              {payPeriods.map((p) => (
                <option key={p.label}>{p.label}</option>
              ))}
            </FilterSelect>
          </div>
        </div>
      </section>

      <div className="print-area">
        <section className="mb-3">
          <DataCard title="Payslip">
            <div className="card-body">
              <PayslipDetails
                employeeName={employee.name}
                subtitle={`${employee.position} · ${row?.client || "—"}`}
                status={row?.status || "Pending"}
                period={period.label}
                summaryRows={[
                  { icon: "fa-clock", label: "Hours Worked", value: (row?.hours || 0).toFixed(2) },
                  { icon: "fa-sack-dollar", label: "Rate", value: `${formatCurrency(row?.rate || 0)} / hr` },
                  { icon: "fa-money-bill-wave", label: "Gross Pay", value: formatCurrency(deductions.gross) },
                ]}
                deductionRows={[
                  { icon: "fa-shield-halved", label: "SSS", value: formatCurrency(deductions.sss) },
                  { icon: "fa-briefcase-medical", label: "PhilHealth", value: formatCurrency(deductions.philhealth) },
                  { icon: "fa-house", label: "Pag-IBIG", value: formatCurrency(deductions.pagibig) },
                  { icon: "fa-receipt", label: "Withholding Tax", value: formatCurrency(deductions.tax) },
                ]}
                netPay={formatCurrency(deductions.net)}
              />
            </div>
          </DataCard>
        </section>

        <section className="mb-3">
          <DataCard title="Timesheets Behind This Payslip">
            {sheets.length === 0 ? (
              <div className="text-center text-muted py-5 small">No approved timesheet covers this pay period yet.</div>
            ) : (
              <Table headers={["Sheet", "Period Covered", "Days", "Regular Hrs", "Overtime Hrs"]} itemLabel="timesheets">
                {sheets.map((sheet) => (
                  <Tr key={sheet.id}>
                    <Td bold>
                      <Link to={`/timesheet/${sheet.id}`} className="fw-semibold text-decoration-none">
                        {sheet.name}
                      </Link>
                    </Td>
                    <Td>{sheet.period}</Td>
                    <Td>{sheet.days}</Td>
                    <Td>{sheet.regular}</Td>
                    <Td>{sheet.overtime}</Td>
                  </Tr>
                ))}
              </Table>
            )}
          </DataCard>
        </section>
      </div>
    </>
  );
}
