import ErrorPage, { BackToDashboardLink } from "./ErrorPage.jsx";

// NotFound — 404 page.
export default function NotFound() {
  return (
    <ErrorPage
      code="404"
      icon="fa-magnifying-glass"
      accent="#495057"
      title="Page Not Found"
      description="The page you're looking for doesn't exist or may have been moved."
    >
      <BackToDashboardLink />
    </ErrorPage>
  );
}
