import React, { createContext, useContext, useState, useCallback } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

const ToastContext = createContext();

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) throw new Error('useToast must be used within a ToastProvider');
    return context;
};

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const addToast = useCallback((message, type = 'info', duration = 3000) => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type }]);

        if (duration) {
            setTimeout(() => {
                removeToast(id);
            }, duration);
        }
    }, []);

    const removeToast = useCallback((id) => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ addToast, removeToast }}>
            {children}
            
            <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-3 pointer-events-none items-center">
                {toasts.map(toast => (
                    <ToastItem key={toast.id} {...toast} onClose={() => removeToast(toast.id)} />
                ))}
            </div>
        </ToastContext.Provider>
    );
};

const ToastItem = ({ message, type, onClose }) => {
    
    const styles = {
        success: 'border-l-4 border-l-emerald-500 text-slate-800 dark:text-white',
        error: 'border-l-4 border-l-red-500 text-slate-800 dark:text-white',
        warning: 'border-l-4 border-l-amber-500 text-slate-800 dark:text-white',
        info: 'border-l-4 border-l-blue-500 text-slate-800 dark:text-white',
    };

    const iconColors = {
        success: 'text-emerald-500',
        error: 'text-red-500',
        warning: 'text-amber-500',
        info: 'text-blue-500',
    };

    const icons = {
        success: <CheckCircle size={24} />,
        error: <AlertCircle size={24} />,
        warning: <AlertTriangle size={24} />,
        info: <Info size={24} />,
    };

    return (
        <div className={`pointer-events-auto flex items-center gap-4 px-6 py-5 rounded-xl shadow-2xl backdrop-blur-xl border border-white/20 min-w-[320px] animate-slide-in-down transition-all transform hover:scale-[1.02] bg-white/90 dark:bg-slate-900/90 ${styles[type] || styles.info}`}>
            <div className={`p-2 rounded-full bg-slate-100 dark:bg-slate-800 ${iconColors[type]}`}>
                {icons[type] || icons.info}
            </div>
            <div className="flex-1">
                <h4 className="font-bold text-sm capitalize mb-0.5 opacity-60">System Notification</h4>
                <p className="font-bold text-sm leading-snug">{message}</p>
            </div>
            <button onClick={onClose} className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700/50 rounded-full transition-colors opacity-50 hover:opacity-100">
                <X size={16} />
            </button>
        </div>
    );
};
