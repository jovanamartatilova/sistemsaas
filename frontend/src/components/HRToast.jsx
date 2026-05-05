import { useEffect, useRef, useState } from 'react';

const TOAST_CFG = {
  success: {
    bg: '#f0fdf4',
    border: '#86efac',
    color: '#166534',
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12" />
      </svg>
    ),
  },
  error: {
    bg: '#fff1f2',
    border: '#fca5a5',
    color: '#991b1b',
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
      </svg>
    ),
  },
  info: {
    bg: '#eff6ff',
    border: '#93c5fd',
    color: '#1e40af',
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="16" x2="12" y2="12" />
        <line x1="12" y1="8" x2="12.01" y2="8" />
      </svg>
    ),
  },
};

export function useHRToast() {
  const [toasts, setToasts] = useState([]);
  const timersRef = useRef(new Map());

  useEffect(() => {
    return () => {
      timersRef.current.forEach((timerId) => clearTimeout(timerId));
      timersRef.current.clear();
    };
  }, []);

  const pushToast = (message, type = 'success', duration = 3000) => {
    const id = Date.now() + Math.random();
    const timerId = window.setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
      timersRef.current.delete(id);
    }, duration);

    timersRef.current.set(id, timerId);
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  const removeToast = (id) => {
    setToasts((prev) => {
      const timerId = timersRef.current.get(id);
      if (timerId) {
        clearTimeout(timerId);
        timersRef.current.delete(id);
      }
      return prev.filter((toast) => toast.id !== id);
    });
  };

  return { toasts, pushToast, removeToast };
}

export function HRToastStack({ toasts, onDismiss }) {
  return (
    <div style={{ position: 'fixed', right: '24px', bottom: '24px', zIndex: 9999, display: 'flex', flexDirection: 'column', gap: '10px', pointerEvents: 'none' }}>
      {toasts.map((toast) => {
        const cfg = TOAST_CFG[toast.type] || TOAST_CFG.success;
        return (
          <div
            key={toast.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              minWidth: '260px',
              maxWidth: '360px',
              padding: '12px 14px',
              borderRadius: '14px',
              background: cfg.bg,
              border: `1px solid ${cfg.border}`,
              color: cfg.color,
              boxShadow: '0 12px 30px rgba(15, 23, 42, 0.12)',
              animation: 'hrToastIn 0.22s ease',
              pointerEvents: 'auto',
            }}
          >
            <span style={{ width: '24px', height: '24px', borderRadius: '50%', background: cfg.color, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              {cfg.icon}
            </span>
            <div style={{ flex: 1, fontSize: '13px', fontWeight: 600, lineHeight: 1.45 }}>{toast.message}</div>
            <button
              type="button"
              onClick={() => onDismiss(toast.id)}
              style={{ border: 'none', background: 'transparent', color: cfg.color, cursor: 'pointer', display: 'flex', padding: 0, opacity: 0.7 }}
              aria-label="Dismiss notification"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        );
      })}
      <style>{`@keyframes hrToastIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }`}</style>
    </div>
  );
}