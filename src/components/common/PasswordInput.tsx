// ============================================
// src/components/common/PasswordInput.tsx
// Password Input Component - Neobrutalist Design with Toggle
// ============================================

'use client';

import { useState } from 'react';
import { AlertCircle, Eye, EyeOff } from 'lucide-react';
import Input from './Input';

interface PasswordInputProps {
    label?: string;
    name?: string;
    value?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder?: string;
    required?: boolean;
    disabled?: boolean;
    error?: string;
    className?: string;
    helperText?: string;
}

export default function PasswordInput({
    label,
    name,
    value,
    onChange,
    placeholder,
    required = false,
    disabled = false,
    error,
    className = '',
    helperText,
}: PasswordInputProps) {
    const [showPassword, setShowPassword] = useState(false);

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    return (
        <div className={`relative ${className}`}>
            {label && (
                <label className="block text-sm font-bold text-sija-text mb-2 transition-colors duration-300">
                    {label}
                    {required && <span className="text-red-600 dark:text-red-400 ml-1">*</span>}
                </label>
            )}
            <div className="relative">
                <input
                    type={showPassword ? 'text' : 'password'}
                    name={name}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    required={required}
                    disabled={disabled}
                    className={`w-full px-4 py-3 border-2 font-medium focus:outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed pr-12 ${error
                            ? 'border-red-600 bg-red-50 dark:bg-red-950/30 dark:border-red-500 text-sija-text focus:border-red-700 dark:focus:border-red-400'
                            : 'border-sija-border bg-sija-background text-sija-text focus:border-sija-primary placeholder:text-sija-text/40'
                        }`}
                />
                <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-sija-text/60 hover:text-sija-primary transition-colors focus:outline-none"
                    tabIndex={-1}
                >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
            </div>
            {error && (
                <div className="mt-2 flex items-start gap-2 text-red-600 dark:text-red-400 transition-colors duration-300">
                    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <p className="text-sm font-medium">{error}</p>
                </div>
            )}
            {helperText && !error && (
                <p className="mt-2 text-xs text-sija-text/60 transition-colors duration-300">{helperText}</p>
            )}
        </div>
    );
}
