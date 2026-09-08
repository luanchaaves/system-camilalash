// ========================================================================
// SISTEMA DE GESTÃO — CAMILA RODRIGUES BEAUTY STUDIO
// Component: Modal.tsx
// ========================================================================

import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  footer,
  maxWidth = 'md',
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidthStyles = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity animate-fadeIn"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="flex min-h-screen items-center justify-center p-4 text-center sm:p-0">
        <div
          className={twMerge(
            clsx(
              'relative transform overflow-hidden rounded-2xl bg-white dark:bg-studio-darkCard text-left shadow-2xl transition-all w-full my-8 border border-champagne-300 dark:border-studio-darkBorder',
              maxWidthStyles[maxWidth]
            )
          )}
        >
          {/* Header */}
          <div className="flex items-start justify-between p-5 border-b border-champagne-200 dark:border-studio-darkBorder bg-champagne-50/50 dark:bg-studio-darkCard">
            <div>
              <h3 className="text-lg font-serif font-bold text-studio-text dark:text-champagne-100" id="modal-title">
                {title}
              </h3>
              {subtitle && (
                <p className="mt-0.5 text-xs text-studio-muted dark:text-champagne-400">
                  {subtitle}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1.5 text-studio-muted hover:text-studio-text hover:bg-champagne-200 dark:hover:bg-studio-darkBorder dark:text-champagne-400 transition-colors"
              aria-label="Fechar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-5 max-h-[75vh] overflow-y-auto">
            {children}
          </div>

          {/* Footer */}
          {footer && (
            <div className="flex items-center justify-end gap-3 px-5 py-4 border-t border-champagne-200 dark:border-studio-darkBorder bg-champagne-50/40 dark:bg-studio-darkCard">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
