// ============================================
// src/components/common/Input.tsx
// Input Component - Neobrutalist Design
// ============================================

'use client';

import { AlertCircle } from 'lucide-react';

interface InputProps {
  label?: string;
  type?: string;
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

export default function Input({
  label,
  type = 'text',
  name,
  value,
  onChange,
  placeholder,
  required = false,
  disabled = false,
  error,
  className = '',
  helperText,
}: InputProps) {
  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-bold text-gray-900 mb-2">
          {label}
          {required && <span className="text-red-600 ml-1">*</span>}
        </label>
      )}
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        className={`w-full px-4 py-3 border-2 font-medium focus:outline-none transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-500 ${
          error 
            ? 'border-red-600 bg-red-50 focus:border-red-700' 
            : 'border-gray-900 bg-white focus:border-blue-600'
        }`}
      />
      {error && (
        <div className="mt-2 flex items-start gap-2 text-red-600">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}
      {helperText && !error && (
        <p className="mt-2 text-xs text-gray-600">{helperText}</p>
      )}
    </div>
  );
}