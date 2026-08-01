import ErrorPage, { BackToDashboardLink } from "./ErrorPage.jsx";

// AccessDenied — 403 page.
export default function AccessDenied() {
  return (
    <ErrorPage
      code="403"
      icon="fa-lock"
      accent="#997404"
      title="Access Denied"
      description="Your role can't view this page. Contact an administrator if that's wrong."
    >
      <BackToDashboardLink />
    </ErrorPage>
  );
}
