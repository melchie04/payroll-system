// 500 page.

import ErrorPage, { BackToDashboardLink } from "./shell/ErrorPage.jsx";

// Renders the 500 page.
export default function ServerError() {
  // Reloads the page so the failed request is attempted again.
  function retry() {
    window.location.reload();
  }

  return (
    <ErrorPage
      code="500"
      icon="fa-triangle-exclamation"
      tone="danger"
      title="Something went wrong"
      description="The problem is on our end. Try again in a moment."
    >
      <BackToDashboardLink />
      <button type="button" className="btn btn-link btn-sm error-retry mt-2" onClick={retry}>
        Try again
      </button>
    </ErrorPage>
  );
}
