// ========================================================================
// SISTEMA DE GESTÃO — CAMILA RODRIGUES BEAUTY STUDIO
// Service: Settings Service (Configurações do Studio e Horários)
// ========================================================================

import { StudioSettings } from '../types';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { storage } from '../lib/storageAdapter';
import { auditService } from './audit.service';

export const settingsService = {
  async getSettings(): Promise<StudioSettings> {
    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase.from('studio_settings').select('*').single();
      if (!error && data) return data;
    }
    return storage.getSettings();
  },

  async updateSettings(dto: Partial<StudioSettings>): Promise<StudioSettings> {
    const current = storage.getSettings();
    const updated: StudioSettings = {
      ...current,
      ...dto,
      updated_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured() && supabase) {
      const { error } = await supabase.from('studio_settings').update(updated).eq('id', current.id);
      if (error) throw new Error(error.message);
    } else {
      storage.setSettings(updated);
    }

    await auditService.log({
      entity_type: 'settings',
      entity_id: updated.id,
      action: 'update',
      description: `Configurações operacionais do Studio foram atualizadas.`,
      changes: dto as Record<string, unknown>,
    });

    return updated;
  },

  async get(): Promise<StudioSettings> {
    return this.getSettings();
  },

  async update(dto: Partial<StudioSettings>): Promise<StudioSettings> {
    return this.updateSettings(dto);
  },
};
