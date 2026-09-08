// ========================================================================
// SISTEMA DE GESTÃO — CAMILA RODRIGUES BEAUTY STUDIO
// Component: Layout.tsx
// ========================================================================

import React, { useState, useEffect } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { MobileNav } from './MobileNav';
import { QuickSearchModal } from './QuickSearchModal';
import { useAuth } from '../../contexts/AuthContext';
import { Toaster } from 'sonner';

export const Layout: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-champagne-50 dark:bg-studio-darkBg">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center p-2 shadow-lux animate-pulse">
            <img src="/monograma_cr.svg" alt="CR" className="filter brightness-0 invert" />
          </div>
          <p className="mt-4 text-xs font-serif uppercase tracking-widest text-gold-700 dark:text-gold-400">
            Carregando Camila Rodrigues Studio...
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-champagne-50 dark:bg-studio-darkBg text-studio-text dark:text-champagne-100 flex flex-col antialiased font-sans transition-colors duration-200">
      <Toaster
        position="top-right"
        richColors
        toastOptions={{
          style: {
            borderRadius: '16px',
            fontFamily: 'Montserrat, sans-serif',
          },
        }}
      />

      <div className="flex flex-1 min-h-screen">
        {/* Desktop Sidebar */}
        <Sidebar />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 pb-16 lg:pb-0">
          <Header onOpenSearch={() => setIsSearchOpen(true)} />

          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto animate-fadeIn">
            <Outlet />
          </main>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileNav />

      {/* Cmd+K Global Search Modal */}
      <QuickSearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </div>
  );
};
