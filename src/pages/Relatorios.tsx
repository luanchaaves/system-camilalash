// ========================================================================
// SISTEMA DE GESTÃO — CAMILA RODRIGUES BEAUTY STUDIO
// Page: Relatorios.tsx (Relatórios Executivos, Análise de Desempenho & PDF)
// ========================================================================

import React, { useState, useEffect, useMemo } from 'react';
import {
  BarChart3,
  Download,
  Calendar,
  Users,
  Sparkles,
  FileText,
} from 'lucide-react';
import { storage } from '../lib/storageAdapter';
import { FinancialEntry, FinancialExpense, Appointment, Client, Service } from '../types';
import { formatBRL, formatDate } from '../utils/formatters';
import { calculateNetProfit, calculateAverageTicket } from '../utils/financialMath';
import { exportFinancialReportPDF, exportToCSV } from '../utils/exportUtils';
import { Button } from '../components/common/Button';
import { Select } from '../components/common/Select';
import { toast } from 'sonner';

export const Relatorios: React.FC = () => {
  const [entries, setEntries] = useState<FinancialEntry[]>([]);
  const [expenses, setExpenses] = useState<FinancialExpense[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState('current_month');

  const loadData = () => {
    setEntries(storage.getFinancialEntries());
    setExpenses(storage.getFinancialExpenses());
    setAppointments(storage.getAppointments());
    setClients(storage.getClients());
    setServices(storage.getServices());
  };

  useEffect(() => {
    loadData();
    window.addEventListener('camilalash_storage_update', loadData);
    return () => window.removeEventListener('camilalash_storage_update', loadData);
  }, []);

  // Totalizadores
  const totalRevenue = useMemo(() => {
    return entries.filter(e => e.status === 'received').reduce((sum, e) => sum + e.amount, 0);
  }, [entries]);

  const totalExpenses = useMemo(() => {
    return expenses.filter(e => e.status === 'paid').reduce((sum, e) => sum + e.amount, 0);
  }, [expenses]);

  const netProfit = calculateNetProfit(totalRevenue, totalExpenses);
  const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

  const completedApps = appointments.filter(a => a.status === 'completed');
  const cancelledApps = appointments.filter(a => a.status === 'cancelled');
  const totalAppsCount = appointments.length;
  const completionRate = totalAppsCount > 0 ? (completedApps.length / totalAppsCount) * 100 : 0;
  const avgTicket = calculateAverageTicket(totalRevenue, completedApps.length);

  // Top Clientes
  const topClients = useMemo(() => {
    return [...clients]
      .sort((a, b) => (b.total_spent || 0) - (a.total_spent || 0))
      .slice(0, 5);
  }, [clients]);

  // Ranking de Serviços
  const serviceStats = useMemo(() => {
    const map: Record<string, { count: number; total: number; name: string }> = {};
    for (const app of appointments) {
      if (app.status === 'completed') {
        const srv = services.find(s => s.id === app.service_id);
        const name = srv?.name || 'Procedimento';
        if (!map[name]) {
          map[name] = { count: 0, total: 0, name };
        }
        map[name].count += 1;
        map[name].total += app.total_amount;
      }
    }
    return Object.values(map).sort((a, b) => b.total - a.total);
  }, [appointments, services]);

  const handleExportPDF = () => {
    const periodLabel = selectedPeriod === 'current_month' ? 'Mês Atual' : 'Consolidado Geral';
    exportFinancialReportPDF(periodLabel, entries, expenses, {
      revenue: totalRevenue,
      expenses: totalExpenses,
      netProfit,
      margin: profitMargin,
    });
    toast.success('Relatório Executivo PDF exportado com sucesso!');
  };

  const handleExportCSV = () => {
    const headers = ['Tipo', 'Data', 'Descrição', 'Valor (R$)', 'Status'];
    const rows = [
      ...entries.map(e => ['Entrada', formatDate(e.date), e.description, e.amount, e.status]),
      ...expenses.map(e => ['Despesa', formatDate(e.date), e.description, -e.amount, e.status]),
    ];
    exportToCSV('Demonstrativo_Geral_CamilaRodrigues', headers, rows);
    toast.success('Dados consolidados exportados em CSV!');
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-5 rounded-3xl bg-white dark:bg-studio-darkCard border border-champagne-300 dark:border-studio-darkBorder shadow-sm">
        <div>
          <h2 className="font-serif text-xl font-bold text-studio-text dark:text-champagne-100 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-gold-600" />
            Relatórios Executivos & DRE do Studio
          </h2>
          <p className="text-xs text-studio-muted dark:text-champagne-400">
            Análise consolidada de lucratividade, ranking de procedimentos e fidelização de clientes
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Select
            options={[
              { value: 'current_month', label: 'Mês Atual (Setembro/2026)' },
              { value: 'last_month', label: 'Mês Anterior (Agosto/2026)' },
              { value: 'all_time', label: 'Todo o Histórico' },
            ]}
            value={selectedPeriod}
            onChange={e => setSelectedPeriod(e.target.value)}
          />
          <Button variant="outline" size="sm" onClick={handleExportCSV} leftIcon={<Download className="w-4 h-4" />}>
            CSV
          </Button>
          <Button variant="primary" size="sm" onClick={handleExportPDF} leftIcon={<FileText className="w-4 h-4" />}>
            Gerar PDF Oficial
          </Button>
        </div>
      </div>

      {/* KPI 4 Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-studio-darkCard border border-champagne-300 dark:border-studio-darkBorder shadow-sm">
          <div className="text-xs font-bold uppercase tracking-wider text-studio-muted">Faturamento Bruto</div>
          <div className="text-2xl font-bold font-serif text-emerald-600 dark:text-emerald-400 mt-1">
            {formatBRL(totalRevenue)}
          </div>
          <div className="text-[11px] text-studio-muted mt-0.5">Total de entradas confirmadas</div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-studio-darkCard border border-champagne-300 dark:border-studio-darkBorder shadow-sm">
          <div className="text-xs font-bold uppercase tracking-wider text-studio-muted">Despesas Totais</div>
          <div className="text-2xl font-bold font-serif text-rose-600 dark:text-rose-400 mt-1">
            {formatBRL(totalExpenses)}
          </div>
          <div className="text-[11px] text-studio-muted mt-0.5">Custos operacionais quitados</div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-studio-darkCard border border-champagne-300 dark:border-studio-darkBorder shadow-sm">
          <div className="text-xs font-bold uppercase tracking-wider text-studio-muted">Lucro Líquido Real</div>
          <div className="text-2xl font-bold font-serif text-gold-600 dark:text-gold-400 mt-1">
            {formatBRL(netProfit)}
          </div>
          <div className="text-[11px] text-gold-600 font-semibold mt-0.5">Margem: {profitMargin.toFixed(1)}% de lucro</div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-studio-darkCard border border-champagne-300 dark:border-studio-darkBorder shadow-sm">
          <div className="text-xs font-bold uppercase tracking-wider text-studio-muted">Ticket Médio / Atend.</div>
          <div className="text-2xl font-bold font-serif text-studio-text dark:text-champagne-100 mt-1">
            {formatBRL(avgTicket)}
          </div>
          <div className="text-[11px] text-studio-muted mt-0.5">{completedApps.length} atendimentos concluídos</div>
        </div>
      </div>

      {/* Grid: 2 Colunas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Procedimentos Realizados */}
        <div className="p-6 rounded-3xl bg-white dark:bg-studio-darkCard border border-champagne-300 dark:border-studio-darkBorder shadow-sm">
          <h3 className="font-serif text-base font-bold text-studio-text dark:text-champagne-100 mb-3 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-gold-600" />
            Desempenho por Procedimento
          </h3>
          <div className="space-y-3">
            {serviceStats.map(s => (
              <div key={s.name} className="flex items-center justify-between p-3 rounded-xl bg-champagne-50/50 dark:bg-studio-darkBorder/30 text-xs">
                <div>
                  <div className="font-bold text-studio-text dark:text-champagne-100">{s.name}</div>
                  <div className="text-[11px] text-studio-muted">{s.count} atendimentos realizados</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-gold-700 dark:text-gold-400 font-serif">{formatBRL(s.total)}</div>
                  <div className="text-[10px] text-studio-muted">Total gerado</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Clientes VIP (LTV) */}
        <div className="p-6 rounded-3xl bg-white dark:bg-studio-darkCard border border-champagne-300 dark:border-studio-darkBorder shadow-sm">
          <h3 className="font-serif text-base font-bold text-studio-text dark:text-champagne-100 mb-3 flex items-center gap-2">
            <Users className="w-4 h-4 text-gold-600" />
            Top Clientes VIP (Maior Investimento)
          </h3>
          <div className="space-y-3">
            {topClients.map((c, i) => (
              <div key={c.id} className="flex items-center justify-between p-3 rounded-xl bg-champagne-50/50 dark:bg-studio-darkBorder/30 text-xs">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-gold-500 text-white font-bold flex items-center justify-center text-[10px]">
                    #{i + 1}
                  </span>
                  <div>
                    <div className="font-bold text-studio-text dark:text-champagne-100">{c.full_name}</div>
                    <div className="text-[11px] text-studio-muted">{c.total_appointments || 0} visitas ao Studio</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-gold-700 dark:text-gold-400 font-serif">{formatBRL(c.total_spent || 0)}</div>
                  <div className="text-[10px] text-studio-muted">LTV acumulado</div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Taxa de Comparecimento / Agenda */}
      <div className="p-6 rounded-3xl bg-white dark:bg-studio-darkCard border border-champagne-300 dark:border-studio-darkBorder shadow-sm">
        <h3 className="font-serif text-base font-bold text-studio-text dark:text-champagne-100 mb-4 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-gold-600" />
          Métricas de Ocupação & Assiduidade da Agenda
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
            <div className="text-xs font-bold uppercase text-emerald-700 dark:text-emerald-300">Taxa de Conclusão</div>
            <div className="text-2xl font-serif font-bold text-emerald-600 mt-1">{completionRate.toFixed(1)}%</div>
            <div className="text-[11px] text-studio-muted mt-0.5">{completedApps.length} de {totalAppsCount} agendamentos</div>
          </div>
          <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800">
            <div className="text-xs font-bold uppercase text-rose-700 dark:text-rose-300">Taxa de Cancelamento</div>
            <div className="text-2xl font-serif font-bold text-rose-600 mt-1">
              {totalAppsCount > 0 ? ((cancelledApps.length / totalAppsCount) * 100).toFixed(1) : 0}%
            </div>
            <div className="text-[11px] text-studio-muted mt-0.5">{cancelledApps.length} cancelamentos registrados</div>
          </div>
          <div className="p-4 rounded-2xl bg-gold-50 dark:bg-gold-950/40 border border-gold-200 dark:border-gold-800">
            <div className="text-xs font-bold uppercase text-gold-700 dark:text-gold-300">Total de Horários</div>
            <div className="text-2xl font-serif font-bold text-gold-600 mt-1">{totalAppsCount}</div>
            <div className="text-[11px] text-studio-muted mt-0.5">Atendimentos processados no total</div>
          </div>
        </div>
      </div>

    </div>
  );
};
