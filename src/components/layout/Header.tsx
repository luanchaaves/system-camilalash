// ========================================================================
// SISTEMA DE GESTÃO — CAMILA RODRIGUES BEAUTY STUDIO
// Component: Header.tsx
// ========================================================================

import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';
import { useTheme } from '../../contexts/ThemeContext';
import {
  Bell,
  Search,
  Sun,
  Moon,
  LogOut,
  RefreshCw,
  AlertTriangle,
  ChevronDown,
  ExternalLink,
} from 'lucide-react';
import { googleCalendarService } from '../../services/googleCalendar.service';
import { GoogleCalendarConnection } from '../../types';
import { toast } from 'sonner';

export interface HeaderProps {
  onOpenSearch: () => void;
  onToggleSidebar?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenSearch }) => {
  const { user, logout } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead, systemAlerts } = useNotifications();
  const { theme, toggleTheme } = useTheme();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [calStatus, setCalStatus] = useState<GoogleCalendarConnection | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    googleCalendarService.getConnectionStatus().then(setCalStatus).catch(console.error);

    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (userRef.current && !userRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSyncGoogle = async () => {
    setIsSyncing(true);
    try {
      const res = await googleCalendarService.syncNow();
      toast.success(res.message);
      const updated = await googleCalendarService.getConnectionStatus();
      setCalStatus(updated);
    } catch (err: unknown) {
      toast.error((err as Error).message || 'Erro ao sincronizar');
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-champagne-300 dark:border-studio-darkBorder bg-white/90 dark:bg-studio-darkCard/90 backdrop-blur-md px-4 sm:px-6 transition-colors">
      {/* Search trigger */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenSearch}
          className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-xl border border-champagne-300 dark:border-studio-darkBorder bg-champagne-50 dark:bg-studio-darkBg text-xs font-medium text-studio-muted hover:border-gold-400 dark:hover:border-gold-500 transition-all shadow-sm"
        >
          <Search className="w-4 h-4 text-gold-500 shrink-0" />
          <span className="hidden sm:inline">Buscar clientes, procedimentos...</span>
          <span className="sm:hidden">Buscar...</span>
          <kbd className="hidden md:inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono bg-champagne-200 dark:bg-studio-darkBorder text-studio-muted rounded">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-2.5">
        
        {/* Google Calendar Quick Status */}
        {calStatus?.is_connected && (
          <button
            onClick={handleSyncGoogle}
            disabled={isSyncing}
            title="Google Calendar Conectado — Clique para sincronizar agora"
            className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 hover:bg-emerald-100 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>Google Sincronizado</span>
          </button>
        )}

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl text-studio-muted hover:text-studio-text hover:bg-champagne-200/60 dark:hover:bg-studio-darkBorder transition-colors"
          aria-label="Alternar Tema"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-gold-400" /> : <Moon className="w-4 h-4 text-studio-text" />}
        </button>

        {/* Notifications Dropdown */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-xl text-studio-muted hover:text-studio-text hover:bg-champagne-200/60 dark:hover:bg-studio-darkBorder transition-colors"
            aria-label="Notificações"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-gold-600 px-1 text-[10px] font-bold text-white ring-2 ring-white dark:ring-studio-darkCard animate-pulse">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white dark:bg-studio-darkCard shadow-2xl border border-champagne-300 dark:border-studio-darkBorder overflow-hidden z-50 animate-fadeIn">
              <div className="flex items-center justify-between px-4 py-3 border-b border-champagne-200 dark:border-studio-darkBorder bg-champagne-50/50 dark:bg-studio-darkBg">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-gold-600" />
                  <span className="text-xs font-bold font-serif uppercase tracking-wider text-studio-text dark:text-champagne-100">
                    Notificações & Alertas
                  </span>
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={() => markAllAsRead()}
                    className="text-[11px] font-semibold text-gold-600 hover:text-gold-700 hover:underline"
                  >
                    Marcar lidas
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto p-2 space-y-1.5 divide-y divide-champagne-100 dark:divide-studio-darkBorder">
                {/* Alertas do Sistema */}
                {systemAlerts.map(alert => (
                  <div
                    key={alert.id}
                    className="p-2.5 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 text-xs"
                  >
                    <div className="flex items-center gap-1.5 font-bold text-amber-800 dark:text-amber-300">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                      {alert.title}
                    </div>
                    <div className="mt-1 text-studio-text/80 dark:text-champagne-300 text-[11px]">
                      {alert.description}
                    </div>
                  </div>
                ))}

                {/* Notificações Normais */}
                {notifications.length > 0 ? (
                  notifications.map(n => (
                    <div
                      key={n.id}
                      onClick={() => markAsRead(n.id)}
                      className={`p-2.5 rounded-xl text-xs cursor-pointer transition-colors ${
                        !n.is_read
                          ? 'bg-champagne-100/60 dark:bg-studio-darkBorder/40 font-medium'
                          : 'hover:bg-champagne-50 dark:hover:bg-studio-darkBorder/20'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-studio-text dark:text-champagne-100">
                          {n.title}
                        </span>
                        {!n.is_read && <span className="w-2 h-2 rounded-full bg-gold-500" />}
                      </div>
                      <p className="mt-0.5 text-[11px] text-studio-muted dark:text-champagne-400">
                        {n.message}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="p-6 text-center text-xs text-studio-muted">
                    Nenhuma notificação no momento.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Menu */}
        <div className="relative" ref={userRef}>
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 p-1 pl-2 rounded-xl border border-champagne-300 dark:border-studio-darkBorder bg-champagne-50/50 dark:bg-studio-darkBg hover:bg-champagne-100 transition-colors"
          >
            <img
              src={user?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=150&auto=format&fit=crop'}
              alt={user?.full_name || 'Camila Rodrigues'}
              className="w-7 h-7 rounded-full object-cover border border-gold-400/50"
            />
            <div className="hidden lg:block text-left pr-1">
              <div className="text-xs font-bold text-studio-text dark:text-champagne-100 leading-tight">
                {user?.full_name || 'Camila Rodrigues'}
              </div>
              <div className="text-[10px] text-gold-600 font-semibold uppercase tracking-wider">
                Beauty Master
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-studio-muted" />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-52 rounded-2xl bg-white dark:bg-studio-darkCard shadow-2xl border border-champagne-300 dark:border-studio-darkBorder overflow-hidden z-50 animate-fadeIn p-1.5">
              <div className="px-3 py-2 border-b border-champagne-200 dark:border-studio-darkBorder">
                <div className="text-xs font-bold text-studio-text dark:text-champagne-100">
                  {user?.full_name}
                </div>
                <div className="text-[10px] text-studio-muted truncate">{user?.email}</div>
              </div>
              <a
                href="https://camilarodriguesbeauty.netlify.app/"
                target="_blank"
                rel="noreferrer"
                className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-studio-text dark:text-champagne-200 hover:bg-champagne-100 dark:hover:bg-studio-darkBorder transition-colors mt-1"
              >
                <ExternalLink className="w-3.5 h-3.5 text-gold-600" />
                <span>Ver Site Público</span>
              </a>
              <button
                onClick={() => logout()}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors mt-1"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Encerrar Sessão</span>
              </button>
            </div>
          )}
        </div>

      </div>
    </header>
  );
};
