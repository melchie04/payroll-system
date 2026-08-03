import ErrorPage, { BackToDashboardLink } from "./shell/ErrorPage.jsx";

// AccessDenied — 403 page.
export default function AccessDenied() {
  return (
    <ErrorPage
      code="403"
      icon="fa-lock"
      tone="warning"
      title="Access Denied"
      description="Your role can't view this page. Contact an administrator if that's wrong."
    >
      <BackToDashboardLink />
    </ErrorPage>
  );
}
