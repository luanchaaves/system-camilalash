// ========================================================================
// SISTEMA DE GESTÃO — CAMILA RODRIGUES BEAUTY STUDIO
// Page: Configuracoes.tsx (Configurações do Studio, Horários, Google Calendar & Auditoria)
// ========================================================================

import React, { useState, useEffect } from 'react';
import {
  Settings,
  Building,
  Clock,
  Calendar,
  ShieldCheck,
  CreditCard,
  Layers,
  Save,
  RefreshCw,
  Plus,
} from 'lucide-react';
import { StudioSettings, GoogleCalendarConnection, AuditLog, PaymentMethod, ExpenseCategory, DaySchedule } from '../types';
import { settingsService } from '../services/settings.service';
import { googleCalendarService } from '../services/googleCalendar.service';
import { auditService } from '../services/audit.service';
import { financeService } from '../services/finance.service';
import { formatDate } from '../utils/formatters';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { toast } from 'sonner';

type ConfigTab = 'studio' | 'schedule' | 'google' | 'finance_config' | 'audit';

const DAYS_KEY_MAP: { key: keyof StudioSettings['business_hours']; label: string }[] = [
  { key: 'monday', label: 'Segunda-feira' },
  { key: 'tuesday', label: 'Terça-feira' },
  { key: 'wednesday', label: 'Quarta-feira' },
  { key: 'thursday', label: 'Quinta-feira' },
  { key: 'friday', label: 'Sexta-feira' },
  { key: 'saturday', label: 'Sábado' },
  { key: 'sunday', label: 'Domingo' },
];

export const Configuracoes: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ConfigTab>('studio');
  const [studioSettings, setStudioSettings] = useState<StudioSettings | null>(null);
  const [googleStatus, setGoogleStatus] = useState<GoogleCalendarConnection | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [expenseCategories, setExpenseCategories] = useState<ExpenseCategory[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isSyncingGoogle, setIsSyncingGoogle] = useState(false);

  // New item inputs
  const [newPmName, setNewPmName] = useState('');
  const [newEcName, setNewEcName] = useState('');

  const loadData = async () => {
    try {
      const s = await settingsService.get();
      const g = await googleCalendarService.getConnectionStatus();
      const a = await auditService.getRecentLogs(30);
      const pm = await financeService.getPaymentMethods();
      const ec = await financeService.getExpenseCategories();
      setStudioSettings(s);
      setGoogleStatus(g);
      setAuditLogs(a);
      setPaymentMethods(pm);
      setExpenseCategories(ec);
    } catch (err: unknown) {
      toast.error((err as Error).message);
    }
  };

  useEffect(() => {
    loadData();
    window.addEventListener('camilalash_storage_update', loadData);
    return () => window.removeEventListener('camilalash_storage_update', loadData);
  }, []);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studioSettings) return;

    setIsSaving(true);
    try {
      await settingsService.update(studioSettings);
      toast.success('Configurações do Studio salvas com sucesso!');
    } catch (err: unknown) {
      toast.error((err as Error).message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleGoogleConnect = async () => {
    try {
      if (googleStatus?.is_connected) {
        await googleCalendarService.disconnect();
        toast.info('Google Calendar desconectado.');
      } else {
        await googleCalendarService.connect('contato@camilarodriguesbeauty.com.br');
        toast.success('Google Calendar conectado e sincronizado com sucesso!');
      }
      loadData();
    } catch (err: unknown) {
      toast.error((err as Error).message);
    }
  };

  const handleSyncGoogle = async () => {
    setIsSyncingGoogle(true);
    try {
      const res = await googleCalendarService.syncNow();
      toast.success(res.message);
      loadData();
    } catch (err: unknown) {
      toast.error((err as Error).message);
    } finally {
      setIsSyncingGoogle(false);
    }
  };

  const handleAddPaymentMethod = async () => {
    if (!newPmName.trim()) return;
    try {
      await financeService.createPaymentMethod(newPmName);
      setNewPmName('');
      toast.success('Forma de pagamento adicionada!');
      loadData();
    } catch (err: unknown) {
      toast.error((err as Error).message);
    }
  };

  const handleAddExpenseCategory = async () => {
    if (!newEcName.trim()) return;
    try {
      await financeService.createExpenseCategory(newEcName);
      setNewEcName('');
      toast.success('Categoria de despesa criada!');
      loadData();
    } catch (err: unknown) {
      toast.error((err as Error).message);
    }
  };

  const handleUpdateScheduleDay = (dayKey: keyof StudioSettings['business_hours'], updates: Partial<DaySchedule>) => {
    if (!studioSettings) return;
    setStudioSettings({
      ...studioSettings,
      business_hours: {
        ...studioSettings.business_hours,
        [dayKey]: {
          ...studioSettings.business_hours[dayKey],
          ...updates,
        },
      },
    });
  };

  if (!studioSettings) {
    return <div className="p-8 text-center text-xs text-studio-muted">Carregando configurações...</div>;
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-5 rounded-3xl bg-white dark:bg-studio-darkCard border border-champagne-300 dark:border-studio-darkBorder shadow-sm">
        <div>
          <h2 className="font-serif text-xl font-bold text-studio-text dark:text-champagne-100 flex items-center gap-2">
            <Settings className="w-5 h-5 text-gold-600" />
            Configurações Gerais do Studio
          </h2>
          <p className="text-xs text-studio-muted dark:text-champagne-400">
            Personalize informações de contato, grade de horários, sincronização Google e trilha de auditoria
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-champagne-300 dark:border-studio-darkBorder gap-4 text-xs font-semibold overflow-x-auto">
        {[
          { id: 'studio', label: 'Dados do Studio', icon: Building },
          { id: 'schedule', label: 'Horários de Atendimento', icon: Clock },
          { id: 'google', label: 'Google Calendar Sync', icon: Calendar },
          { id: 'finance_config', label: 'Formas & Categorias', icon: CreditCard },
          { id: 'audit', label: 'Trilha de Auditoria & Logs', icon: ShieldCheck },
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as ConfigTab)}
              className={`pb-3 flex items-center gap-2 transition-colors border-b-2 font-serif text-sm whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-gold-500 text-gold-700 dark:text-gold-400 font-bold'
                  : 'border-transparent text-studio-muted hover:text-studio-text dark:text-champagne-300'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: DADOS DO STUDIO */}
      {activeTab === 'studio' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-studio-darkCard border border-champagne-300 dark:border-studio-darkBorder shadow-sm">
          <form onSubmit={handleSaveSettings} className="space-y-4 max-w-2xl">
            <Input
              label="Nome Oficial do Studio *"
              required
              value={studioSettings.studio_name}
              onChange={e => setStudioSettings({ ...studioSettings, studio_name: e.target.value })}
            />

            <Input
              label="Endereço Completo do Studio *"
              required
              value={studioSettings.address}
              onChange={e => setStudioSettings({ ...studioSettings, address: e.target.value })}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="WhatsApp Comercial *"
                required
                value={studioSettings.whatsapp}
                onChange={e => setStudioSettings({ ...studioSettings, whatsapp: e.target.value })}
              />
              <Input
                label="Instagram Profissional"
                value={studioSettings.instagram}
                onChange={e => setStudioSettings({ ...studioSettings, instagram: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="E-mail de Contato"
                type="email"
                value={studioSettings.email}
                onChange={e => setStudioSettings({ ...studioSettings, email: e.target.value })}
              />
              <Input
                label="Telefone Fixo"
                value={studioSettings.phone}
                onChange={e => setStudioSettings({ ...studioSettings, phone: e.target.value })}
              />
            </div>

            <div className="pt-4 border-t border-champagne-200 dark:border-studio-darkBorder">
              <Button type="submit" variant="primary" isLoading={isSaving} leftIcon={<Save className="w-4 h-4" />}>
                Salvar Informações
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 2: HORÁRIOS & INTERVALOS */}
      {activeTab === 'schedule' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-studio-darkCard border border-champagne-300 dark:border-studio-darkBorder shadow-sm">
          <form onSubmit={handleSaveSettings} className="space-y-6 max-w-3xl">
            <div>
              <h3 className="font-serif text-base font-bold text-studio-text dark:text-champagne-100 mb-1">
                Grade Semanal de Funcionamento
              </h3>
              <p className="text-xs text-studio-muted dark:text-champagne-400 mb-4">
                Defina horários de abertura, fechamento e dias de folga
              </p>
            </div>

            <div className="space-y-3">
              {DAYS_KEY_MAP.map(({ key, label }) => {
                const daySchedule: DaySchedule = studioSettings.business_hours[key];
                return (
                  <div
                    key={key}
                    className={`p-3.5 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs ${
                      daySchedule.isOpen
                        ? 'bg-champagne-50/60 dark:bg-studio-darkBorder/30 border-champagne-200 dark:border-studio-darkBorder'
                        : 'bg-zinc-100/60 dark:bg-zinc-900/40 border-dashed border-zinc-300 dark:border-zinc-800 opacity-60'
                    }`}
                  >
                    <div className="flex items-center gap-3 w-40">
                      <input
                        type="checkbox"
                        id={`open-${key}`}
                        checked={daySchedule.isOpen}
                        onChange={e => handleUpdateScheduleDay(key, { isOpen: e.target.checked })}
                        className="rounded text-gold-600 focus:ring-gold-500 w-4 h-4"
                      />
                      <label htmlFor={`open-${key}`} className="font-bold text-studio-text dark:text-champagne-100">
                        {label}
                      </label>
                    </div>

                    {daySchedule.isOpen ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="time"
                          value={daySchedule.open}
                          onChange={e => handleUpdateScheduleDay(key, { open: e.target.value })}
                          className="px-2.5 py-1 rounded-xl border border-champagne-300 dark:border-studio-darkBorder bg-white dark:bg-studio-darkCard text-xs font-semibold"
                        />
                        <span className="text-studio-muted">às</span>
                        <input
                          type="time"
                          value={daySchedule.close}
                          onChange={e => handleUpdateScheduleDay(key, { close: e.target.value })}
                          className="px-2.5 py-1 rounded-xl border border-champagne-300 dark:border-studio-darkBorder bg-white dark:bg-studio-darkCard text-xs font-semibold"
                        />
                      </div>
                    ) : (
                      <span className="text-studio-muted italic font-medium">Studio Fechado / Folga</span>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="pt-4 border-t border-champagne-200 dark:border-studio-darkBorder">
              <Button type="submit" variant="primary" isLoading={isSaving} leftIcon={<Save className="w-4 h-4" />}>
                Salvar Horários da Grade
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 3: GOOGLE CALENDAR */}
      {activeTab === 'google' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-studio-darkCard border border-champagne-300 dark:border-studio-darkBorder shadow-sm space-y-6 max-w-2xl">
          <div>
            <h3 className="font-serif text-base font-bold text-studio-text dark:text-champagne-100 mb-1 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gold-600" />
              Sincronização com Google Calendar
            </h3>
            <p className="text-xs text-studio-muted dark:text-champagne-400">
              Mantenha seus agendamentos sincronizados automaticamente com o calendário do seu smartphone
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-champagne-50/60 dark:bg-studio-darkBorder/30 border border-champagne-200 dark:border-studio-darkBorder flex items-start justify-between gap-4">
            <div className="space-y-1 text-xs">
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${googleStatus?.is_connected ? 'bg-emerald-500' : 'bg-zinc-400'}`} />
                <span className="font-bold text-studio-text dark:text-champagne-100">
                  {googleStatus?.is_connected ? 'Google Calendar Conectado' : 'Não Conectado'}
                </span>
              </div>
              {googleStatus?.is_connected && (
                <div className="text-studio-muted text-[11px] space-y-0.5">
                  <div>Conta: {googleStatus.google_account_email}</div>
                  <div>Última sincronização: {formatDate(googleStatus.last_sync_at, "dd/MM/yyyy 'às' HH:mm")}</div>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              {googleStatus?.is_connected && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSyncGoogle}
                  isLoading={isSyncingGoogle}
                  leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
                >
                  Sincronizar
                </Button>
              )}
              <Button
                variant={googleStatus?.is_connected ? 'danger' : 'primary'}
                size="sm"
                onClick={handleToggleGoogleConnect}
              >
                {googleStatus?.is_connected ? 'Desconectar' : 'Conectar Conta Google'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: FORMAS DE PAGAMENTO & CATEGORIAS */}
      {activeTab === 'finance_config' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Formas de Pagamento */}
          <div className="p-6 rounded-3xl bg-white dark:bg-studio-darkCard border border-champagne-300 dark:border-studio-darkBorder shadow-sm space-y-4">
            <h3 className="font-serif text-base font-bold text-studio-text dark:text-champagne-100 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-gold-600" />
              Formas de Pagamento Aceitas
            </h3>

            <div className="flex gap-2">
              <Input
                placeholder="Ex: Transferência TED, Link de Pagamento..."
                value={newPmName}
                onChange={e => setNewPmName(e.target.value)}
              />
              <Button size="sm" onClick={handleAddPaymentMethod} leftIcon={<Plus className="w-4 h-4" />}>
                Adicionar
              </Button>
            </div>

            <div className="divide-y divide-champagne-100 dark:divide-studio-darkBorder">
              {paymentMethods.map(pm => (
                <div key={pm.id} className="py-2.5 flex items-center justify-between text-xs">
                  <span className="font-semibold text-studio-text dark:text-champagne-100">{pm.name}</span>
                  <span className="text-[10px] text-emerald-600 font-bold">Ativa</span>
                </div>
              ))}
            </div>
          </div>

          {/* Categorias de Despesas */}
          <div className="p-6 rounded-3xl bg-white dark:bg-studio-darkCard border border-champagne-300 dark:border-studio-darkBorder shadow-sm space-y-4">
            <h3 className="font-serif text-base font-bold text-studio-text dark:text-champagne-100 flex items-center gap-2">
              <Layers className="w-4 h-4 text-gold-600" />
              Categorias de Custos e Despesas
            </h3>

            <div className="flex gap-2">
              <Input
                placeholder="Ex: Marketing Digital, Cafezinho..."
                value={newEcName}
                onChange={e => setNewEcName(e.target.value)}
              />
              <Button size="sm" onClick={handleAddExpenseCategory} leftIcon={<Plus className="w-4 h-4" />}>
                Adicionar
              </Button>
            </div>

            <div className="divide-y divide-champagne-100 dark:divide-studio-darkBorder">
              {expenseCategories.map(ec => (
                <div key={ec.id} className="py-2.5 flex items-center justify-between text-xs">
                  <span className="font-semibold text-studio-text dark:text-champagne-100">{ec.name}</span>
                  <span className="text-[10px] text-studio-muted">Categoria de Custo</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: AUDITORIA & LOGS */}
      {activeTab === 'audit' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-studio-darkCard border border-champagne-300 dark:border-studio-darkBorder shadow-sm space-y-4">
          <div>
            <h3 className="font-serif text-base font-bold text-studio-text dark:text-champagne-100 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-gold-600" />
              Trilha de Auditoria & Registro de Eventos
            </h3>
            <p className="text-xs text-studio-muted dark:text-champagne-400">
              Histórico seguro de todas as alterações, exclusões e criações realizadas no sistema
            </p>
          </div>

          <div className="divide-y divide-champagne-200 dark:divide-studio-darkBorder max-h-[500px] overflow-y-auto">
            {auditLogs.map(log => (
              <div key={log.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        log.action === 'create'
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950'
                          : log.action === 'update'
                          ? 'bg-amber-50 text-amber-700 dark:bg-amber-950'
                          : 'bg-rose-50 text-rose-700 dark:bg-rose-950'
                      }`}
                    >
                      {log.action}
                    </span>
                    <span className="font-bold text-studio-text dark:text-champagne-100">
                      Entidade: {log.entity_type} {log.entity_id ? `(${log.entity_id.slice(0, 8)}...)` : ''}
                    </span>
                  </div>
                  <div className="text-[11px] text-studio-muted mt-0.5">
                    {log.description} • Operador: {log.user_email || 'Camila Rodrigues'}
                  </div>
                </div>

                <span className="text-[11px] text-studio-muted">
                  {formatDate(log.created_at, "dd/MM/yyyy 'às' HH:mm:ss")}
                </span>
              </div>
            ))}

            {auditLogs.length === 0 && (
              <div className="p-8 text-center text-xs text-studio-muted">
                Nenhum log registrado ainda.
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
