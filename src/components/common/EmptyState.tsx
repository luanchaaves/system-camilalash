// ========================================================================
// SISTEMA DE GESTÃO — CAMILA RODRIGUES BEAUTY STUDIO
// Component: EmptyState.tsx
// ========================================================================

import React from 'react';
import { Button } from './Button';
import { Sparkles } from 'lucide-react';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
  actionIcon?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionText,
  onAction,
  actionIcon,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-2xl border border-dashed border-champagne-300 dark:border-studio-darkBorder bg-champagne-50/30 dark:bg-studio-darkCard/50">
      <div className="w-12 h-12 rounded-2xl bg-champagne-200/80 dark:bg-studio-darkBorder flex items-center justify-center text-gold-600 dark:text-gold-400 mb-4 shadow-sm">
        {icon || <Sparkles className="w-6 h-6" />}
      </div>
      <h4 className="text-base font-serif font-bold text-studio-text dark:text-champagne-100 mb-1">
        {title}
      </h4>
      <p className="text-xs sm:text-sm text-studio-muted dark:text-champagne-400 max-w-sm mb-6">
        {description}
      </p>
      {actionText && onAction && (
        <Button size="sm" onClick={onAction} leftIcon={actionIcon}>
          {actionText}
        </Button>
      )}
    </div>
  );
};
