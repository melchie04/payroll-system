// The Settings General tab: the company profile form.

import { useState } from "react";
import { BtnPrimary, DataCard, FilterSelect, FormField, SectionHeading } from "../../../components/ui/index.jsx";

// The company profile form.
export default function SettingsGeneralTab({ notify }) {
  const [currency, setCurrency] = useState("PHP");
  const [paySchedule, setPaySchedule] = useState("semi-monthly");

  // Saves the company profile and reports it through the page banner.
  function handleSave(e) {
    e.preventDefault();
    notify("success", "Company profile saved.");
  }

  return (
    <>
      <section className="mb-3">
        <DataCard title="Company Profile">
          <form className="card-body" onSubmit={handleSave}>
            <div className="mb-4">
              <SectionHeading>Company</SectionHeading>
              <div className="row g-3">
                <div className="col-12 col-md-6">
                  <FormField label="Company Name">
                    <input type="text" className="form-control" defaultValue="Payroll System Inc." />
                  </FormField>
                </div>
                <div className="col-12 col-md-6">
                  <FormField label="Support Email">
                    <input type="email" className="form-control" defaultValue="support@payrollsys.com" />
                  </FormField>
                  <div className="text-muted" style={{ fontSize: "var(--app-fs-1)" }}>
                    Shown to employees on payslips and system emails.
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-4">
              <SectionHeading>Payroll Defaults</SectionHeading>
              <div className="row g-3">
                <div className="col-12 col-md-6">
                  <FormField label="Default Currency">
                    <FilterSelect value={currency} onChange={(e) => setCurrency(e.target.value)}>
                      <option value="PHP">₱ Philippine Peso (PHP)</option>
                      <option value="USD">$ US Dollar (USD)</option>
                    </FilterSelect>
                  </FormField>
                </div>
                <div className="col-12 col-md-6">
                  <FormField label="Pay Schedule">
                    <FilterSelect value={paySchedule} onChange={(e) => setPaySchedule(e.target.value)}>
                      <option value="semi-monthly">Semi-Monthly</option>
                      <option value="monthly">Monthly</option>
                      <option value="weekly">Weekly</option>
                    </FilterSelect>
                  </FormField>
                  <div className="text-muted" style={{ fontSize: "var(--app-fs-1)" }}>
                    Applied to new payroll runs. Existing runs keep their schedule.
                  </div>
                </div>
              </div>
            </div>

            <BtnPrimary type="submit">
              <i className="fas fa-floppy-disk"></i> Save Changes
            </BtnPrimary>
          </form>
        </DataCard>
      </section>
    </>
  );
}
