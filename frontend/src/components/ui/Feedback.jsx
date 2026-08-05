// The inline success/error banner shown above a card.

const ALERT_ICONS = { success: "fa-circle-check", error: "fa-circle-exclamation" };

// Shows one message with a matching icon and an optional dismiss button.
export function AppAlert({ tone = "success", message, onDismiss }) {
  if (!message) return null;

  return (
    <div className={`app-alert app-alert--${tone} d-flex align-items-center gap-2`} role="status">
      <i className={`fas ${ALERT_ICONS[tone]}`}></i>
      <span className="flex-grow-1">{message}</span>
      {onDismiss && (
        <button type="button" className="app-alert-close" onClick={onDismiss} aria-label="Dismiss message">
          <i className="fas fa-xmark"></i>
        </button>
      )}
    </div>
  );
}
