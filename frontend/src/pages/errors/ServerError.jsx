import ErrorPage, { BackToDashboardLink } from "./ErrorPage.jsx";

// ServerError — 500 page.
export default function ServerError() {
  return (
    <ErrorPage
      code="500"
      icon="fa-triangle-exclamation"
      accent="#b02a37"
      title="Something Went Wrong"
      description="We ran into an unexpected error on our end. Please try again in a moment."
    >
      <div className="d-flex flex-wrap gap-2 justify-content-center">
        <button type="button" className="btn btn-outline-secondary rounded-pill px-4 py-2 fw-normal" onClick={() => window.location.reload()}>
          <i className="fas fa-rotate-right me-2"></i>
          Try Again
        </button>
        <BackToDashboardLink />
      </div>
    </ErrorPage>
  );
}
