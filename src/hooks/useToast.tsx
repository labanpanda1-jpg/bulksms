import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { CheckCircle, AlertCircle, Info, XCircle, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
  id: string;
  type: ToastType;
  message: string;
}

interface ToastContextValue {
  toast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((message: string, type: ToastType = 'info') => {
    const id = Date.now().toString(36) + Math.random().toString(36).slice(2);
    setToasts(prev => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 5000);
  }, []);

  const dismiss = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 max-w-md w-full sm:w-auto">
        {toasts.map(t => (
          <div
            key={t.id}
            className={`flex items-start gap-3 rounded-lg shadow-lg p-4 bg-white border-l-4 animate-slide-in ${
              t.type === 'success' ? 'border-green-500' :
              t.type === 'error' ? 'border-red-500' :
              t.type === 'warning' ? 'border-amber-500' :
              'border-blue-500'
            }`}
          >
            {t.type === 'success' && <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />}
            {t.type === 'error' && <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />}
            {t.type === 'warning' && <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />}
            {t.type === 'info' && <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />}
            <p className="text-sm text-gray-800 flex-1">{t.message}</p>
            <button onClick={() => dismiss(t.id)} className="text-gray-400 hover:text-gray-600">
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
