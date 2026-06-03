import React, { createContext, useContext, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from "lucide-react";

const ToastContext = createContext(null);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = "success", duration = 4000) => {
    const id = Date.now() + Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toastIcons = {
    success: <CheckCircle2 className="text-emerald-500 shrink-0" size={18} />,
    error: <XCircle className="text-rose-500 shrink-0" size={18} />,
    warning: <AlertTriangle className="text-amber-500 shrink-0" size={18} />,
    info: <Info className="text-teal-500 shrink-0" size={18} />
  };

  const toastColors = {
    success: "border-emerald-100 bg-white/95 text-slate-800 shadow-emerald-500/5",
    error: "border-rose-100 bg-white/95 text-slate-800 shadow-rose-500/5",
    warning: "border-amber-100 bg-white/95 text-slate-800 shadow-amber-500/5",
    info: "border-teal-100 bg-white/95 text-slate-800 shadow-teal-500/5"
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              layout
              initial={{ opacity: 0, y: 30, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className={`pointer-events-auto flex items-center justify-between gap-3.5 rounded-2xl border p-4 shadow-[0_20px_40px_rgba(15,23,42,0.08)] backdrop-blur-md ${toastColors[toast.type] || toastColors.info}`}
            >
              <div className="flex items-center gap-3">
                {toastIcons[toast.type] || toastIcons.info}
                <p className="text-xs font-bold font-nunito leading-relaxed">{toast.message}</p>
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition shrink-0"
              >
                <X size={14} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}
