// ========================================================================
// SISTEMA DE GESTÃO — CAMILA RODRIGUES BEAUTY STUDIO
// Service: Notifications Service
// ========================================================================

import { AppNotification, NotificationType } from '../types';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { storage } from '../lib/storageAdapter';

export const notificationsService = {
  async getAll(): Promise<AppNotification[]> {
    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw new Error(error.message);
      return data || [];
    }

    const notifs = storage.getNotifications();
    return notifs.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  },

  async create(title: string, message: string, type: NotificationType = 'info', link?: string): Promise<AppNotification> {
    const profile = storage.getProfile();
    const newNotif: AppNotification = {
      id: 'notif_' + Date.now(),
      user_id: profile?.id || 'usr_camila_01',
      title,
      message,
      type,
      is_read: false,
      link,
      created_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase
        .from('notifications')
        .insert([newNotif])
        .select()
        .single();
      if (!error && data) return data;
    }

    const current = storage.getNotifications();
    storage.setNotifications([newNotif, ...current]);
    return newNotif;
  },

  async markAsRead(id: string): Promise<void> {
    if (isSupabaseConfigured() && supabase) {
      await supabase.from('notifications').update({ is_read: true }).eq('id', id);
      return;
    }

    const notifs = storage.getNotifications().map(n => n.id === id ? { ...n, is_read: true } : n);
    storage.setNotifications(notifs);
  },

  async markAllAsRead(): Promise<void> {
    if (isSupabaseConfigured() && supabase) {
      await supabase.from('notifications').update({ is_read: true }).eq('is_read', false);
      return;
    }

    const notifs = storage.getNotifications().map(n => ({ ...n, is_read: true }));
    storage.setNotifications(notifs);
  },
};
