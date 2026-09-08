// ========================================================================
// SISTEMA DE GESTÃO — CAMILA RODRIGUES BEAUTY STUDIO
// Service: Audit Service (Histórico e Auditoria)
// ========================================================================

import { AuditLog, AuditAction } from '../types';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { storage } from '../lib/storageAdapter';

export interface CreateAuditLogDTO {
  entity_type: string;
  entity_id?: string;
  action: AuditAction;
  description: string;
  changes?: Record<string, unknown>;
}

export const auditService = {
  async getAll(): Promise<AuditLog[]> {
    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw new Error(error.message);
      return data || [];
    }

    const logs = storage.getAuditLogs();
    return logs.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  },

  async getRecentLogs(limit: number = 30): Promise<AuditLog[]> {
    const all = await this.getAll();
    return all.slice(0, limit);
  },

  async log(dto: CreateAuditLogDTO): Promise<AuditLog> {
    const profile = storage.getProfile();
    const newLog: AuditLog = {
      id: 'log_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      user_id: profile?.id || 'usr_camila_01',
      user_email: profile?.email || 'camila@camilarodriguesbeauty.com.br',
      entity_type: dto.entity_type,
      entity_id: dto.entity_id,
      action: dto.action,
      description: dto.description,
      changes: dto.changes,
      created_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase
        .from('audit_logs')
        .insert([newLog])
        .select()
        .single();
      if (!error && data) return data;
    }

    const current = storage.getAuditLogs();
    storage.setAuditLogs([newLog, ...current]);
    return newLog;
  },
};
