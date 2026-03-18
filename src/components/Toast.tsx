import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastProps {
  toasts: Toast[];
  onRemove: (id: string) => void;
}

const ToastItem: React.FC<{ toast: Toast, onRemove: (id: string) => void }> = ({ toast, onRemove }) => {
  useEffect(() => {
    const timer = setTimeout(() => onRemove(toast.id), 5000);
    return () => clearTimeout(timer);
  }, [toast.id, onRemove]);

  const icons = {
    success: <CheckCircle2 className="h-5 w-5 text-emerald-500" />,
    error: <AlertCircle className="h-5 w-5 text-rose-500" />,
    info: <Info className="h-5 w-5 text-indigo-500" />
  };

  const colors = {
    success: 'border-emerald-500/20 bg-emerald-50/90 text-emerald-900',
    error: 'border-rose-500/20 bg-rose-50/90 text-rose-900',
    info: 'border-indigo-500/20 bg-indigo-50/90 text-indigo-900'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
      layout
      className={`
        flex items-center gap-4 px-5 py-4 rounded-[1.25rem] border backdrop-blur-md shadow-2xl min-w-[320px] max-w-md
        ${colors[toast.type]}
      `}
    >
      <div className="shrink-0">{icons[toast.type]}</div>
      <p className="flex-1 text-sm font-bold uppercase tracking-tight leading-snug">{toast.message}</p>
      <button 
        onClick={() => onRemove(toast.id)}
        className="p-1.5 rounded-lg hover:bg-black/5 transition-colors text-slate-400 hover:text-slate-600"
      >
        <X className="h-4 w-4" />
      </button>
    </motion.div>
  );
};

const ToastContainer: React.FC<ToastProps> = ({ toasts, onRemove }) => {
  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-3 items-center pointer-events-none">
      <div className="pointer-events-auto flex flex-col gap-3">
        <AnimatePresence mode="popLayout">
          {toasts.map((toast) => (
            <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ToastContainer;
