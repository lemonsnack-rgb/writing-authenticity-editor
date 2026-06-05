import { useEffect } from 'react';
import ReplayPlayer from './ReplayPlayer.jsx';

export default function ReplayModal({ opLog, onClose, config }) {
  useEffect(() => {
    const h = e => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onClose]);

  return (
    <div className="modal-overlay">
      <div className="modal-backdrop" onClick={onClose}></div>
      <div className="modal-content">
        <button onClick={onClose} className="modal-close">✕</button>
        <ReplayPlayer opLog={opLog} onClose={onClose} config={config} />
      </div>
    </div>
  );
}
