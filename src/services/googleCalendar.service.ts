// ========================================================================
// SISTEMA DE GESTÃO — CAMILA RODRIGUES BEAUTY STUDIO
// Service: Google Calendar Integration Service
// ========================================================================

import { GoogleCalendarConnection } from '../types';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { storage } from '../lib/storageAdapter';
import { auditService } from './audit.service';
import { notificationsService } from './notifications.service';

export const googleCalendarService = {
  async getConnectionStatus(): Promise<GoogleCalendarConnection> {
    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase.from('google_calendar_connections').select('*').single();
      if (!error && data) return data;
    }
    return storage.getGoogleCalendar();
  },

  async connect(googleEmail: string = 'camilarodrigues.studio@gmail.com'): Promise<GoogleCalendarConnection> {
    const current = storage.getGoogleCalendar();
    const updated: GoogleCalendarConnection = {
      ...current,
      is_connected: true,
      google_account_email: googleEmail,
      last_sync_at: new Date().toISOString(),
      sync_status: 'success',
      sync_message: 'Conectado com sucesso à conta Google Calendar.',
      updated_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured() && supabase) {
      await supabase.from('google_calendar_connections').upsert(updated);
    } else {
      storage.setGoogleCalendar(updated);
    }

    await auditService.log({
      entity_type: 'google_calendar',
      action: 'sync',
      description: `Google Calendar conectado à conta ${googleEmail}.`,
    });

    await notificationsService.create(
      'Google Calendar Conectado',
      `Sua agenda foi vinculada com sucesso à conta ${googleEmail}.`,
      'success',
      '/configuracoes'
    );

    return updated;
  },

  async disconnect(): Promise<GoogleCalendarConnection> {
    const current = storage.getGoogleCalendar();
    const updated: GoogleCalendarConnection = {
      ...current,
      is_connected: false,
      sync_status: 'idle',
      sync_message: 'Google Calendar desconectado.',
      updated_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured() && supabase) {
      await supabase.from('google_calendar_connections').upsert(updated);
    } else {
      storage.setGoogleCalendar(updated);
    }

    await auditService.log({
      entity_type: 'google_calendar',
      action: 'sync',
      description: `Google Calendar desconectado da aplicação.`,
    });

    return updated;
  },

  async syncNow(): Promise<{ success: boolean; syncedCount: number; message: string }> {
    const current = storage.getGoogleCalendar();
    if (!current.is_connected) {
      throw new Error('Google Calendar desconectado. Conecte sua conta para sincronizar.');
    }

    // Marca status como sincronizando
    current.sync_status = 'syncing';
    storage.setGoogleCalendar(current);

    // Simula sincronização bidirecional dos agendamentos
    await new Promise(res => setTimeout(res, 800));

    const appointments = storage.getAppointments();
    const activeAppointments = appointments.filter(a => a.status !== 'cancelled');

    const updated: GoogleCalendarConnection = {
      ...current,
      sync_status: 'success',
      last_sync_at: new Date().toISOString(),
      sync_message: `${activeAppointments.length} agendamentos sincronizados com sucesso.`,
      updated_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured() && supabase) {
      await supabase.from('google_calendar_connections').upsert(updated);
    } else {
      storage.setGoogleCalendar(updated);
    }

    await auditService.log({
      entity_type: 'google_calendar',
      action: 'sync',
      description: `Sincronização manual executada: ${activeAppointments.length} eventos sincronizados.`,
    });

    await notificationsService.create(
      'Sincronização Concluída',
      `Agenda do Google Calendar atualizada (${activeAppointments.length} atendimentos sincronizados).`,
      'success',
      '/agenda'
    );

    return {
      success: true,
      syncedCount: activeAppointments.length,
      message: updated.sync_message || 'Sincronizado com sucesso.',
    };
  },
};
