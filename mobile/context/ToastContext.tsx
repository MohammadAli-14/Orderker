import React, { createContext, useContext, useState, useCallback } from 'react';

export type ToastType = 'success' | 'error' | 'info';

interface ToastOptions {
    title: string;
    message: string;
    type?: ToastType;
    duration?: number;
}

interface ToastContextType {
    showToast: (options: ToastOptions) => void;
    hideToast: () => void;
    toast: (ToastOptions & { visible: boolean }) | null;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [toast, setToast] = useState<(ToastOptions & { visible: boolean }) | null>(null);

    const hideToast = useCallback(() => {
        setToast((prev) => (prev ? { ...prev, visible: false } : null));
    }, []);

    const showToast = useCallback(({ title, message, type = 'success', duration = 3000 }: ToastOptions) => {
        setToast({ title, message, type, duration, visible: true });

        if (duration > 0) {
            setTimeout(() => {
                hideToast();
            }, duration);
        }
    }, [hideToast]);

    return (
        <ToastContext.Provider value={{ showToast, hideToast, toast }}>
            {children}
        </ToastContext.Provider>
    );
};

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};
