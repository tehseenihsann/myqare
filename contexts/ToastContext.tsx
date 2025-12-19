'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import Toast, { Toast as ToastType } from '@/components/ui/Toast';

let toastIdCounter = 0;

interface ToastContextType {
  showSuccess: (title: string, message?: string) => string;
  showError: (title: string, message?: string) => string;
  showInfo: (title: string, message?: string) => string;
  showWarning: (title: string, message?: string) => string;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastType[]>([]);

  const addToast = useCallback((toast: Omit<ToastType, 'id'>) => {
    const id = `toast-${++toastIdCounter}`;
    const newToast: ToastType = {
      ...toast,
      id,
      duration: toast.duration ?? 5000,
    };
    setToasts((prev) => [...prev, newToast]);
    return id;
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const showSuccess = useCallback(
    (title: string, message?: string) => {
      return addToast({ type: 'success', title, message });
    },
    [addToast]
  );

  const showError = useCallback(
    (title: string, message?: string) => {
      return addToast({ type: 'error', title, message });
    },
    [addToast]
  );

  const showInfo = useCallback(
    (title: string, message?: string) => {
      return addToast({ type: 'info', title, message });
    },
    [addToast]
  );

  const showWarning = useCallback(
    (title: string, message?: string) => {
      return addToast({ type: 'warning', title, message });
    },
    [addToast]
  );

  return (
    <ToastContext.Provider value={{ showSuccess, showError, showInfo, showWarning }}>
      {children}
      {toasts.length > 0 && (
        <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
          {toasts.map((toast) => (
            <Toast key={toast.id} toast={toast} onClose={removeToast} />
          ))}
        </div>
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

