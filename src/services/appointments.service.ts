// ========================================================================
// SISTEMA DE GESTÃO — CAMILA RODRIGUES BEAUTY STUDIO
// Service: Appointments Service (Agenda & Atendimentos)
// ========================================================================

import { Appointment, AppointmentStatus, AppointmentType, PaymentStatus } from '../types';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { storage } from '../lib/storageAdapter';
import { auditService } from './audit.service';
import { checkAppointmentConflict } from '../utils/conflictDetector';
import { calculateRemainingAmount } from '../utils/financialMath';

export interface AppointmentDTO {
  client_id: string;
  service_id: string;
  appointment_type: AppointmentType;
  start_time: string; // ISO
  end_time: string;   // ISO
  duration_minutes: number;
  total_amount: number;
  deposit_amount?: number;
  payment_status?: PaymentStatus;
  payment_method_id?: string;
  status?: AppointmentStatus;
  notes?: string;
}

export const appointmentsService = {
  async getAll(): Promise<Appointment[]> {
    let appointments: Appointment[] = [];
    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .order('start_time', { ascending: true });
      if (error) throw new Error(error.message);
      appointments = data || [];
    } else {
      appointments = storage.getAppointments();
    }

    const clients = storage.getClients();
    const services = storage.getServices();
    const paymentMethods = storage.getPaymentMethods();

    return appointments.map(app => ({
      ...app,
      client: clients.find(c => c.id === app.client_id),
      service: services.find(s => s.id === app.service_id),
      payment_method: paymentMethods.find(p => p.id === app.payment_method_id),
    }));
  },

  async create(dto: AppointmentDTO): Promise<Appointment> {
    const existing = await this.getAll();
    
    // 1. Checar Conflito de Horário
    const conflictCheck = checkAppointmentConflict(dto.start_time, dto.end_time, existing);
    if (conflictCheck.hasConflict) {
      throw new Error(conflictCheck.message || 'Conflito de horário detectado com outro agendamento.');
    }

    const profile = storage.getProfile();
    const deposit = dto.deposit_amount || 0;
    const remaining = calculateRemainingAmount(dto.total_amount, deposit);

    let paymentStatus: PaymentStatus = 'pending';
    if (deposit > 0 && remaining > 0) {
      paymentStatus = 'deposit_paid';
    } else if (deposit >= dto.total_amount && dto.total_amount > 0) {
      paymentStatus = 'fully_paid';
    }

    const newApp: Appointment = {
      id: 'app_' + Date.now(),
      user_id: profile?.id || 'usr_camila_01',
      client_id: dto.client_id,
      service_id: dto.service_id,
      appointment_type: dto.appointment_type,
      start_time: dto.start_time,
      end_time: dto.end_time,
      duration_minutes: dto.duration_minutes,
      total_amount: dto.total_amount,
      deposit_amount: deposit,
      remaining_amount: remaining,
      payment_status: dto.payment_status || paymentStatus,
      payment_method_id: dto.payment_method_id,
      status: dto.status || 'scheduled',
      notes: dto.notes?.trim(),
      google_event_id: 'gcal_evt_' + Date.now(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase
        .from('appointments')
        .insert([newApp])
        .select()
        .single();
      if (error) throw new Error(error.message);
      newApp.id = data.id;
    } else {
      const apps = storage.getAppointments();
      storage.setAppointments([...apps, newApp]);
    }

    // Se houve sinal pago na criação, registrar entrada financeira
    if (deposit > 0) {
      const entries = storage.getFinancialEntries();
      const clients = storage.getClients();
      const services = storage.getServices();
      const client = clients.find(c => c.id === dto.client_id);
      const service = services.find(s => s.id === dto.service_id);

      entries.push({
        id: 'ent_dep_' + Date.now(),
        user_id: profile?.id || 'usr_camila_01',
        client_id: dto.client_id,
        service_id: dto.service_id,
        appointment_id: newApp.id,
        description: `Sinal de agendamento — ${client?.full_name || 'Cliente'} (${service?.name || 'Procedimento'})`,
        category: 'deposit',
        amount: deposit,
        payment_method_id: dto.payment_method_id,
        date: dto.start_time.split('T')[0],
        status: 'received',
        notes: 'Sinal cadastrado no agendamento',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
      storage.setFinancialEntries(entries);
    }

    const clients = storage.getClients();
    const client = clients.find(c => c.id === dto.client_id);
    await auditService.log({
      entity_type: 'appointment',
      entity_id: newApp.id,
      action: 'create',
      description: `Agendamento criado para ${client?.full_name || 'cliente'} às ${new Date(dto.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.`,
    });

    return newApp;
  },

  async update(id: string, dto: Partial<AppointmentDTO>): Promise<Appointment> {
    const apps = storage.getAppointments();
    const existing = apps.find(a => a.id === id);
    if (!existing) throw new Error('Agendamento não encontrado.');

    // Validar conflito se horários foram alterados
    if (dto.start_time || dto.end_time) {
      const targetStart = dto.start_time || existing.start_time;
      const targetEnd = dto.end_time || existing.end_time;
      const conflictCheck = checkAppointmentConflict(targetStart, targetEnd, apps, id);
      if (conflictCheck.hasConflict) {
        throw new Error(conflictCheck.message || 'Conflito de horário detectado com outro agendamento.');
      }
    }

    const updatedTotal = dto.total_amount !== undefined ? dto.total_amount : existing.total_amount;
    const updatedDeposit = dto.deposit_amount !== undefined ? dto.deposit_amount : existing.deposit_amount;
    const updatedRemaining = calculateRemainingAmount(updatedTotal, updatedDeposit);

    const updated: Appointment = {
      ...existing,
      ...dto,
      total_amount: updatedTotal,
      deposit_amount: updatedDeposit,
      remaining_amount: updatedRemaining,
      updated_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured() && supabase) {
      const { error } = await supabase.from('appointments').update(updated).eq('id', id);
      if (error) throw new Error(error.message);
    } else {
      storage.setAppointments(apps.map(a => a.id === id ? updated : a));
    }

    await auditService.log({
      entity_type: 'appointment',
      entity_id: id,
      action: 'update',
      description: `Agendamento atualizado.`,
      changes: dto as Record<string, unknown>,
    });

    return updated;
  },

  async updateStatus(id: string, status: AppointmentStatus, cancellationReason?: string): Promise<Appointment> {
    const apps = storage.getAppointments();
    const existing = apps.find(a => a.id === id);
    if (!existing) throw new Error('Agendamento não encontrado.');

    const updated: Appointment = {
      ...existing,
      status,
      cancellation_reason: cancellationReason || existing.cancellation_reason,
      updated_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured() && supabase) {
      const { error } = await supabase.from('appointments').update(updated).eq('id', id);
      if (error) throw new Error(error.message);
    } else {
      storage.setAppointments(apps.map(a => a.id === id ? updated : a));
    }

    // Regra: Quando status se torna "completed", gerar automaticamente entrada financeira
    const settings = storage.getSettings();
    if (status === 'completed' && settings.auto_generate_financial_entry) {
      const entries = storage.getFinancialEntries();
      const clients = storage.getClients();
      const services = storage.getServices();
      const client = clients.find(c => c.id === existing.client_id);
      const service = services.find(s => s.id === existing.service_id);

      // Checa se já existe entrada para este agendamento com o valor restante ou total
      const amountToReceive = existing.remaining_amount > 0 ? existing.remaining_amount : existing.total_amount;
      
      const alreadyHasCompletionEntry = entries.some(e => e.appointment_id === id && e.category === 'service');

      if (!alreadyHasCompletionEntry && amountToReceive > 0) {
        entries.push({
          id: 'ent_auto_' + Date.now(),
          user_id: existing.user_id,
          client_id: existing.client_id,
          service_id: existing.service_id,
          appointment_id: existing.id,
          description: `Atendimento Concluído: ${service?.name || 'Procedimento'} — ${client?.full_name || 'Cliente'}`,
          category: 'service',
          amount: amountToReceive,
          payment_method_id: existing.payment_method_id,
          date: new Date().toISOString().split('T')[0],
          status: 'received',
          notes: 'Gerado automaticamente na conclusão do atendimento',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
        storage.setFinancialEntries(entries);

        // Atualiza status do agendamento para fully_paid
        updated.payment_status = 'fully_paid';
        updated.remaining_amount = 0;
        storage.setAppointments(apps.map(a => a.id === id ? updated : a));
      }
    }

    await auditService.log({
      entity_type: 'appointment',
      entity_id: id,
      action: status === 'cancelled' ? 'cancel' : 'update',
      description: `Status do agendamento alterado para "${status}"${cancellationReason ? ` (Motivo: ${cancellationReason})` : ''}.`,
    });

    return updated;
  },

  async delete(id: string): Promise<void> {
    const apps = storage.getAppointments();
    const existing = apps.find(a => a.id === id);
    if (!existing) throw new Error('Agendamento não encontrado.');

    if (isSupabaseConfigured() && supabase) {
      const { error } = await supabase.from('appointments').delete().eq('id', id);
      if (error) throw new Error(error.message);
    } else {
      storage.setAppointments(apps.filter(a => a.id !== id));
    }

    await auditService.log({
      entity_type: 'appointment',
      entity_id: id,
      action: 'delete',
      description: `Agendamento removido da agenda.`,
    });
  },
};
