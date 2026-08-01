import ErrorPage, { BackToDashboardLink } from "./ErrorPage.jsx";

// NotFound — 404 page.
export default function NotFound() {
  return (
    <ErrorPage
      code="404"
      icon="fa-magnifying-glass"
      accent="#5f6b62"
      title="Page Not Found"
      description="This page doesn't exist or has moved."
    >
      <BackToDashboardLink />
    </ErrorPage>
  );
}
