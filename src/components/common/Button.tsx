// ========================================================================
// SISTEMA DE GESTÃO — CAMILA RODRIGUES BEAUTY STUDIO
// Component: Button.tsx
// ========================================================================

import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost' | 'gold-outline';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  className,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  disabled,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium transition-all duration-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.98]';

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-xs font-semibold gap-1.5',
    md: 'px-4 py-2 text-sm font-semibold gap-2',
    lg: 'px-6 py-3 text-base font-semibold gap-2.5',
  };

  const variantStyles = {
    primary: 'bg-gradient-to-r from-gold-600 via-gold-500 to-gold-400 text-white hover:from-gold-700 hover:to-gold-500 shadow-lux hover:shadow-lg focus:ring-gold-500 border border-gold-400/30',
    secondary: 'bg-champagne-200 text-studio-text hover:bg-champagne-300 dark:bg-studio-darkCard dark:text-champagne-100 dark:hover:bg-studio-darkBorder focus:ring-gold-500 border border-champagne-300 dark:border-studio-darkBorder',
    outline: 'bg-transparent border border-champagne-400/70 text-studio-text hover:bg-champagne-200/50 dark:border-studio-darkBorder dark:text-champagne-100 dark:hover:bg-studio-darkCard focus:ring-gold-500',
    'gold-outline': 'bg-transparent border border-gold-500 text-gold-700 dark:text-gold-400 hover:bg-gold-50 dark:hover:bg-gold-950/30 focus:ring-gold-500',
    danger: 'bg-red-600 text-white hover:bg-red-700 shadow-sm focus:ring-red-500',
    ghost: 'bg-transparent text-studio-text hover:bg-champagne-200/40 dark:text-champagne-100 dark:hover:bg-studio-darkCard focus:ring-gold-500',
  };

  return (
    <button
      className={twMerge(clsx(baseStyles, sizeStyles[size], variantStyles[variant], className))}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin text-current" />
      ) : (
        leftIcon && <span className="shrink-0">{leftIcon}</span>
      )}
      <span>{children}</span>
      {!isLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
    </button>
  );
};
