import { useEffect } from 'react';

/**
 * Standardized Success Modal Component
 * Single source of truth for success notifications across the application
 *
 * Features:
 * - Consistent typography, sizing, spacing, colors, icons
 * - Smooth animations
 * - Optional auto-close functionality
 * - Optional callback handlers
 *
 * Usage:
 * <SuccessModal
 *   open={isOpen}
 *   title="Success!"
 *   message="Your action completed successfully."
 *   onClose={handleClose}
 *   actionLabel="Done"
 *   autoClose={3000}
 * />
 */
export function SuccessModal({
  open,
  title = "Success",
  message = "Operation completed successfully.",
  onClose,
  actionLabel = "Done",
  secondaryLabel = null,
  onSecondaryAction = null,
  autoClose = null, // ms, null = no auto-close
  width = 340,
}) {
  useEffect(() => {
    if (!autoClose || !open) return;
    const timer = setTimeout(onClose, autoClose);
    return () => clearTimeout(timer);
  }, [open, autoClose, onClose]);

  if (!open) return null;

  return (
    <>
      <div style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(10,22,40,0.5)',
        zIndex: 300,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        animation: 'fadeOverlay 0.2s ease',
      }}>
        <div style={{
          background: '#fff',
          borderRadius: '16px',
          padding: '28px',
          width,
          maxWidth: 'calc(100% - 32px)',
          boxShadow: '0 20px 60px rgba(0,0,0,0.18)',
          textAlign: 'left',
          animation: 'slideUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
        }}>
          {/* Icon */}
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            background: '#dcfce7',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#16a34a',
            marginBottom: '14px',
            flexShrink: 0,
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>

          {/* Title */}
          <h2 style={{
            fontSize: '16px',
            fontWeight: '800',
            color: '#0f172a',
            marginBottom: '6px',
            margin: '0 0 6px 0',
          }}>
            {title}
          </h2>

          {/* Message */}
          <p style={{
            fontSize: '13px',
            color: '#64748b',
            lineHeight: '1.6',
            marginBottom: '20px',
            margin: '0 0 20px 0',
          }}>
            {message}
          </p>

          {/* Actions */}
          <div style={{
            display: 'flex',
            gap: '10px',
            justifyContent: 'flex-end',
          }}>
            {secondaryLabel && (
              <button
                onClick={onSecondaryAction || onClose}
                style={{
                  padding: '8px 16px',
                  background: '#fff',
                  color: '#64748b',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  transition: 'all 0.15s',
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = '#f8fafc';
                  e.target.style.borderColor = '#cbd5e1';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = '#fff';
                  e.target.style.borderColor = '#e2e8f0';
                }}
              >
                {secondaryLabel}
              </button>
            )}
            <button
              onClick={onClose}
              style={{
                padding: '8px 16px',
                background: '#16a34a',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer',
                fontFamily: 'inherit',
                transition: 'all 0.15s',
              }}
              onMouseEnter={(e) => {
                e.target.style.background = '#15803d';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = '#16a34a';
              }}
            >
              {actionLabel}
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeOverlay {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(16px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </>
  );
}

export default SuccessModal;
