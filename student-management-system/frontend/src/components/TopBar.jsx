export default function TopBar({ eyebrow, title, subtitle, actions, onToggleMobile }) {
  return (
    <header className="topbar">
      <div className="topbar-left">
        {onToggleMobile && (
          <button type="button" className="mobile-toggle-btn" onClick={onToggleMobile} aria-label="Toggle Navigation">
            ☰
          </button>
        )}
        <div>
          {eyebrow && <p className="eyebrow">{eyebrow}</p>}
          <h1>{title}</h1>
          {subtitle && <p className="subtitle">{subtitle}</p>}
        </div>
      </div>
      {actions && <div className="topbar-actions">{actions}</div>}
    </header>
  );
}
