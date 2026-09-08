// ========================================================================
// SISTEMA DE GESTÃO — CAMILA RODRIGUES BEAUTY STUDIO
// Page: Dashboard.tsx (Painel Executivo Principal)
// ========================================================================

import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  DollarSign,
  TrendingUp,
  Calendar,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  Clock,
  Sparkles,
  CreditCard,
  Plus,
  Send,
  PieChart as PieChartIcon,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { storage } from '../lib/storageAdapter';
import { Appointment, FinancialEntry, FinancialExpense, Client, Service } from '../types';
import { formatBRL, formatDate, formatTime, getWhatsAppLink } from '../utils/formatters';
import { calculateNetProfit, calculateAverageTicket } from '../utils/financialMath';
import { Button } from '../components/common/Button';
import { AppointmentStatusBadge } from '../components/common/Badge';
import { appointmentsService } from '../services/appointments.service';
import { toast } from 'sonner';

const LUX_COLORS = ['#C5A880', '#A08050', '#7E6032', '#D4AF37', '#E5D3B3', '#8B5A2B'];

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [entries, setEntries] = useState<FinancialEntry[]>([]);
  const [expenses, setExpenses] = useState<FinancialExpense[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [services, setServices] = useState<Service[]>([]);

  const loadData = () => {
    setAppointments(storage.getAppointments());
    setEntries(storage.getFinancialEntries());
    setExpenses(storage.getFinancialExpenses());
    setClients(storage.getClients());
    setServices(storage.getServices());
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
    }));
  }, [appointments, clients, services]);

  const todayStr = new Date().toISOString().split('T')[0];

  // Atendimentos de Hoje
  const todayAppointments = useMemo(() => {
    return populatedAppointments
      .filter(a => a.start_time.startsWith(todayStr))
      .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());
  }, [populatedAppointments, todayStr]);

  // Próximo atendimento do dia
  const nextAppointment = useMemo(() => {
    const now = new Date();
    return todayAppointments.find(
      a => (a.status === 'scheduled' || a.status === 'confirmed') && new Date(a.start_time) >= now
    );
  }, [todayAppointments]);

  // Cálculos Financeiros
  const currentMonthReceived = useMemo(() => {
    return entries
      .filter(e => e.status === 'received')
      .reduce((sum, e) => sum + e.amount, 0);
  }, [entries]);

  const currentMonthExpenses = useMemo(() => {
    return expenses
      .filter(e => e.status === 'paid')
      .reduce((sum, e) => sum + e.amount, 0);
  }, [expenses]);

  const pendingReceivables = useMemo(() => {
    return entries
      .filter(e => e.status === 'pending')
      .reduce((sum, e) => sum + e.amount, 0);
  }, [entries]);

  const pendingExpenses = useMemo(() => {
    return expenses
      .filter(e => e.status === 'pending')
      .reduce((sum, e) => sum + e.amount, 0);
  }, [expenses]);

  const netProfit = calculateNetProfit(currentMonthReceived, currentMonthExpenses);
  const completedCount = appointments.filter(a => a.status === 'completed').length;
  const averageTicket = calculateAverageTicket(currentMonthReceived, completedCount);

  // Gráfico Histórico 6 Meses
  const monthlyChartData = useMemo(() => {
    return [
      { month: 'Abr', faturamento: 2800, despesas: 1450, lucro: 1350 },
      { month: 'Mai', faturamento: 3400, despesas: 1520, lucro: 1880 },
      { month: 'Jun', faturamento: 3950, despesas: 1600, lucro: 2350 },
      { month: 'Jul', faturamento: 4300, despesas: 1780, lucro: 2520 },
      { month: 'Ago', faturamento: 4900, despesas: 1850, lucro: 3050 },
      { month: 'Set (Atual)', faturamento: currentMonthReceived, despesas: currentMonthExpenses, lucro: netProfit },
    ];
  }, [currentMonthReceived, currentMonthExpenses, netProfit]);

  // Ranking de Serviços
  const serviceRankingData = useMemo(() => {
    const countMap: Record<string, number> = {};
    for (const app of appointments) {
      if (app.status === 'completed' || app.status === 'confirmed' || app.status === 'scheduled') {
        const sName = app.service?.name || 'Volume Cristal';
        countMap[sName] = (countMap[sName] || 0) + 1;
      }
    }
    return Object.keys(countMap).map(name => ({
      name,
      value: countMap[name],
    }));
  }, [appointments]);

  const handleCompleteAppointment = async (id: string) => {
    try {
      await appointmentsService.updateStatus(id, 'completed');
      toast.success('Atendimento concluído! Lançamento financeiro registrado com sucesso.');
      loadData();
    } catch (err: unknown) {
      toast.error((err as Error).message);
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-champagne-200/80 via-champagne-100/60 to-white dark:from-studio-darkCard dark:via-studio-darkBorder/40 dark:to-studio-darkBg border border-champagne-300 dark:border-studio-darkBorder shadow-lux">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gold-600 dark:text-gold-400">
            <Sparkles className="w-4 h-4" />
            <span>Painel de Controle do Studio</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-studio-text dark:text-champagne-100 mt-1">
            Olá, Camila Rodrigues
          </h1>
          <p className="text-xs sm:text-sm text-studio-muted dark:text-champagne-400 mt-0.5">
            Aqui está a visão consolidada de faturamento, agenda de hoje e métricas do seu negócio.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/relatorios')}
            leftIcon={<TrendingUp className="w-4 h-4" />}
          >
            Relatórios
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate('/agenda')}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Novo Agendamento
          </Button>
        </div>
      </div>

      {/* 8 KPI CARDS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* 1. Faturamento */}
        <div className="p-5 rounded-2xl bg-white dark:bg-studio-darkCard border border-champagne-300 dark:border-studio-darkBorder shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-studio-muted dark:text-champagne-400">
              Faturamento Realizado
            </span>
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold font-serif text-emerald-600 dark:text-emerald-400">
            {formatBRL(currentMonthReceived)}
          </div>
          <div className="mt-1 flex items-center gap-1 text-[11px] text-emerald-600 font-semibold">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>+18.4% vs mês anterior</span>
          </div>
        </div>

        {/* 2. Lucro Líquido */}
        <div className="p-5 rounded-2xl bg-white dark:bg-studio-darkCard border border-champagne-300 dark:border-studio-darkBorder shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-studio-muted dark:text-champagne-400">
              Lucro Líquido
            </span>
            <div className="p-2 rounded-xl bg-gold-50 dark:bg-gold-950/40 text-gold-600">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold font-serif text-gold-600 dark:text-gold-400">
            {formatBRL(netProfit)}
          </div>
          <div className="mt-1 text-[11px] text-studio-muted dark:text-champagne-400">
            Margem de {currentMonthReceived > 0 ? ((netProfit / currentMonthReceived) * 100).toFixed(0) : 0}% de lucro
          </div>
        </div>

        {/* 3. Despesas Pagas */}
        <div className="p-5 rounded-2xl bg-white dark:bg-studio-darkCard border border-champagne-300 dark:border-studio-darkBorder shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-studio-muted dark:text-champagne-400">
              Despesas Pagas
            </span>
            <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600">
              <ArrowDownRight className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold font-serif text-rose-600 dark:text-rose-400">
            {formatBRL(currentMonthExpenses)}
          </div>
          <div className="mt-1 text-[11px] text-studio-muted dark:text-champagne-400">
            Aluguel, fios, colas e serviços
          </div>
        </div>

        {/* 4. Ticket Médio */}
        <div className="p-5 rounded-2xl bg-white dark:bg-studio-darkCard border border-champagne-300 dark:border-studio-darkBorder shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-studio-muted dark:text-champagne-400">
              Ticket Médio
            </span>
            <div className="p-2 rounded-xl bg-champagne-200 dark:bg-studio-darkBorder text-gold-700 dark:text-gold-300">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold font-serif text-studio-text dark:text-champagne-100">
            {formatBRL(averageTicket)}
          </div>
          <div className="mt-1 text-[11px] text-studio-muted dark:text-champagne-400">
            Por atendimento concluído
          </div>
        </div>

        {/* 5. Atendimentos Concluídos */}
        <div className="p-5 rounded-2xl bg-white dark:bg-studio-darkCard border border-champagne-300 dark:border-studio-darkBorder shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-studio-muted dark:text-champagne-400">
              Atendimentos Realizados
            </span>
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold font-serif text-studio-text dark:text-champagne-100">
            {completedCount}
          </div>
          <div className="mt-1 text-[11px] text-studio-muted dark:text-champagne-400">
            {clients.length} clientes ativas na base
          </div>
        </div>

        {/* 6. Contas a Receber */}
        <div className="p-5 rounded-2xl bg-white dark:bg-studio-darkCard border border-champagne-300 dark:border-studio-darkBorder shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-studio-muted dark:text-champagne-400">
              Contas a Receber
            </span>
            <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold font-serif text-amber-600 dark:text-amber-400">
            {formatBRL(pendingReceivables)}
          </div>
          <div className="mt-1 text-[11px] text-amber-600 font-semibold">
            Valores a receber no studio
          </div>
        </div>

        {/* 7. Despesas Pendentes */}
        <div className="p-5 rounded-2xl bg-white dark:bg-studio-darkCard border border-champagne-300 dark:border-studio-darkBorder shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-studio-muted dark:text-champagne-400">
              Contas a Pagar
            </span>
            <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold font-serif text-purple-600 dark:text-purple-400">
            {formatBRL(pendingExpenses)}
          </div>
          <div className="mt-1 text-[11px] text-studio-muted dark:text-champagne-400">
            Despesas com vencimento próximo
          </div>
        </div>

        {/* 8. Próximo Atendimento */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-gold-500 to-gold-700 text-white shadow-lux">
          <div className="flex items-center justify-between text-white/80">
            <span className="text-xs font-bold uppercase tracking-wider">
              Próximo Horário
            </span>
            <Clock className="w-4 h-4" />
          </div>
          {nextAppointment ? (
            <div className="mt-2">
              <div className="text-xl font-bold font-serif truncate">
                {nextAppointment.client?.full_name || 'Cliente'}
              </div>
              <div className="text-xs text-white/90 font-medium mt-0.5">
                {formatTime(nextAppointment.start_time)} — {nextAppointment.service?.name}
              </div>
            </div>
          ) : (
            <div className="mt-3">
              <div className="text-sm font-semibold">Sem novos horários hoje</div>
              <div className="text-[10px] text-white/80">Agenda do dia em dia</div>
            </div>
          )}
        </div>

      </div>

      {/* AGENDA DE HOJE */}
      <div className="p-6 rounded-3xl bg-white dark:bg-studio-darkCard border border-champagne-300 dark:border-studio-darkBorder shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-serif text-lg font-bold text-studio-text dark:text-champagne-100 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-gold-600" />
              Agenda de Hoje ({formatDate(todayStr, "dd 'de' MMMM")})
            </h3>
            <p className="text-xs text-studio-muted dark:text-champagne-400">
              {todayAppointments.length} atendimentos programados para hoje
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={() => navigate('/agenda')}>
            Ver Mês Completo
          </Button>
        </div>

        {todayAppointments.length > 0 ? (
          <div className="divide-y divide-champagne-200 dark:divide-studio-darkBorder">
            {todayAppointments.map(app => (
              <div key={app.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-start sm:items-center gap-3">
                  <div className="px-3 py-1.5 rounded-xl bg-champagne-200 dark:bg-studio-darkBorder text-xs font-bold text-gold-700 dark:text-gold-300 shrink-0">
                    {formatTime(app.start_time)} - {formatTime(app.end_time)}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-studio-text dark:text-champagne-100">
                      {app.client?.full_name || 'Cliente'}
                    </div>
                    <div className="text-xs text-studio-muted dark:text-champagne-400">
                      {app.service?.name} ({app.appointment_type === 'maintenance' ? 'Manutenção' : 'Aplicação'}) • {formatBRL(app.total_amount)}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <AppointmentStatusBadge status={app.status} />

                  {app.client?.whatsapp && (
                    <a
                      href={getWhatsAppLink(app.client.whatsapp, `Olá ${app.client.full_name}, confirmando seu horário hoje às ${formatTime(app.start_time)} no Camila Rodrigues Studio!`)}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1.5 rounded-lg border border-champagne-300 dark:border-studio-darkBorder hover:bg-emerald-50 text-emerald-600 transition-colors"
                      title="Enviar WhatsApp"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </a>
                  )}

                  {app.status !== 'completed' && app.status !== 'cancelled' && (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleCompleteAppointment(app.id)}
                    >
                      Concluir
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center text-xs text-studio-muted border border-dashed border-champagne-300 dark:border-studio-darkBorder rounded-2xl">
            Nenhum atendimento agendado para o dia de hoje.
          </div>
        )}
      </div>

      {/* RECHARTS GRAPHS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Gráfico 1: Faturamento x Despesas x Lucro (2 Colunas) */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-white dark:bg-studio-darkCard border border-champagne-300 dark:border-studio-darkBorder shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-serif text-base font-bold text-studio-text dark:text-champagne-100">
                Evolução Financeira (Últimos 6 Meses)
              </h3>
              <p className="text-xs text-studio-muted dark:text-champagne-400">
                Comparativo de Faturamento Recebido vs Despesas Pagas e Lucro
              </p>
            </div>
          </div>

          <div className="h-64 sm:h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyChartData}>
                <defs>
                  <linearGradient id="goldGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#C5A880" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#C5A880" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="roseGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#E11D48" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#E11D48" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" stroke="#A8A29E" fontSize={11} />
                <YAxis stroke="#A8A29E" fontSize={11} tickFormatter={v => `R$${v}`} />
                <Tooltip
                  formatter={(value: number) => [formatBRL(value)]}
                  contentStyle={{ backgroundColor: '#FAF8F5', borderRadius: '12px', borderColor: '#E5D3B3', fontSize: '12px' }}
                />
                <Legend />
                <Area type="monotone" dataKey="faturamento" name="Faturamento" stroke="#C5A880" strokeWidth={2} fillOpacity={1} fill="url(#goldGrad)" />
                <Area type="monotone" dataKey="despesas" name="Despesas" stroke="#E11D48" strokeWidth={2} fillOpacity={1} fill="url(#roseGrad)" />
                <Area type="monotone" dataKey="lucro" name="Lucro Líquido" stroke="#10B981" strokeWidth={2} fillOpacity={0} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gráfico 2: Ranking de Procedimentos */}
        <div className="p-6 rounded-3xl bg-white dark:bg-studio-darkCard border border-champagne-300 dark:border-studio-darkBorder shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-serif text-base font-bold text-studio-text dark:text-champagne-100 flex items-center gap-2">
              <PieChartIcon className="w-4 h-4 text-gold-600" />
              Procedimentos Mais Realizados
            </h3>
            <p className="text-xs text-studio-muted dark:text-champagne-400 mb-4">
              Participação por volume de lash no Studio
            </p>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={serviceRankingData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {serviceRankingData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={LUX_COLORS[index % LUX_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: number) => [`${v} atendimentos`]} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-1.5 pt-2 border-t border-champagne-200 dark:border-studio-darkBorder">
            {serviceRankingData.slice(0, 3).map((item, i) => (
              <div key={item.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: LUX_COLORS[i % LUX_COLORS.length] }} />
                  <span className="font-medium text-studio-text dark:text-champagne-200">{item.name}</span>
                </div>
                <span className="font-bold text-gold-700 dark:text-gold-400">{item.value}x</span>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
