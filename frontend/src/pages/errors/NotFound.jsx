// 404 page.

import ErrorPage, { BackToDashboardLink } from "./shell/ErrorPage.jsx";

// Renders the 404 page.
export default function NotFound() {
  return (
    <ErrorPage code="404" icon="fa-magnifying-glass" tone="neutral" title="Page not found" description="This page doesn't exist or has moved.">
      <BackToDashboardLink />
    </ErrorPage>
  );
}
