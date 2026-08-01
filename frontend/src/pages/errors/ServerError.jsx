import ErrorPage, { BackToDashboardLink } from "./ErrorPage.jsx";

// ServerError — 500 page.
export default function ServerError() {
  return (
    <ErrorPage
      code="500"
      icon="fa-triangle-exclamation"
      accent="#b02a37"
      title="Something Went Wrong"
      description="The problem is on our end. Try again in a moment."
    >
      <BackToDashboardLink />
    </ErrorPage>
  );
}
