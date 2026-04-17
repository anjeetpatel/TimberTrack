export default function ConfirmDialog({ title, message, onConfirm, onCancel, confirmText = 'Confirm', icon = 'help' }) {
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '420px' }}>
        <div className="confirm-dialog">
          <span className="material-symbols-outlined">{icon}</span>
          <h3>{title}</h3>
          <p>{message}</p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
            <button className="btn btn-secondary" onClick={onCancel}>Cancel</button>
            <button className="btn btn-primary" onClick={onConfirm}>{confirmText}</button>
          </div>
        </div>
      </div>
    </div>
  );
}
