// src/components/common/Toast.tsx

'use client';

import { useEffect, useState } from 'react';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastProps {
    id: string;
    type: ToastType;
    message: string;
    duration?: number;
    onClose: (id: string) => void;
}

export default function Toast({ id, type, message, duration = 4000, onClose }: ToastProps) {
    const [isVisible, setIsVisible] = useState(false);
    const [isExiting, setIsExiting] = useState(false);

    useEffect(() => {
        // Trigger enter animation
        setTimeout(() => setIsVisible(true), 10);

        // Auto-dismiss
        const timer = setTimeout(() => {
            handleClose();
        }, duration);

        return () => clearTimeout(timer);
    }, [duration]);

    const handleClose = () => {
        setIsExiting(true);
        setIsVisible(false);
        setTimeout(() => onClose(id), 300);
    };

    const config = {
        success: {
            bg: 'bg-green-500 dark:bg-green-600',
            border: 'border-green-500 dark:border-green-600',
            icon: CheckCircle,
            iconColor: 'text-white',
        },
        error: {
            bg: 'bg-red-500 dark:bg-red-600',
            border: 'border-red-500 dark:border-red-600',
            icon: AlertCircle,
            iconColor: 'text-white',
        },
        warning: {
            bg: 'bg-yellow-500 dark:bg-yellow-600',
            border: 'border-yellow-500 dark:border-yellow-600',
            icon: AlertTriangle,
            iconColor: 'text-white',
        },
        info: {
            bg: 'bg-blue-500 dark:bg-blue-600',
            border: 'border-blue-500 dark:border-blue-600',
            icon: Info,
            iconColor: 'text-white',
        },
    };

    const { bg, border, icon: Icon, iconColor } = config[type];

    return (
        <div
            className={`
        mb-3 bg-sija-surface border-4 border-sija-border shadow-hard-lg
        max-w-md w-full transform transition-all duration-300
        ${isVisible && !isExiting ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
      `}
        >
            <div className="flex items-start gap-3 p-4">
                {/* Icon */}
                <div className={`flex-shrink-0 w-10 h-10 ${bg} border-2 ${border} flex items-center justify-center transition-colors duration-300`}>
                    <Icon className={`w-5 h-5 ${iconColor}`} strokeWidth={2.5} />
                </div>

                {/* Message */}
                <div className="flex-1 min-w-0 pt-1">
                    <p className="text-sija-text font-bold text-sm leading-relaxed break-words transition-colors duration-300">
                        {message}
                    </p>
                </div>

                {/* Close button */}
                <button
                    onClick={handleClose}
                    className="flex-shrink-0 p-1 text-sija-text/60 hover:text-sija-primary border-2 border-transparent hover:border-sija-border transition-all duration-300"
                    aria-label="Close"
                >
                    <X size={20} strokeWidth={2.5} />
                </button>
            </div>

            {/* Progress bar */}
            <div className="h-1 bg-sija-surface border-t-2 border-sija-border/20 transition-colors duration-300">
                <div
                    className={`h-full ${bg} transition-colors duration-300`}
                    style={{
                        animation: `progress ${duration}ms linear`,
                    }}
                />
            </div>

            <style jsx>{`
        @keyframes progress {
          from {
            width: 100%;
          }
          to {
            width: 0%;
          }
        }
      `}</style>
        </div>
    );
}
