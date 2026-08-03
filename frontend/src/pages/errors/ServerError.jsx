import ErrorPage, { BackToDashboardLink } from "./shell/ErrorPage.jsx";

// ServerError — 500 page.
export default function ServerError() {
  return (
    <ErrorPage
      code="500"
      icon="fa-triangle-exclamation"
      tone="danger"
      title="Something Went Wrong"
      description="The problem is on our end. Try again in a moment."
    >
      <BackToDashboardLink />
    </ErrorPage>
  );
}
