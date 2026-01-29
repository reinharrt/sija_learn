// ============================================
// src/components/common/ConfirmModal.tsx
// Confirmation Modal - Neobrutalist Design
// ============================================

'use client';

import { useEffect, useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
  isLoading?: boolean;
}

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'danger',
  isLoading = false,
}: ConfirmModalProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      setTimeout(() => setIsAnimating(true), 10);
    } else {
      setIsAnimating(false);
      setTimeout(() => setIsVisible(false), 300);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isLoading) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, isLoading, onClose]);

  const handleConfirm = () => {
    if (!isLoading) {
      onConfirm();
    }
  };

  const handleCancel = () => {
    if (!isLoading) {
      onClose();
    }
  };

  if (!isVisible) return null;

  const colorClasses = {
    danger: {
      bg: 'bg-red-500',
      border: 'border-red-500',
      icon: 'text-red-500',
      hover: 'hover:bg-red-600 hover:border-red-600',
    },
    warning: {
      bg: 'bg-yellow-500',
      border: 'border-yellow-500',
      icon: 'text-yellow-500',
      hover: 'hover:bg-yellow-600 hover:border-yellow-600',
    },
    info: {
      bg: 'bg-blue-500',
      border: 'border-blue-500',
      icon: 'text-blue-500',
      hover: 'hover:bg-blue-600 hover:border-blue-600',
    },
  };

  const colors = colorClasses[type];

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-300 ${
        isAnimating ? 'opacity-100' : 'opacity-0'
      }`}
      onClick={handleCancel}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className={`relative bg-sija-surface border-4 border-sija-primary shadow-hard-lg max-w-md w-full transform transition-all duration-300 ${
          isAnimating ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative border-b-4 border-sija-primary p-6">
          <div className="flex items-start gap-4">
            <div className={`w-12 h-12 ${colors.bg} border-2 ${colors.border} flex items-center justify-center flex-shrink-0`}>
              <AlertTriangle className="w-7 h-7 text-white" strokeWidth={2.5} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-display text-2xl font-black text-sija-primary uppercase break-words">
                {title}
              </h3>
            </div>
          </div>
          
          {/* Close button */}
          <button
            onClick={handleCancel}
            disabled={isLoading}
            className="absolute top-4 right-4 p-2 text-sija-text hover:text-sija-primary border-2 border-transparent hover:border-sija-primary transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Close"
          >
            <X size={24} strokeWidth={2.5} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          <p className="text-sija-text font-bold text-base leading-relaxed">
            {message}
          </p>
        </div>

        {/* Footer */}
        <div className="border-t-4 border-sija-primary p-6 flex flex-col-reverse sm:flex-row gap-3 sm:gap-4 sm:justify-end">
          <button
            onClick={handleCancel}
            disabled={isLoading}
            className="w-full sm:w-auto px-6 py-3 font-display font-bold text-sm bg-sija-surface text-sija-primary border-2 border-sija-primary shadow-hard-sm hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all uppercase disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-x-0 disabled:hover:translate-y-0"
          >
            {cancelText}
          </button>
          <button
            onClick={handleConfirm}
            disabled={isLoading}
            className={`w-full sm:w-auto px-6 py-3 font-display font-bold text-sm ${colors.bg} text-white border-2 ${colors.border} shadow-hard-sm ${colors.hover} hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all uppercase disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-x-0 disabled:hover:translate-y-0 flex items-center justify-center gap-2`}
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              confirmText
            )}
          </button>
        </div>
      </div>
    </div>
  );
}