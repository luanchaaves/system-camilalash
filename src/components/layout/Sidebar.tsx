// ========================================================================
// SISTEMA DE GESTÃO — CAMILA RODRIGUES BEAUTY STUDIO
// Component: Sidebar.tsx
// ========================================================================

import React from 'react';
import { NavLink } from 'react-router-dom';
import { clsx } from 'clsx';
import {
  LayoutDashboard,
  Calendar,
  Users,
  Sparkles,
  DollarSign,
  BarChart3,
  Settings,
  ShieldCheck,
  ExternalLink,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Agenda & Atendimentos', path: '/agenda', icon: Calendar },
    { name: 'Clientes & Visagismo', path: '/clientes', icon: Users },
    { name: 'Serviços & Procedimentos', path: '/servicos', icon: Sparkles },
    { name: 'Financeiro & Fluxo', path: '/financeiro', icon: DollarSign },
    { name: 'Relatórios & Exportação', path: '/relatorios', icon: BarChart3 },
    { name: 'Configurações do Studio', path: '/configuracoes', icon: Settings },
  ];

  return (
    <aside className="hidden lg:flex flex-col w-64 border-r border-champagne-300 dark:border-studio-darkBorder bg-champagne-50/70 dark:bg-studio-darkCard transition-colors shrink-0 select-none h-screen sticky top-0">
      
      {/* Brand Header */}
      <div className="flex items-center gap-3 px-6 h-16 border-b border-champagne-300 dark:border-studio-darkBorder bg-white/50 dark:bg-studio-darkCard/50">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-gold-400 via-gold-500 to-gold-700 flex items-center justify-center shadow-lux shrink-0 p-1.5">
          <img src="/monograma_cr.svg" alt="CR Logo" className="w-full h-full object-contain filter brightness-0 invert" />
        </div>
        <div className="overflow-hidden">
          <div className="font-serif font-bold text-sm tracking-tight text-studio-text dark:text-champagne-100 uppercase truncate">
            Camila Rodrigues
          </div>
          <div className="text-[10px] tracking-widest text-gold-600 dark:text-gold-400 font-semibold uppercase">
            Beauty Studio Gestão
          </div>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-studio-muted/70 dark:text-champagne-400/60">
          Menu Principal
        </div>
        {navItems.map(item => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) =>
                clsx(
                  'flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 group',
                  isActive
                    ? 'bg-gradient-to-r from-gold-500 to-gold-600 text-white shadow-lux'
                    : 'text-studio-text/80 dark:text-champagne-200 hover:bg-champagne-200/60 dark:hover:bg-studio-darkBorder/60 hover:text-studio-text dark:hover:text-champagne-100'
                )
              }
            >
              {({ isActive }) => (
                <>
                  <Icon
                    className={clsx(
                      'w-4 h-4 transition-transform group-hover:scale-110',
                      isActive ? 'text-white' : 'text-gold-600 dark:text-gold-400'
                    )}
                  />
                  <span>{item.name}</span>
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer info box */}
      <div className="p-4 m-3 rounded-2xl bg-gradient-to-b from-champagne-200/50 to-champagne-100/50 dark:from-studio-darkBorder/40 dark:to-studio-darkBg/60 border border-champagne-300/80 dark:border-studio-darkBorder text-center">
        <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-gold-700 dark:text-gold-300">
          <ShieldCheck className="w-4 h-4" />
          <span>Sistema Seguro</span>
        </div>
        <p className="text-[10px] text-studio-muted dark:text-champagne-400 mt-1">
          Dados criptografados e sincronizados com PostgreSQL Supabase.
        </p>
        <a
          href="https://camilarodriguesbeauty.netlify.app/"
          target="_blank"
          rel="noreferrer"
          className="mt-3 inline-flex items-center justify-center gap-1.5 w-full py-1.5 px-2.5 rounded-lg text-[10px] font-bold bg-white dark:bg-studio-darkCard text-studio-text dark:text-champagne-200 hover:text-gold-600 border border-champagne-300 dark:border-studio-darkBorder shadow-xs transition-colors"
        >
          <span>Acessar Site do Studio</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>

    </aside>
  );
};
