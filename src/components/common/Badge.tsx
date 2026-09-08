// ========================================================================
// SISTEMA DE GESTÃO — CAMILA RODRIGUES BEAUTY STUDIO
// Component: Badge.tsx
// ========================================================================

import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { AppointmentStatus, FinancialStatus, ExpenseStatus } from '../../types';

export interface BadgeProps {
  children: React.ReactNode;
  variant?:
    | 'gold'
    | 'success'
    | 'warning'
    | 'danger'
    | 'info'
    | 'neutral'
    | 'purple'
    | 'cyan';
  size?: 'sm' | 'md';
  dot?: boolean;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  size = 'md',
  dot = true,
  className,
}) => {
  const variantStyles = {
    gold: 'bg-gold-50 text-gold-700 border-gold-300/60 dark:bg-gold-950/40 dark:text-gold-300 dark:border-gold-800/60',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-300/60 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/60',
    warning: 'bg-amber-50 text-amber-700 border-amber-300/60 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/60',
    danger: 'bg-rose-50 text-rose-700 border-rose-300/60 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800/60',
    info: 'bg-blue-50 text-blue-700 border-blue-300/60 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800/60',
    neutral: 'bg-champagne-200 text-studio-text border-champagne-300 dark:bg-studio-darkBorder dark:text-champagne-200 dark:border-studio-darkBorder',
    purple: 'bg-purple-50 text-purple-700 border-purple-300/60 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800/60',
    cyan: 'bg-cyan-50 text-cyan-700 border-cyan-300/60 dark:bg-cyan-950/40 dark:text-cyan-300 dark:border-cyan-800/60',
  };

  const dotColorStyles = {
    gold: 'bg-gold-500',
    success: 'bg-emerald-500',
    warning: 'bg-amber-500',
    danger: 'bg-rose-500',
    info: 'bg-blue-500',
    neutral: 'bg-studio-muted',
    purple: 'bg-purple-500',
    cyan: 'bg-cyan-500',
  };

  const sizeStyles = {
    sm: 'px-2 py-0.5 text-[10px] font-semibold tracking-wide',
    md: 'px-2.5 py-1 text-xs font-semibold',
  };

  return (
    <span
      className={twMerge(
        clsx(
          'inline-flex items-center gap-1.5 rounded-full border font-medium select-none',
          variantStyles[variant],
          sizeStyles[size],
          className
        )
      )}
    >
      {dot && <span className={clsx('w-1.5 h-1.5 rounded-full shrink-0', dotColorStyles[variant])} />}
      <span>{children}</span>
    </span>
  );
};

export const AppointmentStatusBadge: React.FC<{ status: AppointmentStatus }> = ({ status }) => {
  switch (status) {
    case 'scheduled':
      return <Badge variant="info">Agendado</Badge>;
    case 'confirmed':
      return <Badge variant="gold">Confirmado</Badge>;
    case 'in_progress':
      return <Badge variant="purple">Em Atendimento</Badge>;
    case 'completed':
      return <Badge variant="success">Concluído</Badge>;
    case 'cancelled':
      return <Badge variant="danger">Cancelado</Badge>;
    case 'no_show':
      return <Badge variant="warning">Faltou</Badge>;
    case 'rescheduled':
      return <Badge variant="cyan">Reagendado</Badge>;
    default:
      return <Badge variant="neutral">{status}</Badge>;
  }
};

export const FinancialStatusBadge: React.FC<{ status: FinancialStatus | ExpenseStatus }> = ({ status }) => {
  switch (status) {
    case 'received':
    case 'paid':
      return <Badge variant="success">{status === 'received' ? 'Recebido' : 'Pago'}</Badge>;
    case 'pending':
      return <Badge variant="warning">Pendente</Badge>;
    case 'cancelled':
      return <Badge variant="danger">Cancelado</Badge>;
    default:
      return <Badge variant="neutral">{status}</Badge>;
  }
};
