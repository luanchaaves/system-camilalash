// ========================================================================
// SISTEMA DE GESTÃO — CAMILA RODRIGUES BEAUTY STUDIO
// Component: MobileNav.tsx (Barra de navegação inferior para smartphones)
// ========================================================================

import React from 'react';
import { NavLink } from 'react-router-dom';
import { clsx } from 'clsx';
import {
  LayoutDashboard,
  Calendar,
  Users,
  DollarSign,
  Settings,
} from 'lucide-react';

export const MobileNav: React.FC = () => {
  const items = [
    { name: 'Início', path: '/', icon: LayoutDashboard },
    { name: 'Agenda', path: '/agenda', icon: Calendar },
    { name: 'Clientes', path: '/clientes', icon: Users },
    { name: 'Finanças', path: '/financeiro', icon: DollarSign },
    { name: 'Ajustes', path: '/configuracoes', icon: Settings },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-studio-darkCard/95 backdrop-blur-lg border-t border-champagne-300 dark:border-studio-darkBorder px-2 py-1.5 flex items-center justify-around">
      {items.map(item => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            className={({ isActive }) =>
              clsx(
                'flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all duration-150 min-w-[56px]',
                isActive
                  ? 'text-gold-600 dark:text-gold-400 font-bold'
                  : 'text-studio-muted hover:text-studio-text dark:text-champagne-400'
              )
            }
          >
            {({ isActive }) => (
              <>
                <Icon className={clsx('w-5 h-5 mb-0.5', isActive && 'scale-110')} />
                <span className="text-[10px] tracking-tight">{item.name}</span>
              </>
            )}
          </NavLink>
        );
      })}
    </nav>
  );
};
