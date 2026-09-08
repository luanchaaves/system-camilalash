// ========================================================================
// SISTEMA DE GESTÃO — CAMILA RODRIGUES BEAUTY STUDIO
// Page: Agenda.tsx (Gestão Completa de Horários e Atendimentos)
// ========================================================================

import React, { useState, useEffect, useMemo } from 'react';
import {
  format,
  addDays,
  subDays,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameDay,
  parseISO,
  setHours,
  setMinutes,
  addMinutes,
  startOfMonth,
  endOfMonth,
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Plus,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Send,
  MoreVertical,
} from 'lucide-react';
import { storage } from '../lib/storageAdapter';
import { Appointment, Client, Service, PaymentMethod, AppointmentStatus, AppointmentType } from '../types';
import { formatBRL, formatDate, formatTime, getWhatsAppLink } from '../utils/formatters';
import { appointmentsService, AppointmentDTO } from '../services/appointments.service';
import { clientsService } from '../services/clients.service';
import { checkAppointmentConflict } from '../utils/conflictDetector';
import { calculateRemainingAmount } from '../utils/financialMath';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Select } from '../components/common/Select';
import { CurrencyInput } from '../components/common/CurrencyInput';
import { Modal } from '../components/common/Modal';
import { AppointmentStatusBadge } from '../components/common/Badge';
import { toast } from 'sonner';

type ViewMode = 'day' | 'week' | 'month';

export const Agenda: React.FC = () => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('week');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [selectedClientId, setSelectedClientId] = useState('');
  const [isCreatingClientInline, setIsCreatingClientInline] = useState(false);
  const [newClientName, setNewClientName] = useState('');
  const [newClientPhone, setNewClientPhone] = useState('');

  const [selectedServiceId, setSelectedServiceId] = useState('');
  const [appointmentType, setAppointmentType] = useState<AppointmentType>('application');
  const [appointmentDate, setAppointmentDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [appointmentTime, setAppointmentTime] = useState('09:00');
  const [durationMinutes, setDurationMinutes] = useState(120);
  const [totalAmount, setTotalAmount] = useState(120);
  const [depositAmount, setDepositAmount] = useState(0);
  const [paymentMethodId, setPaymentMethodId] = useState('');
  const [notes, setNotes] = useState('');
  const [conflictWarning, setConflictWarning] = useState<string | null>(null);

  // Cancellation Modal
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [cancellingAppId, setCancellingAppId] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState('');

  const loadData = () => {
    setAppointments(storage.getAppointments());
    setClients(storage.getClients());
    setServices(storage.getServices());
    setPaymentMethods(storage.getPaymentMethods());
  };

  useEffect(() => {
    loadData();
    window.addEventListener('camilalash_storage_update', loadData);
    return () => window.removeEventListener('camilalash_storage_update', loadData);
  }, []);

  // Popula relacionamentos
  const populatedAppointments = useMemo(() => {
    return appointments.map(a => ({
      ...a,
      client: clients.find(c => c.id === a.client_id),
      service: services.find(s => s.id === a.service_id),
      payment_method: paymentMethods.find(p => p.id === a.payment_method_id),
    }));
  }, [appointments, clients, services, paymentMethods]);

  // Checagem de Conflito em tempo real no formulário
  useEffect(() => {
    if (!appointmentDate || !appointmentTime || !durationMinutes) return;

    try {
      const [h, m] = appointmentTime.split(':').map(Number);
      const start = setMinutes(setHours(parseISO(appointmentDate), h), m);
      const end = addMinutes(start, durationMinutes);

      const check = checkAppointmentConflict(
        start.toISOString(),
        end.toISOString(),
        appointments,
        editingAppointment?.id
      );

      if (check.hasConflict) {
        setConflictWarning(check.message || 'Conflito detectado');
      } else {
        setConflictWarning(null);
      }
    } catch {
      setConflictWarning(null);
    }
  }, [appointmentDate, appointmentTime, durationMinutes, appointments, editingAppointment]);

  // Quando seleciona procedimento ou altera tipo (Aplicação vs Manutenção)
  const handleServiceChange = (serviceId: string, type: AppointmentType = appointmentType) => {
    setSelectedServiceId(serviceId);
    const srv = services.find(s => s.id === serviceId);
    if (srv) {
      if (type === 'maintenance') {
        setTotalAmount(srv.maintenance_price);
        setDurationMinutes(srv.maintenance_duration_minutes);
      } else {
        setTotalAmount(srv.price);
        setDurationMinutes(srv.duration_minutes);
      }
    }
  };

  const handleTypeChange = (type: AppointmentType) => {
    setAppointmentType(type);
    if (selectedServiceId) {
      handleServiceChange(selectedServiceId, type);
    }
  };

  const handleOpenCreateModal = (presetDate?: Date, presetTime?: string) => {
    setEditingAppointment(null);
    setSelectedClientId(clients[0]?.id || '');
    setIsCreatingClientInline(false);
    setNewClientName('');
    setNewClientPhone('');
    
    const defaultSrv = services[0];
    if (defaultSrv) {
      setSelectedServiceId(defaultSrv.id);
      setAppointmentType('application');
      setTotalAmount(defaultSrv.price);
      setDurationMinutes(defaultSrv.duration_minutes);
    }

    setAppointmentDate(format(presetDate || currentDate, 'yyyy-MM-dd'));
    setAppointmentTime(presetTime || '09:00');
    setDepositAmount(0);
    setPaymentMethodId(paymentMethods[0]?.id || '');
    setNotes('');
    setConflictWarning(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (app: Appointment) => {
    setEditingAppointment(app);
    setSelectedClientId(app.client_id);
    setIsCreatingClientInline(false);
    setSelectedServiceId(app.service_id);
    setAppointmentType(app.appointment_type);
    setAppointmentDate(app.start_time.split('T')[0]);
    setAppointmentTime(formatTime(app.start_time));
    setDurationMinutes(app.duration_minutes);
    setTotalAmount(app.total_amount);
    setDepositAmount(app.deposit_amount);
    setPaymentMethodId(app.payment_method_id || '');
    setNotes(app.notes || '');
    setConflictWarning(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      let finalClientId = selectedClientId;

      // Criação rápida de cliente inline
      if (isCreatingClientInline) {
        if (!newClientName.trim() || !newClientPhone.trim()) {
          toast.error('Informe o nome e WhatsApp da nova cliente.');
          setIsSubmitting(false);
          return;
        }
        const created = await clientsService.create({
          full_name: newClientName,
          whatsapp: newClientPhone,
        });
        finalClientId = created.id;
        toast.success(`Cliente ${created.full_name} cadastrada com sucesso!`);
      }

      if (!finalClientId) {
        toast.error('Selecione uma cliente.');
        setIsSubmitting(false);
        return;
      }

      const [h, m] = appointmentTime.split(':').map(Number);
      const start = setMinutes(setHours(parseISO(appointmentDate), h), m);
      const end = addMinutes(start, durationMinutes);

      const dto: AppointmentDTO = {
        client_id: finalClientId,
        service_id: selectedServiceId,
        appointment_type: appointmentType,
        start_time: start.toISOString(),
        end_time: end.toISOString(),
        duration_minutes: durationMinutes,
        total_amount: totalAmount,
        deposit_amount: depositAmount,
        payment_method_id: paymentMethodId || undefined,
        notes,
      };

      if (editingAppointment) {
        await appointmentsService.update(editingAppointment.id, dto);
        toast.success('Agendamento atualizado com sucesso!');
      } else {
        await appointmentsService.create(dto);
        toast.success('Horário agendado com sucesso!');
      }

      setIsModalOpen(false);
      loadData();
    } catch (err: unknown) {
      toast.error((err as Error).message || 'Erro ao salvar agendamento.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusChange = async (appId: string, status: AppointmentStatus) => {
    if (status === 'cancelled') {
      setCancellingAppId(appId);
      setCancelReason('');
      setIsCancelModalOpen(true);
      return;
    }

    try {
      await appointmentsService.updateStatus(appId, status);
      toast.success(`Status alterado para "${status}".`);
      loadData();
    } catch (err: unknown) {
      toast.error((err as Error).message);
    }
  };

  const handleConfirmCancel = async () => {
    if (!cancellingAppId) return;
    try {
      await appointmentsService.updateStatus(cancellingAppId, 'cancelled', cancelReason);
      toast.success('Agendamento cancelado.');
      setIsCancelModalOpen(false);
      loadData();
    } catch (err: unknown) {
      toast.error((err as Error).message);
    }
  };

  // Range de dias para a visualização
  const weekDays = useMemo(() => {
    const start = startOfWeek(currentDate, { weekStartsOn: 1 });
    const end = endOfWeek(currentDate, { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end });
  }, [currentDate]);

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Header Controls */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-5 rounded-3xl bg-white dark:bg-studio-darkCard border border-champagne-300 dark:border-studio-darkBorder shadow-sm">
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-champagne-100 dark:bg-studio-darkBorder p-1 rounded-xl">
            <button
              onClick={() => setCurrentDate(subDays(currentDate, viewMode === 'week' ? 7 : 1))}
              className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-studio-darkCard text-studio-text dark:text-champagne-100 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentDate(new Date())}
              className="px-3 py-1 text-xs font-bold text-gold-700 dark:text-gold-300 hover:bg-white dark:hover:bg-studio-darkCard rounded-lg transition-colors"
            >
              Hoje
            </button>
            <button
              onClick={() => setCurrentDate(addDays(currentDate, viewMode === 'week' ? 7 : 1))}
              className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-studio-darkCard text-studio-text dark:text-champagne-100 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <h2 className="font-serif text-lg sm:text-xl font-bold text-studio-text dark:text-champagne-100 capitalize">
            {format(currentDate, "MMMM 'de' yyyy", { locale: ptBR })}
          </h2>
        </div>

        <div className="flex items-center gap-2">
          {/* View Mode Selector */}
          <div className="flex bg-champagne-100 dark:bg-studio-darkBorder p-1 rounded-xl text-xs font-semibold">
            {(['day', 'week', 'month'] as ViewMode[]).map(mode => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-3 py-1.5 rounded-lg transition-all capitalize ${
                  viewMode === mode
                    ? 'bg-gold-500 text-white shadow-xs font-bold'
                    : 'text-studio-muted hover:text-studio-text dark:text-champagne-300'
                }`}
              >
                {mode === 'day' ? 'Dia' : mode === 'week' ? 'Semana' : 'Mês'}
              </button>
            ))}
          </div>

          <Button
            variant="primary"
            size="sm"
            onClick={() => handleOpenCreateModal()}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Novo Horário
          </Button>
        </div>

      </div>

      {/* WEEK VIEW */}
      {viewMode === 'week' && (
        <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
          {weekDays.map(day => {
            const isToday = isSameDay(day, new Date());
            const dayApps = populatedAppointments.filter(a => isSameDay(parseISO(a.start_time), day));

            return (
              <div
                key={day.toISOString()}
                className={`flex flex-col rounded-2xl border p-3 min-h-[350px] transition-all ${
                  isToday
                    ? 'border-gold-400 bg-gold-50/20 dark:bg-gold-950/20 dark:border-gold-600 shadow-sm'
                    : 'border-champagne-200 dark:border-studio-darkBorder bg-white/60 dark:bg-studio-darkCard/60'
                }`}
              >
                {/* Day Header */}
                <div className="flex items-center justify-between pb-2 border-b border-champagne-200 dark:border-studio-darkBorder mb-2">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-studio-muted dark:text-champagne-400 block">
                      {format(day, 'EEE', { locale: ptBR })}
                    </span>
                    <span className={`text-sm font-bold ${isToday ? 'text-gold-600 dark:text-gold-400 font-serif' : 'text-studio-text dark:text-champagne-100'}`}>
                      {format(day, 'dd/MM')}
                    </span>
                  </div>
                  <button
                    onClick={() => handleOpenCreateModal(day)}
                    className="p-1 rounded-lg text-studio-muted hover:bg-champagne-200 dark:hover:bg-studio-darkBorder hover:text-gold-600 transition-colors"
                    title="Adicionar horário neste dia"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Day Appointments List */}
                <div className="space-y-2 flex-1">
                  {dayApps.map(app => (
                    <div
                      key={app.id}
                      className={`p-2.5 rounded-xl border text-xs transition-all shadow-xs group ${
                        app.status === 'completed'
                          ? 'border-emerald-200 bg-emerald-50/50 dark:border-emerald-800/40 dark:bg-emerald-950/30'
                          : app.status === 'cancelled'
                          ? 'border-rose-200 bg-rose-50/40 dark:border-rose-800/40 dark:bg-rose-950/30 opacity-70'
                          : 'border-champagne-300 dark:border-studio-darkBorder bg-white dark:bg-studio-darkCard hover:border-gold-400'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-gold-700 dark:text-gold-400">
                          {formatTime(app.start_time)} - {formatTime(app.end_time)}
                        </span>
                        <div className="flex items-center gap-1">
                          {app.client?.whatsapp && (
                            <a
                              href={getWhatsAppLink(app.client.whatsapp, `Olá ${app.client.full_name}, lembrete do seu atendimento no Camila Rodrigues Beauty Studio às ${formatTime(app.start_time)}.`)}
                              target="_blank"
                              rel="noreferrer"
                              className="text-emerald-600 hover:text-emerald-700 p-0.5"
                              title="WhatsApp"
                            >
                              <Send className="w-3 h-3" />
                            </a>
                          )}
                          <button
                            onClick={() => handleOpenEditModal(app)}
                            className="text-studio-muted hover:text-gold-600 p-0.5"
                            title="Editar"
                          >
                            <MoreVertical className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      <div className="font-bold text-studio-text dark:text-champagne-100 truncate mt-1">
                        {app.client?.full_name || 'Cliente'}
                      </div>
                      
                      <div className="text-[11px] text-studio-muted dark:text-champagne-400 truncate">
                        {app.service?.name} ({app.appointment_type === 'maintenance' ? 'Manut.' : 'Aplic.'})
                      </div>

                      <div className="flex items-center justify-between mt-2 pt-1 border-t border-champagne-100 dark:border-studio-darkBorder text-[10px]">
                        <span className="font-semibold text-studio-text dark:text-champagne-200">
                          {formatBRL(app.total_amount)}
                        </span>
                        <AppointmentStatusBadge status={app.status} />
                      </div>

                      {/* Quick Status Action */}
                      {app.status !== 'completed' && app.status !== 'cancelled' && (
                        <div className="mt-2 flex gap-1 pt-1">
                          <button
                            onClick={() => handleStatusChange(app.id, 'completed')}
                            className="w-full py-1 rounded bg-emerald-600 text-white text-[10px] font-bold hover:bg-emerald-700 transition-colors"
                          >
                            Concluir
                          </button>
                          <button
                            onClick={() => handleStatusChange(app.id, 'cancelled')}
                            className="px-2 py-1 rounded bg-rose-100 dark:bg-rose-950 text-rose-600 text-[10px] font-bold hover:bg-rose-200 transition-colors"
                          >
                            X
                          </button>
                        </div>
                      )}
                    </div>
                  ))}

                  {dayApps.length === 0 && (
                    <div className="h-full flex items-center justify-center text-center p-4 text-[11px] text-studio-muted/70">
                      Livre
                    </div>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* DAY VIEW */}
      {viewMode === 'day' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-studio-darkCard border border-champagne-300 dark:border-studio-darkBorder shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-4 border-b border-champagne-200 dark:border-studio-darkBorder">
            <h3 className="font-serif text-lg font-bold text-studio-text dark:text-champagne-100">
              Atendimentos do Dia — {formatDate(currentDate, "EEEE, dd 'de' MMMM 'de' yyyy")}
            </h3>
            <Button size="sm" onClick={() => handleOpenCreateModal(currentDate)} leftIcon={<Plus className="w-4 h-4" />}>
              Adicionar Horário
            </Button>
          </div>

          {populatedAppointments
            .filter(a => isSameDay(parseISO(a.start_time), currentDate))
            .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())
            .map(app => (
              <div
                key={app.id}
                className="p-4 rounded-2xl border border-champagne-200 dark:border-studio-darkBorder bg-champagne-50/40 dark:bg-studio-darkCard flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-start sm:items-center gap-4">
                  <div className="px-3.5 py-2 rounded-xl bg-gold-500 text-white font-serif font-bold text-sm">
                    {formatTime(app.start_time)}
                  </div>
                  <div>
                    <div className="text-base font-bold text-studio-text dark:text-champagne-100">
                      {app.client?.full_name}
                    </div>
                    <div className="text-xs text-studio-muted dark:text-champagne-400">
                      {app.service?.name} ({app.appointment_type === 'maintenance' ? 'Manutenção' : 'Aplicação'}) • {app.duration_minutes} min • {formatBRL(app.total_amount)}
                      {app.deposit_amount > 0 && ` (Sinal: ${formatBRL(app.deposit_amount)})`}
                    </div>
                    {app.notes && (
                      <div className="text-xs text-studio-text/70 italic mt-1">Obs: {app.notes}</div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <AppointmentStatusBadge status={app.status} />
                  {app.client?.whatsapp && (
                    <a
                      href={getWhatsAppLink(app.client.whatsapp)}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2 rounded-xl border border-champagne-300 dark:border-studio-darkBorder hover:bg-emerald-50 text-emerald-600 transition-colors"
                      title="Enviar WhatsApp"
                    >
                      <Send className="w-4 h-4" />
                    </a>
                  )}
                  <Button variant="outline" size="sm" onClick={() => handleOpenEditModal(app)}>
                    Editar
                  </Button>
                  {app.status !== 'completed' && app.status !== 'cancelled' && (
                    <Button variant="primary" size="sm" onClick={() => handleStatusChange(app.id, 'completed')}>
                      Concluir
                    </Button>
                  )}
                </div>
              </div>
            ))}
        </div>
      )}

      {/* MONTH VIEW */}
      {viewMode === 'month' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-studio-darkCard border border-champagne-300 dark:border-studio-darkBorder shadow-sm">
          <div className="grid grid-cols-7 gap-2">
            {['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'].map(d => (
              <div key={d} className="text-center font-bold text-xs text-studio-muted uppercase py-2">
                {d}
              </div>
            ))}
            {eachDayOfInterval({
              start: startOfWeek(startOfMonth(currentDate), { weekStartsOn: 1 }),
              end: endOfWeek(endOfMonth(currentDate), { weekStartsOn: 1 }),
            }).map(day => {
              const dayApps = populatedAppointments.filter(a => isSameDay(parseISO(a.start_time), day));
              const isToday = isSameDay(day, new Date());
              return (
                <div
                  key={day.toISOString()}
                  onClick={() => {
                    setCurrentDate(day);
                    setViewMode('day');
                  }}
                  className={`min-h-[70px] p-2 rounded-xl border text-xs cursor-pointer hover:border-gold-400 transition-colors ${
                    isToday
                      ? 'border-gold-500 bg-gold-50/30 dark:bg-gold-950/30'
                      : 'border-champagne-200 dark:border-studio-darkBorder bg-champagne-50/20'
                  }`}
                >
                  <div className="font-bold text-studio-text dark:text-champagne-100">{format(day, 'd')}</div>
                  {dayApps.length > 0 && (
                    <div className="mt-1">
                      <span className="px-1.5 py-0.5 rounded-full bg-gold-500 text-white font-bold text-[10px]">
                        {dayApps.length} {dayApps.length === 1 ? 'atend.' : 'atends.'}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* MODAL NOVO / EDITAR AGENDAMENTO */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingAppointment ? 'Editar Agendamento' : 'Novo Agendamento na Agenda'}
        subtitle="Preencha os dados do procedimento e confira o horário disponível"
        maxWidth="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Conflito Warning Banner */}
          {conflictWarning && (
            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 flex items-start gap-2.5 text-xs text-amber-800 dark:text-amber-300 animate-fadeIn">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Atenção ao Conflito: </span>
                {conflictWarning}
              </div>
            </div>
          )}

          {/* Seleção ou Criação de Cliente */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-studio-muted dark:text-champagne-300">
                Cliente *
              </label>
              <button
                type="button"
                onClick={() => setIsCreatingClientInline(!isCreatingClientInline)}
                className="text-xs font-semibold text-gold-600 hover:text-gold-700 dark:text-gold-400 hover:underline"
              >
                {isCreatingClientInline ? '← Selecionar cliente cadastrada' : '+ Nova cliente rápida'}
              </button>
            </div>

            {isCreatingClientInline ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-xl bg-champagne-100/50 dark:bg-studio-darkBorder/40 border border-champagne-300 dark:border-studio-darkBorder">
                <Input
                  label="Nome Completo"
                  required
                  placeholder="Nome da cliente"
                  value={newClientName}
                  onChange={e => setNewClientName(e.target.value)}
                />
                <Input
                  label="WhatsApp"
                  required
                  placeholder="11999998888"
                  value={newClientPhone}
                  onChange={e => setNewClientPhone(e.target.value)}
                />
              </div>
            ) : (
              <Select
                options={clients.map(c => ({ value: c.id, label: `${c.full_name} (${c.whatsapp})` }))}
                value={selectedClientId}
                onChange={e => setSelectedClientId(e.target.value)}
              />
            )}
          </div>

          {/* Procedimento & Tipo */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Select
              label="Procedimento *"
              options={services.map(s => ({ value: s.id, label: `${s.name} (R$ ${s.price.toFixed(2)})` }))}
              value={selectedServiceId}
              onChange={e => handleServiceChange(e.target.value)}
            />

            <Select
              label="Tipo de Atendimento *"
              options={[
                { value: 'application', label: 'Nova Aplicação' },
                { value: 'maintenance', label: 'Manutenção' },
              ]}
              value={appointmentType}
              onChange={e => handleTypeChange(e.target.value as AppointmentType)}
            />
          </div>

          {/* Data, Horário e Duração */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Input
              label="Data *"
              type="date"
              required
              value={appointmentDate}
              onChange={e => setAppointmentDate(e.target.value)}
            />
            <Input
              label="Horário Inicial *"
              type="time"
              required
              value={appointmentTime}
              onChange={e => setAppointmentTime(e.target.value)}
            />
            <Input
              label="Duração (minutos) *"
              type="number"
              min="15"
              step="15"
              required
              value={durationMinutes}
              onChange={e => setDurationMinutes(parseInt(e.target.value, 10) || 60)}
            />
          </div>

          {/* Valores: Total e Sinal */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <CurrencyInput
              label="Valor Total (R$) *"
              value={totalAmount}
              onChange={setTotalAmount}
            />
            <CurrencyInput
              label="Sinal Pago (R$)"
              value={depositAmount}
              onChange={setDepositAmount}
              helperText={depositAmount > 0 ? `Restante: ${formatBRL(calculateRemainingAmount(totalAmount, depositAmount))}` : undefined}
            />
            <Select
              label="Forma de Pagamento"
              options={paymentMethods.map(p => ({ value: p.id, label: p.name }))}
              value={paymentMethodId}
              onChange={e => setPaymentMethodId(e.target.value)}
            />
          </div>

          {/* Observações */}
          <Input
            label="Observações / Anotações"
            placeholder="Ex: Cliente prefere mapping Fox Eyes, olhos sensíveis..."
            value={notes}
            onChange={e => setNotes(e.target.value)}
          />

          <div className="flex justify-end gap-3 pt-3 border-t border-champagne-200 dark:border-studio-darkBorder">
            <Button variant="outline" type="button" onClick={() => setIsModalOpen(false)}>
              Cancelar
            </Button>
            <Button variant="primary" type="submit" isLoading={isSubmitting}>
              {editingAppointment ? 'Salvar Alterações' : 'Confirmar Agendamento'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL DE CANCELAMENTO COM MOTIVO */}
      <Modal
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        title="Cancelar Atendimento"
        subtitle="Informe o motivo do cancelamento para registro no histórico da cliente"
        maxWidth="sm"
      >
        <div className="space-y-4">
          <Input
            label="Motivo do Cancelamento"
            placeholder="Ex: Imprevisto pessoal da cliente, reagendado..."
            value={cancelReason}
            onChange={e => setCancelReason(e.target.value)}
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => setIsCancelModalOpen(false)}>
              Voltar
            </Button>
            <Button variant="danger" size="sm" onClick={handleConfirmCancel}>
              Confirmar Cancelamento
            </Button>
          </div>
        </div>
      </Modal>

    </div>
  );
};
