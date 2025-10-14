import React, { useState, useEffect } from 'react';
import { Toast, ToastContainer as BootstrapToastContainer } from 'react-bootstrap';
import toastService, { ToastItem } from '../../services/toastService';

const ToastContainer: React.FC = () => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    const unsubscribe = toastService.subscribe(setToasts);
    return unsubscribe;
  }, []);

  const handleClose = (id: string) => {
    toastService.removeToast(id);
  };

  const getVariant = (type: ToastItem['type']) => {
    switch (type) {
      case 'success':
        return 'success';
      case 'error':
        return 'danger';
      case 'warning':
        return 'warning';
      case 'info':
        return 'info';
      default:
        return 'primary';
    }
  };

  const getIcon = (type: ToastItem['type']) => {
    switch (type) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      case 'info':
        return 'ℹ️';
      default:
        return 'ℹ️';
    }
  };

  return (
    <BootstrapToastContainer 
      position="top-end" 
      className="p-3"
      style={{ zIndex: 1050 }}
    >
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          show={true}
          onClose={() => handleClose(toast.id)}
          bg={getVariant(toast.type)}
          className="text-white mb-2"
          autohide={toast.options?.duration !== 0}
          delay={toast.options?.duration || 4500}
        >
          <Toast.Header>
            <span className="me-2">{getIcon(toast.type)}</span>
            <strong className="me-auto">{toast.message}</strong>
          </Toast.Header>
          {toast.description && (
            <Toast.Body>
              {toast.description}
              {toast.options?.action && (
                <div className="mt-2">
                  <button
                    className="btn btn-sm btn-outline-light"
                    onClick={toast.options.action.onClick}
                  >
                    {toast.options.action.label}
                  </button>
                </div>
              )}
            </Toast.Body>
          )}
        </Toast>
      ))}
    </BootstrapToastContainer>
  );
};

export default ToastContainer;
