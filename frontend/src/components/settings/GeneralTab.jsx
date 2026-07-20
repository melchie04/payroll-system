import { DataCard, BtnPrimary, FormField, SectionHeading } from "../ui/index.jsx";

// GeneralTab — general company/preferences settings tab.
export function GeneralTab({ generalSaved, onSave }) {
  return (
    <section className="mb-3">
      <DataCard title="Company Profile">
        <form className="card-body" onSubmit={onSave}>
          {generalSaved && (
            <div className="alert alert-success py-2 small d-flex align-items-center gap-2 mb-3">
              <i className="fas fa-circle-check"></i>
              Changes saved successfully.
            </div>
          )}

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
                <div className="text-muted" style={{ fontSize: 11.5 }}>
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
                  <select className="form-select" defaultValue="PHP">
                    <option value="PHP">₱ Philippine Peso (PHP)</option>
                    <option value="USD">$ US Dollar (USD)</option>
                  </select>
                </FormField>
              </div>
              <div className="col-12 col-md-6">
                <FormField label="Pay Schedule">
                  <select className="form-select" defaultValue="semi-monthly">
                    <option value="semi-monthly">Semi-Monthly</option>
                    <option value="monthly">Monthly</option>
                    <option value="weekly">Weekly</option>
                  </select>
                </FormField>
                <div className="text-muted" style={{ fontSize: 11.5 }}>
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
  );
}
