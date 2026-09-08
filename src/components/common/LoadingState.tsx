// ========================================================================
// SISTEMA DE GESTÃO — CAMILA RODRIGUES BEAUTY STUDIO
// Component: LoadingState.tsx
// ========================================================================

import React from 'react';
import { Loader2 } from 'lucide-react';

export const LoadingState: React.FC<{ message?: string }> = ({ message = 'Carregando informações...' }) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center min-h-[220px]">
      <div className="relative">
        <div className="w-12 h-12 rounded-full border-2 border-champagne-300 dark:border-studio-darkBorder border-t-gold-500 animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center">
          <Loader2 className="w-5 h-5 text-gold-500 animate-pulse" />
        </div>
      </div>
      <p className="mt-4 text-xs sm:text-sm font-medium text-studio-muted dark:text-champagne-400 animate-pulse">
        {message}
      </p>
    </div>
  );
};
