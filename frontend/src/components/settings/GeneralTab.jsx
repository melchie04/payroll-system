import { DataCard, BtnPrimary, FormField } from "../ui/index.jsx";

export function GeneralTab({ generalSaved, onSave }) {
  return (
    <section className="mb-3">
      <DataCard title="Company Profile">
        <form className="card-body row g-1" onSubmit={onSave}>
          {generalSaved && (
            <div className="col-12 mb-3">
              <div className="alert alert-success py-2 small d-flex align-items-center gap-2 mb-0">
                <i className="fas fa-circle-check"></i>
                Changes saved successfully.
              </div>
            </div>
          )}
          <div className="col-12 col-md-6">
            <FormField label="Company Name">
              <input type="text" className="form-control" defaultValue="Payroll System Inc." />
            </FormField>
          </div>
          <div className="col-12 col-md-6">
            <FormField label="Support Email">
              <input type="email" className="form-control" defaultValue="support@payrollsys.com" />
            </FormField>
          </div>
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
          </div>
          <div className="col-12">
            <BtnPrimary type="submit">
              <i className="fas fa-floppy-disk"></i> Save Changes
            </BtnPrimary>
          </div>
        </form>
      </DataCard>
    </section>
  );
}
