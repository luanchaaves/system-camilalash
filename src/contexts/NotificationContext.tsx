// ========================================================================
// SISTEMA DE GESTÃO — CAMILA RODRIGUES BEAUTY STUDIO
// Context: NotificationContext.tsx
// ========================================================================

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { AppNotification, SystemAlert } from '../types';
import { notificationsService } from '../services/notifications.service';
import { storage } from '../lib/storageAdapter';

interface NotificationContextType {
  notifications: AppNotification[];
  unreadCount: number;
  systemAlerts: SystemAlert[];
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  refreshNotifications: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [systemAlerts, setSystemAlerts] = useState<SystemAlert[]>([]);

  const generateSystemAlerts = useCallback(() => {
    const apps = storage.getAppointments();
    const expenses = storage.getFinancialExpenses();
    const entries = storage.getFinancialEntries();
    const alerts: SystemAlert[] = [];

    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    // 1. Alerta de Atendimento Próximo (dentro de 2 horas)
    for (const app of apps) {
      if (app.status === 'scheduled' || app.status === 'confirmed') {
        const appDate = new Date(app.start_time);
        const diffMinutes = (appDate.getTime() - now.getTime()) / (1000 * 60);
        if (diffMinutes > 0 && diffMinutes <= 120) {
          const client = storage.getClients().find(c => c.id === app.client_id);
          const service = storage.getServices().find(s => s.id === app.service_id);
          alerts.push({
            id: 'alert_app_' + app.id,
            title: 'Atendimento Próximo',
            description: `${client?.full_name || 'Cliente'} em ${Math.round(diffMinutes)} minutos (${service?.name || 'Procedimento'}).`,
            type: 'urgent',
            timestamp: app.start_time,
            link: '/agenda',
          });
        }
      }
    }

    // 2. Contas vencendo hoje ou vencidas
    for (const exp of expenses) {
      if (exp.status === 'pending') {
        if (exp.due_date && exp.due_date < todayStr) {
          alerts.push({
            id: 'alert_exp_overdue_' + exp.id,
            title: 'Conta Vencida',
            description: `Despesa "${exp.description}" (R$ ${exp.amount.toFixed(2)}) está vencida.`,
            type: 'urgent',
            timestamp: exp.due_date,
            link: '/financeiro',
          });
        } else if (exp.due_date === todayStr || exp.date === todayStr) {
          alerts.push({
            id: 'alert_exp_today_' + exp.id,
            title: 'Conta Vence Hoje',
            description: `Despesa "${exp.description}" (R$ ${exp.amount.toFixed(2)}) vence hoje.`,
            type: 'warning',
            timestamp: exp.due_date || exp.date,
            link: '/financeiro',
          });
        }
      }
    }

    // 3. Contas a Receber pendentes
    const pendingReceivables = entries.filter(e => e.status === 'pending');
    if (pendingReceivables.length > 0) {
      const totalPending = pendingReceivables.reduce((sum, e) => sum + e.amount, 0);
      alerts.push({
        id: 'alert_receivables',
        title: 'Contas a Receber Pendentes',
        description: `Existem R$ ${totalPending.toFixed(2)} em valores pendentes para recebimento.`,
        type: 'info',
        timestamp: new Date().toISOString(),
        link: '/financeiro',
      });
    }

    setSystemAlerts(alerts);
  }, []);

  const refreshNotifications = useCallback(async () => {
    try {
      const list = await notificationsService.getAll();
      setNotifications(list);
      generateSystemAlerts();
    } catch (e) {
      console.error('Erro ao carregar notificações:', e);
    }
  }, [generateSystemAlerts]);

  useEffect(() => {
    refreshNotifications();

    const handleStorageChange = () => {
      refreshNotifications();
    };

    window.addEventListener('camilalash_storage_update', handleStorageChange);
    return () => window.removeEventListener('camilalash_storage_update', handleStorageChange);
  }, [refreshNotifications]);

  const markAsRead = async (id: string) => {
    await notificationsService.markAsRead(id);
    await refreshNotifications();
  };

  const markAllAsRead = async () => {
    await notificationsService.markAllAsRead();
    await refreshNotifications();
  };

  const unreadCount = notifications.filter(n => !n.is_read).length + systemAlerts.length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        systemAlerts,
        markAsRead,
        markAllAsRead,
        refreshNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications deve ser utilizado dentro de um NotificationProvider');
  }
  return context;
};
