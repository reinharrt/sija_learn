// src/contexts/NotificationContext.tsx

'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import Toast, { ToastType } from '@/components/common/Toast';
import ConfirmModal from '@/components/common/ConfirmModal';

interface ToastNotification {
    id: string;
    type: ToastType;
    message: string;
    duration?: number;
}

interface ConfirmOptions {
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    type?: 'danger' | 'warning' | 'info';
}

interface NotificationContextType {
    showToast: (type: ToastType, message: string, duration?: number) => void;
    showConfirm: (options: ConfirmOptions) => Promise<boolean>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<ToastNotification[]>([]);
    const [confirmModal, setConfirmModal] = useState<{
        isOpen: boolean;
        options: ConfirmOptions;
        resolve: (value: boolean) => void;
    } | null>(null);
    const [isConfirmLoading, setIsConfirmLoading] = useState(false);

    const showToast = useCallback((type: ToastType, message: string, duration = 4000) => {
        const id = Math.random().toString(36).substring(2, 9);
        setToasts((prev) => [...prev, { id, type, message, duration }]);
    }, []);

    const removeToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, []);

    const showConfirm = useCallback((options: ConfirmOptions): Promise<boolean> => {
        return new Promise((resolve) => {
            setConfirmModal({
                isOpen: true,
                options,
                resolve,
            });
        });
    }, []);

    const handleConfirm = useCallback(() => {
        if (confirmModal) {
            setIsConfirmLoading(true);
            // Small delay to show loading state
            setTimeout(() => {
                confirmModal.resolve(true);
                setConfirmModal(null);
                setIsConfirmLoading(false);
            }, 100);
        }
    }, [confirmModal]);

    const handleCancel = useCallback(() => {
        if (confirmModal) {
            confirmModal.resolve(false);
            setConfirmModal(null);
        }
    }, [confirmModal]);

    return (
        <NotificationContext.Provider value={{ showToast, showConfirm }}>
            {children}

            {/* Toast Container */}
            <div className="fixed top-20 right-4 z-50 flex flex-col items-end pointer-events-none">
                <div className="pointer-events-auto">
                    {toasts.map((toast) => (
                        <Toast
                            key={toast.id}
                            id={toast.id}
                            type={toast.type}
                            message={toast.message}
                            duration={toast.duration}
                            onClose={removeToast}
                        />
                    ))}
                </div>
            </div>

            {/* Confirm Modal */}
            {confirmModal && (
                <ConfirmModal
                    isOpen={confirmModal.isOpen}
                    onClose={handleCancel}
                    onConfirm={handleConfirm}
                    title={confirmModal.options.title}
                    message={confirmModal.options.message}
                    confirmText={confirmModal.options.confirmText}
                    cancelText={confirmModal.options.cancelText}
                    type={confirmModal.options.type}
                    isLoading={isConfirmLoading}
                />
            )}
        </NotificationContext.Provider>
    );
}

export function useNotification() {
    const context = useContext(NotificationContext);
    if (context === undefined) {
        throw new Error('useNotification must be used within a NotificationProvider');
    }
    return context;
}
