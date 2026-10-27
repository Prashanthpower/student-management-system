export default function ConfirmationModal({ isOpen, title, message, onConfirm, onCancel, confirmText = 'Delete', isDanger = true, loading = false }) {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop">
      <div className="confirmation-modal" role="dialog" aria-modal="true">
        <div className="confirmation-header">
          <span className="warning-symbol">⚠️</span>
          <h3>{title}</h3>
        </div>
        <p className="confirmation-body">{message}</p>
        <div className="modal-button-row">
          <button type="button" className="cancel-button" onClick={onCancel} disabled={loading}>
            Cancel
          </button>
          <button
            type="button"
            className={isDanger ? 'danger-button' : 'primary-button'}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? 'Processing...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
