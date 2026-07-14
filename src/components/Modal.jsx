export default function Modal({ title, onClose, children }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-panel card"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h3>{title}</h3>
          <button
            className="modal-close"
            onClick={onClose}
            aria-label="Tutup"
            type="button"
          >
            ✕
          </button>
        </div>
        <div className="modal-body">{children}</div>
      </div>

      <style>{`
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(20, 26, 20, 0.45);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          z-index: 100;
        }
        .modal-panel {
          width: 100%;
          max-width: 480px;
          max-height: 88vh;
          overflow-y: auto;
        }
        .modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 20px 24px;
          border-bottom: 1px solid var(--color-border);
        }
        .modal-header h3 { font-size: 19px; }
        .modal-close {
          background: none;
          border: none;
          font-size: 16px;
          color: var(--color-muted);
          line-height: 1;
          padding: 4px;
        }
        .modal-close:hover { color: var(--color-ink); }
        .modal-body { padding: 24px; }
      `}</style>
    </div>
  );
}
