// ========================================================================
// SISTEMA DE GESTÃO — CAMILA RODRIGUES BEAUTY STUDIO
// Component: CurrencyInput.tsx (Input de Moeda Real Brasileiro BRL)
// ========================================================================

import React, { useState, useEffect, forwardRef } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { formatBRL } from '../../utils/formatters';

export interface CurrencyInputProps {
  label?: string;
  value?: number;
  onChange?: (val: number) => void;
  error?: string;
  helperText?: string;
  className?: string;
  required?: boolean;
  disabled?: boolean;
  id?: string;
}

export const CurrencyInput = forwardRef<HTMLInputElement, CurrencyInputProps>(
  ({ label, value = 0, onChange, error, helperText, className, required, disabled, id }, ref) => {
    const [displayValue, setDisplayValue] = useState<string>(formatBRL(value));

    useEffect(() => {
      setDisplayValue(formatBRL(value));
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value.replace(/\D/g, '');
      const numValue = raw ? parseInt(raw, 10) / 100 : 0;
      setDisplayValue(formatBRL(numValue));
      if (onChange) {
        onChange(numValue);
      }
    };

    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="block text-xs font-semibold uppercase tracking-wider text-studio-muted dark:text-champagne-300 mb-1.5">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <div className="relative rounded-xl shadow-sm">
          <input
            id={inputId}
            ref={ref}
            type="text"
            inputMode="numeric"
            value={displayValue}
            onChange={handleChange}
            disabled={disabled}
            className={twMerge(
              clsx(
                'block w-full rounded-xl border transition-colors duration-200 text-sm font-semibold',
                'bg-white dark:bg-studio-darkCard text-studio-text dark:text-champagne-100 placeholder:text-studio-muted/60',
                'focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-gold-500',
                'py-2.5 px-3.5',
                error
                  ? 'border-red-400 focus:border-red-500 focus:ring-red-400/30'
                  : 'border-champagne-300 dark:border-studio-darkBorder hover:border-gold-400/60',
                disabled && 'opacity-60 cursor-not-allowed bg-champagne-100',
                className
              )
            )}
          />
        </div>
        {error ? (
          <p className="mt-1.5 text-xs text-red-500 font-medium">{error}</p>
        ) : helperText ? (
          <p className="mt-1.5 text-xs text-studio-muted dark:text-champagne-400">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

CurrencyInput.displayName = 'CurrencyInput';
