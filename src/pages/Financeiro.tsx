// ========================================================================
// SISTEMA DE GESTÃO — CAMILA RODRIGUES BEAUTY STUDIO
// Page: Financeiro.tsx (Gestão Financeira, Entradas, Despesas, Edição & Exclusão)
// ========================================================================

import React, { useState, useEffect, useMemo } from 'react';
import {
  DollarSign,
  TrendingUp,
  Plus,
  Search,
  Download,
  AlertTriangle,
  Edit2,
  Trash2,
  ArrowDownRight,
  ArrowUpRight,
  CheckCircle2,
} from 'lucide-react';
import { storage } from '../lib/storageAdapter';
import {
  FinancialEntry,
  FinancialExpense,
  PaymentMethod,
  ExpenseCategory,
  Client,
  Service,
  FinancialStatus,
  ExpenseStatus,
  CostType,
  FinancialEntryCategory,
} from '../types';
import { formatBRL, formatDate } from '../utils/formatters';
import { financeService, FinancialEntryDTO, FinancialExpenseDTO } from '../services/finance.service';
import { exportToCSV, exportFinancialReportPDF } from '../utils/exportUtils';
import { calculateNetProfit } from '../utils/financialMath';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Select } from '../components/common/Select';
import { CurrencyInput } from '../components/common/CurrencyInput';
import { Modal } from '../components/common/Modal';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { FinancialStatusBadge } from '../components/common/Badge';
import { toast } from 'sonner';

type FinancialTab = 'overview' | 'entries' | 'expenses' | 'receivables';

export const Financeiro: React.FC = () => {
  const [activeTab, setActiveTab] = useState<FinancialTab>('overview');
  const [entries, setEntries] = useState<FinancialEntry[]>([]);
  const [expenses, setExpenses] = useState<FinancialExpense[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [expenseCategories, setExpenseCategories] = useState<ExpenseCategory[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [services, setServices] = useState<Service[]>([]);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  // Modals
  const [isEntryModalOpen, setIsEntryModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<FinancialEntry | null>(null);

  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<FinancialExpense | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete State
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ id: string; type: 'entry' | 'expense'; description: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form State - Entrada
  const [entryForm, setEntryForm] = useState<FinancialEntryDTO>({
    description: '',
    category: 'service',
    amount: 120,
    client_id: '',
    service_id: '',
    payment_method_id: '',
    date: new Date().toISOString().split('T')[0],
    status: 'received',
    notes: '',
  });

  // Form State - Despesa
  const [expenseForm, setExpenseForm] = useState<FinancialExpenseDTO>({
    description: '',
    category_id: '',
    amount: 100,
    cost_type: 'variable',
    payment_method_id: '',
    supplier: '',
    date: new Date().toISOString().split('T')[0],
    is_recurring: false,
    status: 'paid',
    notes: '',
  });

  const loadData = async () => {
    try {
      const eList = await financeService.getEntries();
      const expList = await financeService.getExpenses();
      const pmList = await financeService.getPaymentMethods();
      const ecList = await financeService.getExpenseCategories();
      setEntries(eList);
      setExpenses(expList);
      setPaymentMethods(pmList);
      setExpenseCategories(ecList);
      setClients(storage.getClients());
      setServices(storage.getServices());
    } catch (err: unknown) {
      toast.error((err as Error).message);
    }
  };

  useEffect(() => {
    loadData();
    window.addEventListener('camilalash_storage_update', loadData);
    return () => window.removeEventListener('camilalash_storage_update', loadData);
  }, []);

  // Cálculos Financeiros
  const totalReceived = useMemo(() => {
    return entries.filter(e => e.status === 'received').reduce((sum, e) => sum + e.amount, 0);
  }, [entries]);

  const totalPaidExpenses = useMemo(() => {
    return expenses.filter(e => e.status === 'paid').reduce((sum, e) => sum + e.amount, 0);
  }, [expenses]);

  const totalPendingReceivables = useMemo(() => {
    return entries.filter(e => e.status === 'pending').reduce((sum, e) => sum + e.amount, 0);
  }, [entries]);

  const fixedExpensesTotal = useMemo(() => {
    return expenses.filter(e => e.status === 'paid' && e.cost_type === 'fixed').reduce((sum, e) => sum + e.amount, 0);
  }, [expenses]);

  const variableExpensesTotal = useMemo(() => {
    return expenses.filter(e => e.status === 'paid' && e.cost_type === 'variable').reduce((sum, e) => sum + e.amount, 0);
  }, [expenses]);

  const netProfit = calculateNetProfit(totalReceived, totalPaidExpenses);

  // Filtros de listagem
  const filteredEntries = useMemo(() => {
    return entries.filter(e => {
      const matchQuery =
        e.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (e.client?.full_name && e.client.full_name.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchDate = !dateFilter || e.date === dateFilter;
      return matchQuery && matchDate;
    });
  }, [entries, searchQuery, dateFilter]);

  const filteredExpenses = useMemo(() => {
    return expenses.filter(e => {
      const matchQuery =
        e.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (e.supplier && e.supplier.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchDate = !dateFilter || e.date === dateFilter;
      return matchQuery && matchDate;
    });
  }, [expenses, searchQuery, dateFilter]);

  const pendingReceivablesList = useMemo(() => {
    return entries.filter(e => e.status === 'pending');
  }, [entries]);

  // Handlers para Entrada
  const handleOpenCreateEntry = () => {
    setEditingEntry(null);
    setEntryForm({
      description: '',
      category: 'service',
      amount: 120,
      client_id: clients[0]?.id || '',
      service_id: services[0]?.id || '',
      payment_method_id: paymentMethods[0]?.id || '',
      date: new Date().toISOString().split('T')[0],
      status: 'received',
      notes: '',
    });
    setIsEntryModalOpen(true);
  };

  const handleOpenEditEntry = (entry: FinancialEntry) => {
    setEditingEntry(entry);
    setEntryForm({
      description: entry.description,
      category: entry.category,
      amount: entry.amount,
      client_id: entry.client_id || '',
      service_id: entry.service_id || '',
      payment_method_id: entry.payment_method_id || '',
      date: entry.date,
      due_date: entry.due_date,
      status: entry.status,
      notes: entry.notes || '',
    });
    setIsEntryModalOpen(true);
  };

  const handleSubmitEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!entryForm.description.trim()) {
      toast.error('Informe a descrição da entrada.');
      return;
    }
    setIsSubmitting(true);
    try {
      if (editingEntry) {
        await financeService.updateEntry(editingEntry.id, entryForm);
        toast.success('Entrada financeira atualizada com sucesso!');
      } else {
        await financeService.createEntry(entryForm);
        toast.success('Entrada financeira registrada com sucesso!');
      }
      setIsEntryModalOpen(false);
      loadData();
    } catch (err: unknown) {
      toast.error((err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handlers para Despesa
  const handleOpenCreateExpense = () => {
    setEditingExpense(null);
    setExpenseForm({
      description: '',
      category_id: expenseCategories[0]?.id || '',
      amount: 100,
      cost_type: 'variable',
      payment_method_id: paymentMethods[0]?.id || '',
      supplier: '',
      date: new Date().toISOString().split('T')[0],
      is_recurring: false,
      status: 'paid',
      notes: '',
    });
    setIsExpenseModalOpen(true);
  };

  const handleOpenEditExpense = (expense: FinancialExpense) => {
    setEditingExpense(expense);
    setExpenseForm({
      description: expense.description,
      category_id: expense.category_id || '',
      amount: expense.amount,
      cost_type: expense.cost_type,
      payment_method_id: expense.payment_method_id || '',
      supplier: expense.supplier || '',
      date: expense.date,
      due_date: expense.due_date,
      is_recurring: expense.is_recurring,
      recurrence_interval: expense.recurrence_interval,
      recurrence_day: expense.recurrence_day,
      status: expense.status,
      notes: expense.notes || '',
    });
    setIsExpenseModalOpen(true);
  };

  const handleSubmitExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!expenseForm.description.trim()) {
      toast.error('Informe a descrição da despesa.');
      return;
    }
    setIsSubmitting(true);
    try {
      if (editingExpense) {
        await financeService.updateExpense(editingExpense.id, expenseForm);
        toast.success('Despesa atualizada com sucesso!');
      } else {
        await financeService.createExpense(expenseForm);
        toast.success('Despesa registrada no financeiro!');
      }
      setIsExpenseModalOpen(false);
      loadData();
    } catch (err: unknown) {
      toast.error((err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMarkAsReceived = async (entry: FinancialEntry) => {
    try {
      await financeService.updateEntry(entry.id, { status: 'received' });
      toast.success(`Entrada de ${formatBRL(entry.amount)} marcada como recebida!`);
      loadData();
    } catch (err: unknown) {
      toast.error((err as Error).message);
    }
  };

  const handleDeleteItem = async () => {
    if (!itemToDelete) return;
    setIsDeleting(true);
    try {
      if (itemToDelete.type === 'entry') {
        await financeService.deleteEntry(itemToDelete.id);
        toast.success('Entrada removida do histórico financeiro.');
      } else {
        await financeService.deleteExpense(itemToDelete.id);
        toast.success('Despesa removida do histórico financeiro.');
      }
      setIsDeleteDialogOpen(false);
      setItemToDelete(null);
      loadData();
    } catch (err: unknown) {
      toast.error((err as Error).message);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleExportPDF = () => {
    const margin = totalReceived > 0 ? (netProfit / totalReceived) * 100 : 0;
    exportFinancialReportPDF('Mês Atual', entries, expenses, {
      revenue: totalReceived,
      expenses: totalPaidExpenses,
      netProfit,
      margin,
    });
    toast.success('Relatório Financeiro PDF gerado com sucesso!');
  };

  const handleExportCSV = () => {
    const headers = ['Tipo', 'Data', 'Descrição', 'Categoria', 'Status', 'Valor (R$)'];
    const rows: (string | number)[][] = [
      ...entries.map(e => ['Entrada', formatDate(e.date), e.description, e.category, e.status, e.amount]),
      ...expenses.map(e => ['Despesa', formatDate(e.date), e.description, e.category?.name || 'Geral', e.status, -e.amount]),
    ];
    exportToCSV('Financeiro_CamilaRodrigues', headers, rows);
    toast.success('Extrato financeiro exportado em CSV!');
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-5 rounded-3xl bg-white dark:bg-studio-darkCard border border-champagne-300 dark:border-studio-darkBorder shadow-sm">
        <div>
          <h2 className="font-serif text-xl font-bold text-studio-text dark:text-champagne-100 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-gold-600" />
            Gestão Financeira & Fluxo de Caixa
          </h2>
          <p className="text-xs text-studio-muted dark:text-champagne-400">
            Faturamento realizado, controle de custos fixos/variáveis e contas a receber
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleExportCSV} leftIcon={<Download className="w-4 h-4" />}>
            CSV
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportPDF} leftIcon={<Download className="w-4 h-4" />}>
            Exportar PDF
          </Button>
          <Button variant="outline" size="sm" onClick={handleOpenCreateExpense} leftIcon={<Plus className="w-4 h-4" />}>
            Nova Despesa
          </Button>
          <Button variant="primary" size="sm" onClick={handleOpenCreateEntry} leftIcon={<Plus className="w-4 h-4" />}>
            Nova Entrada
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-studio-darkCard border border-champagne-300 dark:border-studio-darkBorder shadow-sm">
          <div className="flex items-center justify-between text-xs font-bold uppercase text-studio-muted">
            <span>Faturamento Recebido</span>
            <ArrowUpRight className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-serif font-bold text-emerald-600 dark:text-emerald-400 mt-1">
            {formatBRL(totalReceived)}
          </div>
          <div className="text-[11px] text-studio-muted mt-0.5">Valores efetivamente pagos</div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-studio-darkCard border border-champagne-300 dark:border-studio-darkBorder shadow-sm">
          <div className="flex items-center justify-between text-xs font-bold uppercase text-studio-muted">
            <span>Despesas Pagas</span>
            <ArrowDownRight className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-serif font-bold text-rose-600 dark:text-rose-400 mt-1">
            {formatBRL(totalPaidExpenses)}
          </div>
          <div className="text-[11px] text-studio-muted mt-0.5">Fixas: {formatBRL(fixedExpensesTotal)} | Var: {formatBRL(variableExpensesTotal)}</div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-studio-darkCard border border-champagne-300 dark:border-studio-darkBorder shadow-sm">
          <div className="flex items-center justify-between text-xs font-bold uppercase text-studio-muted">
            <span>Lucro Líquido Realizado</span>
            <TrendingUp className="w-4 h-4 text-gold-600" />
          </div>
          <div className={`text-2xl font-serif font-bold mt-1 ${netProfit >= 0 ? 'text-gold-700 dark:text-gold-400' : 'text-rose-600'}`}>
            {formatBRL(netProfit)}
          </div>
          <div className="text-[11px] text-studio-muted mt-0.5">Receitas - Despesas Pagas</div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-studio-darkCard border border-champagne-300 dark:border-studio-darkBorder shadow-sm">
          <div className="flex items-center justify-between text-xs font-bold uppercase text-studio-muted">
            <span>Contas a Receber</span>
            <span className="text-amber-500 font-bold">⏳</span>
          </div>
          <div className="text-2xl font-serif font-bold text-amber-600 mt-1">
            {formatBRL(totalPendingReceivables)}
          </div>
          <div className="text-[11px] text-studio-muted mt-0.5">Valores pendentes</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-champagne-300 dark:border-studio-darkBorder gap-6 text-xs font-semibold">
        {[
          { id: 'overview', label: 'Visão Geral & Fluxo' },
          { id: 'entries', label: `Entradas (${entries.length})` },
          { id: 'expenses', label: `Despesas (${expenses.length})` },
          { id: 'receivables', label: `Contas a Receber (${pendingReceivablesList.length})` },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as FinancialTab)}
            className={`pb-3 transition-colors border-b-2 font-serif text-sm ${
              activeTab === tab.id
                ? 'border-gold-500 text-gold-700 dark:text-gold-400 font-bold'
                : 'border-transparent text-studio-muted hover:text-studio-text dark:text-champagne-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: VISÃO GERAL */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Últimas Entradas */}
          <div className="p-5 rounded-3xl bg-white dark:bg-studio-darkCard border border-champagne-300 dark:border-studio-darkBorder shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-serif text-base font-bold text-studio-text dark:text-champagne-100 flex items-center gap-2">
                <ArrowUpRight className="w-4 h-4 text-emerald-600" />
                Últimas Entradas Registradas
              </h3>
              <Button variant="ghost" size="sm" onClick={() => setActiveTab('entries')}>
                Ver Todas
              </Button>
            </div>
            <div className="space-y-2">
              {entries.slice(0, 5).map(e => (
                <div key={e.id} className="p-3 rounded-xl bg-champagne-50/50 dark:bg-studio-darkBorder/30 flex items-center justify-between text-xs hover:border-gold-300 transition-all border border-transparent">
                  <div className="pr-2 truncate">
                    <div className="font-bold text-studio-text dark:text-champagne-100 truncate">{e.description}</div>
                    <div className="text-[11px] text-studio-muted">{formatDate(e.date)} • {e.payment_method?.name || 'Pix'}</div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <div className="font-bold text-emerald-600 font-serif">{formatBRL(e.amount)}</div>
                      <FinancialStatusBadge status={e.status} />
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEditEntry(e)}
                        className="p-1.5 rounded-lg border border-champagne-300 hover:bg-champagne-100 dark:border-studio-darkBorder dark:hover:bg-studio-darkCard text-studio-muted hover:text-gold-600 transition-colors"
                        title="Editar Entrada"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          setItemToDelete({ id: e.id, type: 'entry', description: e.description });
                          setIsDeleteDialogOpen(true);
                        }}
                        className="p-1.5 rounded-lg border border-champagne-300 hover:bg-rose-50 dark:border-studio-darkBorder dark:hover:bg-rose-950/40 text-studio-muted hover:text-rose-600 transition-colors"
                        title="Excluir Entrada"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {entries.length === 0 && (
                <div className="p-6 text-center text-xs text-studio-muted">
                  Nenhuma entrada registrada. Clique em "Nova Entrada" para cadastrar.
                </div>
              )}
            </div>
          </div>

          {/* Últimas Despesas */}
          <div className="p-5 rounded-3xl bg-white dark:bg-studio-darkCard border border-champagne-300 dark:border-studio-darkBorder shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-serif text-base font-bold text-studio-text dark:text-champagne-100 flex items-center gap-2">
                <ArrowDownRight className="w-4 h-4 text-rose-600" />
                Últimas Despesas & Custos
              </h3>
              <Button variant="ghost" size="sm" onClick={() => setActiveTab('expenses')}>
                Ver Todas
              </Button>
            </div>
            <div className="space-y-2">
              {expenses.slice(0, 5).map(exp => (
                <div key={exp.id} className="p-3 rounded-xl bg-champagne-50/50 dark:bg-studio-darkBorder/30 flex items-center justify-between text-xs hover:border-gold-300 transition-all border border-transparent">
                  <div className="pr-2 truncate">
                    <div className="font-bold text-studio-text dark:text-champagne-100 truncate">{exp.description}</div>
                    <div className="text-[11px] text-studio-muted">{formatDate(exp.date)} • {exp.cost_type === 'fixed' ? 'Custo Fixo' : 'Custo Variável'}</div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <div className="font-bold text-rose-600 font-serif">{formatBRL(exp.amount)}</div>
                      <FinancialStatusBadge status={exp.status} />
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEditExpense(exp)}
                        className="p-1.5 rounded-lg border border-champagne-300 hover:bg-champagne-100 dark:border-studio-darkBorder dark:hover:bg-studio-darkCard text-studio-muted hover:text-gold-600 transition-colors"
                        title="Editar Despesa"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          setItemToDelete({ id: exp.id, type: 'expense', description: exp.description });
                          setIsDeleteDialogOpen(true);
                        }}
                        className="p-1.5 rounded-lg border border-champagne-300 hover:bg-rose-50 dark:border-studio-darkBorder dark:hover:bg-rose-950/40 text-studio-muted hover:text-rose-600 transition-colors"
                        title="Excluir Despesa"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {expenses.length === 0 && (
                <div className="p-6 text-center text-xs text-studio-muted">
                  Nenhuma despesa registrada. Clique em "Nova Despesa" para cadastrar.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ENTRADAS */}
      {activeTab === 'entries' && (
        <div className="p-5 rounded-3xl bg-white dark:bg-studio-darkCard border border-champagne-300 dark:border-studio-darkBorder shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <Input
                placeholder="Buscar em entradas..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                leftIcon={<Search className="w-4 h-4" />}
              />
            </div>
            <div className="w-full sm:w-48">
              <Input
                type="date"
                value={dateFilter}
                onChange={e => setDateFilter(e.target.value)}
              />
            </div>
          </div>

          <div className="divide-y divide-champagne-200 dark:divide-studio-darkBorder">
            {filteredEntries.map(e => (
              <div key={e.id} className="py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs">
                <div>
                  <div className="font-bold text-sm text-studio-text dark:text-champagne-100">{e.description}</div>
                  <div className="text-studio-muted">
                    Data: {formatDate(e.date)} • Categoria: {e.category} • Forma: {e.payment_method?.name || 'Pix'}
                    {e.client?.full_name && ` • Cliente: ${e.client.full_name}`}
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-auto">
                  <span className="font-serif font-bold text-base text-emerald-600 dark:text-emerald-400">
                    {formatBRL(e.amount)}
                  </span>
                  <FinancialStatusBadge status={e.status} />
                  <button
                    onClick={() => handleOpenEditEntry(e)}
                    className="p-1.5 rounded-lg border border-champagne-300 hover:bg-champagne-100 dark:border-studio-darkBorder dark:hover:bg-studio-darkCard text-studio-muted hover:text-gold-600 transition-colors"
                    title="Editar Entrada"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      setItemToDelete({ id: e.id, type: 'entry', description: e.description });
                      setIsDeleteDialogOpen(true);
                    }}
                    className="p-1.5 rounded-lg border border-champagne-300 hover:bg-rose-50 dark:border-studio-darkBorder dark:hover:bg-rose-950/40 text-studio-muted hover:text-rose-600 transition-colors"
                    title="Excluir Entrada"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}

            {filteredEntries.length === 0 && (
              <div className="p-8 text-center text-xs text-studio-muted">
                Nenhuma entrada encontrada com os filtros aplicados.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: DESPESAS */}
      {activeTab === 'expenses' && (
        <div className="p-5 rounded-3xl bg-white dark:bg-studio-darkCard border border-champagne-300 dark:border-studio-darkBorder shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <Input
                placeholder="Buscar despesas e fornecedores..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                leftIcon={<Search className="w-4 h-4" />}
              />
            </div>
            <div className="w-full sm:w-48">
              <Input
                type="date"
                value={dateFilter}
                onChange={e => setDateFilter(e.target.value)}
              />
            </div>
          </div>

          <div className="divide-y divide-champagne-200 dark:divide-studio-darkBorder">
            {filteredExpenses.map(exp => (
              <div key={exp.id} className="py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs">
                <div>
                  <div className="font-bold text-sm text-studio-text dark:text-champagne-100 flex items-center gap-1.5">
                    {exp.description}
                    {exp.is_recurring && (
                      <span className="px-1.5 py-0.5 rounded-md bg-gold-50 text-gold-700 text-[10px] font-bold border border-gold-200">
                        Recorrente Mensal
                      </span>
                    )}
                  </div>
                  <div className="text-studio-muted">
                    Data: {formatDate(exp.date)} • Tipo: {exp.cost_type === 'fixed' ? 'Custo Fixo' : 'Custo Variável'} • Fornecedor: {exp.supplier || 'Geral'}
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-auto">
                  <span className="font-serif font-bold text-base text-rose-600 dark:text-rose-400">
                    {formatBRL(exp.amount)}
                  </span>
                  <FinancialStatusBadge status={exp.status} />
                  <button
                    onClick={() => handleOpenEditExpense(exp)}
                    className="p-1.5 rounded-lg border border-champagne-300 hover:bg-champagne-100 dark:border-studio-darkBorder dark:hover:bg-studio-darkCard text-studio-muted hover:text-gold-600 transition-colors"
                    title="Editar Despesa"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      setItemToDelete({ id: exp.id, type: 'expense', description: exp.description });
                      setIsDeleteDialogOpen(true);
                    }}
                    className="p-1.5 rounded-lg border border-champagne-300 hover:bg-rose-50 dark:border-studio-darkBorder dark:hover:bg-rose-950/40 text-studio-muted hover:text-rose-600 transition-colors"
                    title="Excluir Despesa"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}

            {filteredExpenses.length === 0 && (
              <div className="p-8 text-center text-xs text-studio-muted">
                Nenhuma despesa encontrada com os filtros aplicados.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: CONTAS A RECEBER */}
      {activeTab === 'receivables' && (
        <div className="p-5 rounded-3xl bg-white dark:bg-studio-darkCard border border-champagne-300 dark:border-studio-darkBorder shadow-sm space-y-4">
          <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-300 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span>Valores pendentes que só entram no faturamento realizado após a confirmação do pagamento.</span>
            </div>
            <div className="font-bold text-sm font-serif">{formatBRL(totalPendingReceivables)} pendentes</div>
          </div>

          <div className="divide-y divide-champagne-200 dark:divide-studio-darkBorder">
            {pendingReceivablesList.map(item => (
              <div key={item.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs">
                <div>
                  <div className="font-bold text-sm text-studio-text dark:text-champagne-100">{item.description}</div>
                  <div className="text-studio-muted">
                    Vencimento: {formatDate(item.due_date || item.date)} • Cliente: {item.client?.full_name || 'Cliente'}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="font-serif font-bold text-base text-amber-600 mr-2">
                    {formatBRL(item.amount)}
                  </span>
                  <Button variant="primary" size="sm" onClick={() => handleMarkAsReceived(item)} leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}>
                    Confirmar Recebimento
                  </Button>
                  <button
                    onClick={() => handleOpenEditEntry(item)}
                    className="p-1.5 rounded-lg border border-champagne-300 hover:bg-champagne-100 dark:border-studio-darkBorder dark:hover:bg-studio-darkCard text-studio-muted hover:text-gold-600 transition-colors"
                    title="Editar Entrada Pendente"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      setItemToDelete({ id: item.id, type: 'entry', description: item.description });
                      setIsDeleteDialogOpen(true);
                    }}
                    className="p-1.5 rounded-lg border border-champagne-300 hover:bg-rose-50 dark:border-studio-darkBorder dark:hover:bg-rose-950/40 text-studio-muted hover:text-rose-600 transition-colors"
                    title="Excluir Entrada Pendente"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}

            {pendingReceivablesList.length === 0 && (
              <div className="p-8 text-center text-xs text-studio-muted">
                Parabéns! Não existem contas a receber pendentes no momento.
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL NOVA / EDITAR ENTRADA */}
      <Modal
        isOpen={isEntryModalOpen}
        onClose={() => setIsEntryModalOpen(false)}
        title={editingEntry ? 'Editar Entrada Financeira' : 'Registrar Nova Entrada'}
        subtitle="Informe a descrição, valor e status da receita"
      >
        <form onSubmit={handleSubmitEntry} className="space-y-4">
          <Input
            label="Descrição *"
            required
            placeholder="Ex: Aplicação Volume Pérola VIP, Curso..."
            value={entryForm.description}
            onChange={e => setEntryForm({ ...entryForm, description: e.target.value })}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <CurrencyInput
              label="Valor (R$) *"
              value={entryForm.amount}
              onChange={val => setEntryForm({ ...entryForm, amount: val })}
            />
            <Select
              label="Categoria"
              options={[
                { value: 'service', label: 'Serviço / Atendimento' },
                { value: 'deposit', label: 'Sinal de Agendamento' },
                { value: 'product', label: 'Venda de Produto' },
                { value: 'course', label: 'Curso / Mentoria' },
                { value: 'other', label: 'Outra Receita' },
              ]}
              value={entryForm.category}
              onChange={e => setEntryForm({ ...entryForm, category: e.target.value as FinancialEntryCategory })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Data *"
              type="date"
              required
              value={entryForm.date}
              onChange={e => setEntryForm({ ...entryForm, date: e.target.value })}
            />
            <Select
              label="Forma de Pagamento"
              options={paymentMethods.map(p => ({ value: p.id, label: p.name }))}
              value={entryForm.payment_method_id || ''}
              onChange={e => setEntryForm({ ...entryForm, payment_method_id: e.target.value })}
            />
          </div>

          <Select
            label="Status do Pagamento"
            options={[
              { value: 'received', label: 'Recebido (Entra no Faturamento Realizado)' },
              { value: 'pending', label: 'Pendente (Conta a Receber)' },
            ]}
            value={entryForm.status}
            onChange={e => setEntryForm({ ...entryForm, status: e.target.value as FinancialStatus })}
          />

          <Input
            label="Observações"
            placeholder="Ex: Pagamento parcelado, cliente pagou 50% adiantado..."
            value={entryForm.notes || ''}
            onChange={e => setEntryForm({ ...entryForm, notes: e.target.value })}
          />

          <div className="flex items-center justify-between pt-3 border-t border-champagne-200 dark:border-studio-darkBorder">
            <div>
              {editingEntry && (
                <Button
                  variant="danger"
                  type="button"
                  size="sm"
                  onClick={() => {
                    setItemToDelete({ id: editingEntry.id, type: 'entry', description: editingEntry.description });
                    setIsEntryModalOpen(false);
                    setIsDeleteDialogOpen(true);
                  }}
                  leftIcon={<Trash2 className="w-4 h-4" />}
                >
                  Excluir Entrada
                </Button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" type="button" onClick={() => setIsEntryModalOpen(false)}>
                Cancelar
              </Button>
              <Button variant="primary" type="submit" isLoading={isSubmitting}>
                {editingEntry ? 'Salvar Alterações' : 'Registrar Entrada'}
              </Button>
            </div>
          </div>
        </form>
      </Modal>

      {/* MODAL NOVA / EDITAR DESPESA */}
      <Modal
        isOpen={isExpenseModalOpen}
        onClose={() => setIsExpenseModalOpen(false)}
        title={editingExpense ? 'Editar Despesa' : 'Registrar Nova Despesa'}
        subtitle="Controle custos fixos e variáveis do Studio"
      >
        <form onSubmit={handleSubmitExpense} className="space-y-4">
          <Input
            label="Descrição da Despesa *"
            required
            placeholder="Ex: Aluguel da sala, compra de fios nagaraku..."
            value={expenseForm.description}
            onChange={e => setExpenseForm({ ...expenseForm, description: e.target.value })}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <CurrencyInput
              label="Valor (R$) *"
              value={expenseForm.amount}
              onChange={val => setExpenseForm({ ...expenseForm, amount: val })}
            />
            <Select
              label="Tipo de Custo *"
              options={[
                { value: 'fixed', label: 'Custo Fixo (Aluguel, Luz, Internet...)' },
                { value: 'variable', label: 'Custo Variável (Materiais, Anúncios...)' },
              ]}
              value={expenseForm.cost_type}
              onChange={e => setExpenseForm({ ...expenseForm, cost_type: e.target.value as CostType })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Select
              label="Categoria"
              options={expenseCategories.map(c => ({ value: c.id, label: c.name }))}
              value={expenseForm.category_id || ''}
              onChange={e => setExpenseForm({ ...expenseForm, category_id: e.target.value })}
            />
            <Input
              label="Fornecedor / Estabelecimento"
              placeholder="Ex: Lash Shop SP, Imobiliária..."
              value={expenseForm.supplier || ''}
              onChange={e => setExpenseForm({ ...expenseForm, supplier: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Data de Vencimento/Pagamento *"
              type="date"
              required
              value={expenseForm.date}
              onChange={e => setExpenseForm({ ...expenseForm, date: e.target.value })}
            />
            <Select
              label="Status"
              options={[
                { value: 'paid', label: 'Pago (Abate do Lucro)' },
                { value: 'pending', label: 'Pendente (Conta a Pagar)' },
              ]}
              value={expenseForm.status}
              onChange={e => setExpenseForm({ ...expenseForm, status: e.target.value as ExpenseStatus })}
            />
          </div>

          <Input
            label="Observações"
            placeholder="Ex: Comprado com desconto à vista via Pix..."
            value={expenseForm.notes || ''}
            onChange={e => setExpenseForm({ ...expenseForm, notes: e.target.value })}
          />

          <div className="flex items-center justify-between pt-3 border-t border-champagne-200 dark:border-studio-darkBorder">
            <div>
              {editingExpense && (
                <Button
                  variant="danger"
                  type="button"
                  size="sm"
                  onClick={() => {
                    setItemToDelete({ id: editingExpense.id, type: 'expense', description: editingExpense.description });
                    setIsExpenseModalOpen(false);
                    setIsDeleteDialogOpen(true);
                  }}
                  leftIcon={<Trash2 className="w-4 h-4" />}
                >
                  Excluir Despesa
                </Button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" type="button" onClick={() => setIsExpenseModalOpen(false)}>
                Cancelar
              </Button>
              <Button variant="primary" type="submit" isLoading={isSubmitting}>
                {editingExpense ? 'Salvar Alterações' : 'Salvar Despesa'}
              </Button>
            </div>
          </div>
        </form>
      </Modal>

      {/* CONFIRMAÇÃO EXCLUSÃO */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDeleteItem}
        isLoading={isDeleting}
        title={`Excluir ${itemToDelete?.type === 'entry' ? 'Entrada Financeira' : 'Despesa'}`}
        description={`Tem certeza que deseja excluir permanentemente "${itemToDelete?.description || 'este lançamento'}"? Esta ação recalculará o faturamento e o fluxo de caixa.`}
        confirmText="Sim, Excluir"
        cancelText="Cancelar"
        variant="danger"
      />

    </div>
  );
};
