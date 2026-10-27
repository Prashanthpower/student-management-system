export default function NotificationBanner({ error, success, onClearError, onClearSuccess }) {
  return (
    <>
      {error && (
        <div className="error-banner" role="alert">
          <span className="banner-icon">⚠️</span>
          <span className="banner-text">{error}</span>
          {onClearError && (
            <button type="button" className="banner-close" onClick={onClearError} aria-label="Dismiss error">
              ×
            </button>
          )}
        </div>
      )}

      {success && (
        <div className="success-banner" role="status">
          <span className="banner-icon">✓</span>
          <span className="banner-text">{success}</span>
          {onClearSuccess && (
            <button type="button" className="banner-close" onClick={onClearSuccess} aria-label="Dismiss success">
              ×
            </button>
          )}
        </div>
      )}
    </>
  );
}
