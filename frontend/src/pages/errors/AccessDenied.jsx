import ErrorPage, { BackToDashboardLink } from "./ErrorPage.jsx";

export default function AccessDenied() {
  return (
    <ErrorPage
      code="403"
      icon="fa-lock"
      accent="#997404"
      title="Access Denied"
      description="Your role doesn't have permission to view this page. Contact an administrator if you think this is a mistake."
    >
      <BackToDashboardLink />
    </ErrorPage>
  );
}
