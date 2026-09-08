// ========================================================================
// SISTEMA DE GESTÃO — CAMILA RODRIGUES BEAUTY STUDIO
// Service: Clients Service
// ========================================================================

import { Client, Appointment, FinancialEntry } from '../types';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { storage } from '../lib/storageAdapter';
import { auditService } from './audit.service';

export interface ClientDTO {
  full_name: string;
  phone?: string;
  whatsapp: string;
  email?: string;
  birth_date?: string;
  origin?: string;
  notes?: string;
  status?: 'active' | 'inactive';
}

export const clientsService = {
  async getAll(): Promise<Client[]> {
    let clients: Client[] = [];

    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('full_name', { ascending: true });
      if (error) throw new Error(error.message);
      clients = data || [];
    } else {
      clients = storage.getClients();
    }

    // Enriquecer dados com métricas relacionais (Total Gasto, Qtd Atendimentos)
    const appointments: Appointment[] = storage.getAppointments();
    const entries: FinancialEntry[] = storage.getFinancialEntries();

    return clients.map(client => {
      const clientAppointments = appointments.filter(a => a.client_id === client.id);
      const clientEntries = entries.filter(e => e.client_id === client.id && e.status === 'received');

      const totalSpent = clientEntries.reduce((acc, curr) => acc + curr.amount, 0);
      const sortedApps = [...clientAppointments].sort((a, b) => new Date(b.start_time).getTime() - new Date(a.start_time).getTime());

      const lastApp = sortedApps.find(a => a.status === 'completed' || new Date(a.start_time) < new Date());
      const nextApp = sortedApps.reverse().find(a => (a.status === 'scheduled' || a.status === 'confirmed') && new Date(a.start_time) >= new Date());

      return {
        ...client,
        total_spent: totalSpent,
        total_appointments: clientAppointments.filter(a => a.status === 'completed').length,
        last_appointment: lastApp?.start_time,
        next_appointment: nextApp?.start_time,
      };
    });
  },

  async getById(id: string): Promise<Client | null> {
    const clients = await this.getAll();
    return clients.find(c => c.id === id) || null;
  },

  async create(dto: ClientDTO): Promise<Client> {
    const profile = storage.getProfile();
    const newClient: Client = {
      id: 'cli_' + Date.now(),
      user_id: profile?.id || 'usr_camila_01',
      full_name: dto.full_name.trim(),
      phone: dto.phone?.trim(),
      whatsapp: dto.whatsapp.trim(),
      email: dto.email?.trim(),
      birth_date: dto.birth_date,
      origin: dto.origin || 'Instagram',
      notes: dto.notes?.trim(),
      status: dto.status || 'active',
      first_visit_date: new Date().toISOString().split('T')[0],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      total_spent: 0,
      total_appointments: 0,
    };

    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase
        .from('clients')
        .insert([newClient])
        .select()
        .single();
      if (error) throw new Error(error.message);
      newClient.id = data.id;
    } else {
      const clients = storage.getClients();
      storage.setClients([newClient, ...clients]);
    }

    await auditService.log({
      entity_type: 'client',
      entity_id: newClient.id,
      action: 'create',
      description: `Cliente "${newClient.full_name}" cadastrada com sucesso.`,
    });

    return newClient;
  },

  async update(id: string, dto: Partial<ClientDTO>): Promise<Client> {
    const currentClients = storage.getClients();
    const existing = currentClients.find(c => c.id === id);
    if (!existing) throw new Error('Cliente não encontrada.');

    const updated: Client = {
      ...existing,
      ...dto,
      updated_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured() && supabase) {
      const { error } = await supabase
        .from('clients')
        .update(updated)
        .eq('id', id);
      if (error) throw new Error(error.message);
    } else {
      const updatedList = currentClients.map(c => c.id === id ? updated : c);
      storage.setClients(updatedList);
    }

    await auditService.log({
      entity_type: 'client',
      entity_id: id,
      action: 'update',
      description: `Dados da cliente "${updated.full_name}" foram atualizados.`,
      changes: dto as Record<string, unknown>,
    });

    return updated;
  },

  async delete(id: string): Promise<void> {
    const currentClients = storage.getClients();
    const existing = currentClients.find(c => c.id === id);
    if (!existing) throw new Error('Cliente não encontrada.');

    if (isSupabaseConfigured() && supabase) {
      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', id);
      if (error) throw new Error(error.message);
    } else {
      const updatedList = currentClients.filter(c => c.id !== id);
      storage.setClients(updatedList);
    }

    await auditService.log({
      entity_type: 'client',
      entity_id: id,
      action: 'delete',
      description: `Cliente "${existing.full_name}" foi removida do sistema.`,
    });
  },
};
