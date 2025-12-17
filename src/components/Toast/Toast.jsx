// src/components/Toast/Toast.jsx
import React, { useEffect } from 'react';
import { 
  FaCheckCircle, 
  FaExclamationCircle, 
  FaInfoCircle, 
  FaTimes,
  FaExclamationTriangle
} from 'react-icons/fa';

const Toast = ({ message, type = 'info', onClose, duration = 4000 }) => {
  useEffect(() => {
    if (duration && onClose) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const getToastStyles = () => {
    switch (type) {
      case 'success':
        return {
          backgroundColor: '#10b981',
          icon: <FaCheckCircle />,
          label: 'Éxito'
        };
      case 'error':
        return {
          backgroundColor: '#ef4444',
          icon: <FaExclamationCircle />,
          label: 'Error'
        };
      case 'warning':
        return {
          backgroundColor: '#f59e0b',
          icon: <FaExclamationTriangle />,
          label: 'Advertencia'
        };
      case 'info':
      default:
        return {
          backgroundColor: '#3b82f6',
          icon: <FaInfoCircle />,
          label: 'Información'
        };
    }
  };

  const toastStyles = getToastStyles();

  return (
    <div style={{
      ...styles.toast,
      backgroundColor: toastStyles.backgroundColor
    }}>
      <div style={styles.toastContent}>
        <div style={styles.toastIcon}>
          {toastStyles.icon}
        </div>
        <div style={styles.toastMessage}>
          <div style={styles.toastLabel}>{toastStyles.label}</div>
          <div style={styles.toastText}>{message}</div>
        </div>
      </div>
      <button 
        onClick={onClose}
        style={styles.closeButton}
        aria-label="Cerrar notificación"
      >
        <FaTimes />
      </button>
    </div>
  );
};

// Contenedor de toasts
export const ToastContainer = ({ toasts, removeToast }) => {
  return (
    <div style={styles.container}>
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => removeToast(toast.id)}
          duration={toast.duration}
        />
      ))}
    </div>
  );
};

// Hook para manejar toasts
export const useToast = () => {
  const [toasts, setToasts] = React.useState([]);

  const addToast = (message, type = 'info', duration = 4000) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type, duration }]);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const success = (message, duration) => addToast(message, 'success', duration);
  const error = (message, duration) => addToast(message, 'error', duration);
  const warning = (message, duration) => addToast(message, 'warning', duration);
  const info = (message, duration) => addToast(message, 'info', duration);

  return {
    toasts,
    removeToast,
    success,
    error,
    warning,
    info
  };
};

const styles = {
  container: {
    position: 'fixed',
    top: '24px',
    right: '24px',
    zIndex: 9999,
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    maxWidth: '420px',
    pointerEvents: 'none'
  },
  toast: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16px 20px',
    borderRadius: '12px',
    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2), 0 6px 10px rgba(0, 0, 0, 0.15)',
    color: '#ffffff',
    minWidth: '320px',
    maxWidth: '420px',
    animation: 'slideInRight 0.3s ease-out',
    pointerEvents: 'auto',
    backdropFilter: 'blur(10px)'
  },
  toastContent: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    flex: 1
  },
  toastIcon: {
    fontSize: '24px',
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  toastMessage: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  toastLabel: {
    fontSize: '14px',
    fontWeight: '700',
    lineHeight: '1.2',
    opacity: 0.95
  },
  toastText: {
    fontSize: '14px',
    lineHeight: '1.4',
    opacity: 0.9,
    fontWeight: '500'
  },
  closeButton: {
    background: 'none',
    border: 'none',
    color: '#ffffff',
    cursor: 'pointer',
    padding: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '18px',
    opacity: 0.7,
    transition: 'opacity 0.2s ease',
    marginLeft: '12px',
    flexShrink: 0
  }
};

// Inyectar animaciones
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = `
    @keyframes slideInRight {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
    
    .toast-close-button:hover {
      opacity: 1 !important;
    }
  `;
  
  if (!document.getElementById('toast-animations')) {
    styleSheet.id = 'toast-animations';
    document.head.appendChild(styleSheet);
  }
}

export default Toast;