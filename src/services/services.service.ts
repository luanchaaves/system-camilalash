// ========================================================================
// SISTEMA DE GESTÃO — CAMILA RODRIGUES BEAUTY STUDIO
// Service: Services Service (Procedimentos & Categorias)
// ========================================================================

import { Service, ServiceCategory } from '../types';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { storage } from '../lib/storageAdapter';
import { auditService } from './audit.service';

export interface ServiceDTO {
  name: string;
  category_id?: string;
  description?: string;
  price: number;
  duration_minutes: number;
  maintenance_price: number;
  maintenance_duration_minutes: number;
  is_active?: boolean;
}

export const servicesService = {
  async getAll(): Promise<Service[]> {
    let services: Service[] = [];
    let categories: ServiceCategory[] = [];

    if (isSupabaseConfigured() && supabase) {
      const [srvRes, catRes] = await Promise.all([
        supabase.from('services').select('*').order('name', { ascending: true }),
        supabase.from('service_categories').select('*'),
      ]);
      if (srvRes.error) throw new Error(srvRes.error.message);
      services = srvRes.data || [];
      categories = catRes.data || [];
    } else {
      services = storage.getServices();
      categories = storage.getServiceCategories();
    }

    return services.map(s => ({
      ...s,
      category: categories.find(c => c.id === s.category_id),
    }));
  },

  async getCategories(): Promise<ServiceCategory[]> {
    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase.from('service_categories').select('*').order('name');
      if (error) throw new Error(error.message);
      return data || [];
    }
    return storage.getServiceCategories();
  },

  async create(dto: ServiceDTO): Promise<Service> {
    const profile = storage.getProfile();
    const newService: Service = {
      id: 'srv_' + Date.now(),
      user_id: profile?.id || 'usr_camila_01',
      name: dto.name.trim(),
      category_id: dto.category_id,
      description: dto.description?.trim(),
      price: dto.price,
      duration_minutes: dto.duration_minutes,
      maintenance_price: dto.maintenance_price,
      maintenance_duration_minutes: dto.maintenance_duration_minutes,
      is_active: dto.is_active !== undefined ? dto.is_active : true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase
        .from('services')
        .insert([newService])
        .select()
        .single();
      if (error) throw new Error(error.message);
      newService.id = data.id;
    } else {
      const services = storage.getServices();
      storage.setServices([newService, ...services]);
    }

    await auditService.log({
      entity_type: 'service',
      entity_id: newService.id,
      action: 'create',
      description: `Novo serviço cadastrado: "${newService.name}" (R$ ${newService.price.toFixed(2)}).`,
    });

    return newService;
  },

  async update(id: string, dto: Partial<ServiceDTO>): Promise<Service> {
    const currentServices = storage.getServices();
    const existing = currentServices.find(s => s.id === id);
    if (!existing) throw new Error('Serviço não encontrado.');

    const updated: Service = {
      ...existing,
      ...dto,
      updated_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured() && supabase) {
      const { error } = await supabase
        .from('services')
        .update(updated)
        .eq('id', id);
      if (error) throw new Error(error.message);
    } else {
      const updatedList = currentServices.map(s => s.id === id ? updated : s);
      storage.setServices(updatedList);
    }

    await auditService.log({
      entity_type: 'service',
      entity_id: id,
      action: 'update',
      description: `Serviço "${updated.name}" foi atualizado.`,
      changes: dto as Record<string, unknown>,
    });

    return updated;
  },

  async delete(id: string): Promise<void> {
    const currentServices = storage.getServices();
    const existing = currentServices.find(s => s.id === id);
    if (!existing) throw new Error('Serviço não encontrado.');

    if (isSupabaseConfigured() && supabase) {
      const { error } = await supabase
        .from('services')
        .delete()
        .eq('id', id);
      if (error) throw new Error(error.message);
    } else {
      const updatedList = currentServices.filter(s => s.id !== id);
      storage.setServices(updatedList);
    }

    await auditService.log({
      entity_type: 'service',
      entity_id: id,
      action: 'delete',
      description: `Serviço "${existing.name}" foi removido do catálogo.`,
    });
  },
};
