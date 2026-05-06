/**
 * Standardized Notification Utilities
 * Central location for all notification patterns and helpers
 *
 * This module provides standardized configurations and helper functions
 * for consistent notifications across the entire application.
 */

/**
 * Standard toast configuration (used by HRToast)
 * Single source of truth for toast styling
 */
export const TOAST_STYLES = {
  success: {
    bg: '#f0fdf4',
    border: '#86efac',
    color: '#166534',
  },
  error: {
    bg: '#fff1f2',
    border: '#fca5a5',
    color: '#991b1b',
  },
  info: {
    bg: '#eff6ff',
    border: '#93c5fd',
    color: '#1e40af',
  },
  warning: {
    bg: '#fffbeb',
    border: '#fde047',
    color: '#92400e',
  },
};

/**
 * Standard toast configuration
 * Duration: 3000ms (default)
 * Position: bottom-right
 * Z-index: 9999
 */
export const TOAST_CONFIG = {
  DURATION: 3000,
  POSITION: { bottom: 24, right: 24 },
  Z_INDEX: 9999,
  ANIMATION_DURATION: 220, // ms
};

/**
 * Standard modal configuration
 * Z-index: 300
 * Overlay: rgba(10,22,40,0.5)
 * Width: 340px
 */
export const MODAL_CONFIG = {
  Z_INDEX: 300,
  OVERLAY: 'rgba(10,22,40,0.5)',
  DEFAULT_WIDTH: 340,
  ANIMATION_DURATION: 300, // ms
};

/**
 * Success icon SVG component
 */
export const SuccessIcon = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

/**
 * Error icon SVG component
 */
export const ErrorIcon = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

/**
 * Close/Dismiss icon SVG component
 */
export const CloseIcon = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

/**
 * Default success messages for common operations
 */
export const DEFAULT_MESSAGES = {
  SAVED: 'Saved successfully',
  CREATED: 'Created successfully',
  UPDATED: 'Updated successfully',
  DELETED: 'Deleted successfully',
  SUBMITTED: 'Submitted successfully',
  COPIED: 'Copied to clipboard',
  SENT: 'Sent successfully',
};

/**
 * Helper hook to show toast notifications
 * Pass the pushToast function from useHRToast
 *
 * Usage:
 * const { toasts, pushToast } = useHRToast();
 * const showSuccess = createShowToast(pushToast);
 * showSuccess('Item saved successfully');
 */
export const createShowToast = (pushToastFn) => {
  return {
    success: (msg = DEFAULT_MESSAGES.SAVED, duration = TOAST_CONFIG.DURATION) =>
      pushToastFn(msg, 'success', duration),
    error: (msg, duration = TOAST_CONFIG.DURATION) =>
      pushToastFn(msg, 'error', duration),
    info: (msg, duration = TOAST_CONFIG.DURATION) =>
      pushToastFn(msg, 'info', duration),
  };
};

/**
 * Keyboard event handler for modals
 * Closes modal on Escape key press
 *
 * Usage:
 * useEffect(() => {
 *   document.addEventListener('keydown', createModalKeyHandler(onClose));
 *   return () => document.removeEventListener('keydown', createModalKeyHandler(onClose));
 * }, [onClose]);
 */
export const createModalKeyHandler = (onClose) => (e) => {
  if (e.key === 'Escape') onClose?.();
};

/**
 * Animation keyframes for notifications
 * Includes toast entrance, modal transitions, etc.
 */
export const ANIMATION_STYLES = `
  @keyframes hrToastIn {
    from {
      opacity: 0;
      transform: translateY(12px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

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

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
`;

/**
 * Reusable button styles for consistency
 */
export const BUTTON_STYLES = {
  PRIMARY: {
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
  },
  SECONDARY: {
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
  },
  DANGER: {
    padding: '8px 16px',
    background: '#ef4444',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    fontFamily: 'inherit',
    transition: 'all 0.15s',
  },
};

export default {
  TOAST_STYLES,
  TOAST_CONFIG,
  MODAL_CONFIG,
  DEFAULT_MESSAGES,
  ANIMATION_STYLES,
  BUTTON_STYLES,
  SuccessIcon,
  ErrorIcon,
  CloseIcon,
  createShowToast,
  createModalKeyHandler,
};
