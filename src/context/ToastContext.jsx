import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, Info, Sparkles, X } from 'lucide-react';
import { soundFx } from '../utils/sound';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback(({ title, description, type = 'info', duration = 4000, action }) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 7);
    
    // Play audio cue
    if (type === 'success') {
      soundFx.playSuccess();
    } else {
      soundFx.playClick();
    }

    setToasts((prev) => [...prev, { id, title, description, type, action }]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      {/* Toast Container */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 pointer-events-none max-w-sm w-full px-4 sm:px-0">
        <AnimatePresence mode="popLayout">
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              layout
              initial={{ opacity: 0, y: 30, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.9, transition: { duration: 0.2 } }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              className="pointer-events-auto relative overflow-hidden rounded-xl border border-white/10 bg-[#0F1118]/95 backdrop-blur-xl p-4 shadow-2xl shadow-black/80 flex items-start gap-3.5 group"
            >
              {/* Left Accent Bar */}
              <div
                className={`absolute left-0 top-0 bottom-0 w-1 ${
                  toast.type === 'success'
                    ? 'bg-[#E5A93C]'
                    : toast.type === 'error'
                    ? 'bg-rose-500'
                    : 'bg-cyan-400'
                }`}
              />

              <div className="mt-0.5 shrink-0">
                {toast.type === 'success' && (
                  <div className="w-8 h-8 rounded-lg bg-[#E5A93C]/10 border border-[#E5A93C]/30 flex items-center justify-center text-[#E5A93C]">
                    <Sparkles className="w-4 h-4" />
                  </div>
                )}
                {toast.type === 'error' && (
                  <div className="w-8 h-8 rounded-lg bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
                    <AlertCircle className="w-4 h-4" />
                  </div>
                )}
                {toast.type === 'info' && (
                  <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                    <Info className="w-4 h-4" />
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0 pr-2">
                <p className="text-sm font-semibold text-white tracking-wide">{toast.title}</p>
                {toast.description && (
                  <p className="text-xs text-slate-400 mt-0.5 line-clamp-2 leading-relaxed">
                    {toast.description}
                  </p>
                )}
                {toast.action && (
                  <button
                    onClick={() => {
                      toast.action.onClick();
                      removeToast(toast.id);
                    }}
                    className="mt-2 text-xs font-semibold text-[#E5A93C] hover:text-[#f8c66e] flex items-center gap-1 transition-colors"
                  >
                    {toast.action.label} &rarr;
                  </button>
                )}
              </div>

              <button
                onClick={() => removeToast(toast.id)}
                className="text-slate-500 hover:text-white transition-colors p-1 -mr-1"
                aria-label="Close toast"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
};
