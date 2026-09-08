// ========================================================================
// SISTEMA DE GESTÃO — CAMILA RODRIGUES BEAUTY STUDIO
// Service: Finance Service (Entradas, Saídas, Contas, Fluxo de Caixa)
// ========================================================================

import {
  FinancialEntry,
  FinancialExpense,
  PaymentMethod,
  ExpenseCategory,
  FinancialStatus,
  ExpenseStatus,
  CostType,
  FinancialEntryCategory,
} from '../types';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { storage } from '../lib/storageAdapter';
import { auditService } from './audit.service';
import { aggregateFinancialEntries, aggregateFinancialExpenses } from '../utils/financialMath';

export interface FinancialEntryDTO {
  description: string;
  category: FinancialEntryCategory;
  amount: number;
  client_id?: string;
  service_id?: string;
  payment_method_id?: string;
  date: string;
  due_date?: string;
  status: FinancialStatus;
  notes?: string;
}

export interface FinancialExpenseDTO {
  description: string;
  category_id?: string;
  amount: number;
  cost_type: CostType;
  payment_method_id?: string;
  supplier?: string;
  date: string;
  due_date?: string;
  is_recurring: boolean;
  recurrence_interval?: 'weekly' | 'monthly' | 'yearly' | 'custom';
  recurrence_day?: number;
  status: ExpenseStatus;
  notes?: string;
}

export const financeService = {
  // --- ENTRADAS ---
  async getEntries(): Promise<FinancialEntry[]> {
    let entries: FinancialEntry[] = [];
    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase.from('financial_entries').select('*').order('date', { ascending: false });
      if (error) throw new Error(error.message);
      entries = data || [];
    } else {
      entries = storage.getFinancialEntries();
    }

    const clients = storage.getClients();
    const services = storage.getServices();
    const paymentMethods = storage.getPaymentMethods();

    return entries.map(e => ({
      ...e,
      client: clients.find(c => c.id === e.client_id),
      service: services.find(s => s.id === e.service_id),
      payment_method: paymentMethods.find(p => p.id === e.payment_method_id),
    }));
  },

  async createEntry(dto: FinancialEntryDTO): Promise<FinancialEntry> {
    const profile = storage.getProfile();
    const newEntry: FinancialEntry = {
      id: 'ent_' + Date.now(),
      user_id: profile?.id || 'usr_camila_01',
      description: dto.description.trim(),
      category: dto.category,
      amount: dto.amount,
      client_id: dto.client_id,
      service_id: dto.service_id,
      payment_method_id: dto.payment_method_id,
      date: dto.date,
      due_date: dto.due_date,
      status: dto.status,
      notes: dto.notes?.trim(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase.from('financial_entries').insert([newEntry]).select().single();
      if (error) throw new Error(error.message);
      newEntry.id = data.id;
    } else {
      const current = storage.getFinancialEntries();
      storage.setFinancialEntries([newEntry, ...current]);
    }

    await auditService.log({
      entity_type: 'financial_entry',
      entity_id: newEntry.id,
      action: 'create',
      description: `Entrada financeira cadastrada: "${newEntry.description}" no valor de R$ ${newEntry.amount.toFixed(2)}.`,
    });

    return newEntry;
  },

  async updateEntry(id: string, dto: Partial<FinancialEntryDTO>): Promise<FinancialEntry> {
    const entries = storage.getFinancialEntries();
    const existing = entries.find(e => e.id === id);
    if (!existing) throw new Error('Entrada não encontrada.');

    const updated: FinancialEntry = {
      ...existing,
      ...dto,
      updated_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured() && supabase) {
      const { error } = await supabase.from('financial_entries').update(updated).eq('id', id);
      if (error) throw new Error(error.message);
    } else {
      storage.setFinancialEntries(entries.map(e => e.id === id ? updated : e));
    }

    await auditService.log({
      entity_type: 'financial_entry',
      entity_id: id,
      action: 'update',
      description: `Entrada financeira "${updated.description}" atualizada.`,
      changes: dto as Record<string, unknown>,
    });

    return updated;
  },

  async deleteEntry(id: string): Promise<void> {
    const entries = storage.getFinancialEntries();
    const existing = entries.find(e => e.id === id);
    if (!existing) throw new Error('Entrada não encontrada.');

    if (isSupabaseConfigured() && supabase) {
      const { error } = await supabase.from('financial_entries').delete().eq('id', id);
      if (error) throw new Error(error.message);
    } else {
      storage.setFinancialEntries(entries.filter(e => e.id !== id));
    }

    await auditService.log({
      entity_type: 'financial_entry',
      entity_id: id,
      action: 'delete',
      description: `Entrada financeira "${existing.description}" removida.`,
    });
  },

  // --- SAÍDAS / DESPESAS ---
  async getExpenses(): Promise<FinancialExpense[]> {
    let expenses: FinancialExpense[] = [];
    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase.from('financial_expenses').select('*').order('date', { ascending: false });
      if (error) throw new Error(error.message);
      expenses = data || [];
    } else {
      expenses = storage.getFinancialExpenses();
    }

    const categories = storage.getExpenseCategories();
    const paymentMethods = storage.getPaymentMethods();

    return expenses.map(e => ({
      ...e,
      category: categories.find(c => c.id === e.category_id),
      payment_method: paymentMethods.find(p => p.id === e.payment_method_id),
    }));
  },

  async createExpense(dto: FinancialExpenseDTO): Promise<FinancialExpense> {
    const profile = storage.getProfile();
    const newExpense: FinancialExpense = {
      id: 'exp_' + Date.now(),
      user_id: profile?.id || 'usr_camila_01',
      description: dto.description.trim(),
      category_id: dto.category_id,
      amount: dto.amount,
      cost_type: dto.cost_type,
      payment_method_id: dto.payment_method_id,
      supplier: dto.supplier?.trim(),
      date: dto.date,
      due_date: dto.due_date,
      is_recurring: dto.is_recurring,
      recurrence_interval: dto.recurrence_interval,
      recurrence_day: dto.recurrence_day,
      status: dto.status,
      notes: dto.notes?.trim(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase.from('financial_expenses').insert([newExpense]).select().single();
      if (error) throw new Error(error.message);
      newExpense.id = data.id;
    } else {
      const current = storage.getFinancialExpenses();
      storage.setFinancialExpenses([newExpense, ...current]);
    }

    await auditService.log({
      entity_type: 'financial_expense',
      entity_id: newExpense.id,
      action: 'create',
      description: `Despesa cadastrada: "${newExpense.description}" no valor de R$ ${newExpense.amount.toFixed(2)}.`,
    });

    return newExpense;
  },

  async updateExpense(id: string, dto: Partial<FinancialExpenseDTO>): Promise<FinancialExpense> {
    const expenses = storage.getFinancialExpenses();
    const existing = expenses.find(e => e.id === id);
    if (!existing) throw new Error('Despesa não encontrada.');

    const updated: FinancialExpense = {
      ...existing,
      ...dto,
      updated_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured() && supabase) {
      const { error } = await supabase.from('financial_expenses').update(updated).eq('id', id);
      if (error) throw new Error(error.message);
    } else {
      storage.setFinancialExpenses(expenses.map(e => e.id === id ? updated : e));
    }

    await auditService.log({
      entity_type: 'financial_expense',
      entity_id: id,
      action: 'update',
      description: `Despesa "${updated.description}" atualizada.`,
      changes: dto as Record<string, unknown>,
    });

    return updated;
  },

  async deleteExpense(id: string): Promise<void> {
    const expenses = storage.getFinancialExpenses();
    const existing = expenses.find(e => e.id === id);
    if (!existing) throw new Error('Despesa não encontrada.');

    if (isSupabaseConfigured() && supabase) {
      const { error } = await supabase.from('financial_expenses').delete().eq('id', id);
      if (error) throw new Error(error.message);
    } else {
      storage.setFinancialExpenses(expenses.filter(e => e.id !== id));
    }

    await auditService.log({
      entity_type: 'financial_expense',
      entity_id: id,
      action: 'delete',
      description: `Despesa "${existing.description}" removida.`,
    });
  },

  // --- FORMAS DE PAGAMENTO E CATEGORIAS ---
  async getPaymentMethods(): Promise<PaymentMethod[]> {
    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase.from('payment_methods').select('*').order('name');
      if (error) throw new Error(error.message);
      return data || [];
    }
    return storage.getPaymentMethods();
  },

  async createPaymentMethod(name: string): Promise<PaymentMethod> {
    const list = storage.getPaymentMethods();
    const newPm: PaymentMethod = {
      id: 'pm_' + Date.now(),
      name,
      is_active: true,
      created_at: new Date().toISOString(),
    };
    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase.from('payment_methods').insert(newPm).select().single();
      if (error) throw new Error(error.message);
      return data;
    }
    storage.setPaymentMethods([...list, newPm]);
    return newPm;
  },

  async getExpenseCategories(): Promise<ExpenseCategory[]> {
    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase.from('expense_categories').select('*').order('name');
      if (error) throw new Error(error.message);
      return data || [];
    }
    return storage.getExpenseCategories();
  },

  async createExpenseCategory(name: string, cost_type: CostType = 'variable'): Promise<ExpenseCategory> {
    const list = storage.getExpenseCategories();
    const newEc: ExpenseCategory = {
      id: 'ec_' + Date.now(),
      name,
      cost_type,
      is_active: true,
      created_at: new Date().toISOString(),
    };
    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase.from('expense_categories').insert(newEc).select().single();
      if (error) throw new Error(error.message);
      return data;
    }
    storage.setExpenseCategories([...list, newEc]);
    return newEc;
  },

  // --- FLUXO DE CAIXA E RESUMOS ---
  async getFinancialOverview(startDate?: string, endDate?: string) {
    const allEntries = await this.getEntries();
    const allExpenses = await this.getExpenses();

    const filteredEntries = allEntries.filter(e => {
      if (startDate && e.date < startDate) return false;
      if (endDate && e.date > endDate) return false;
      return true;
    });

    const filteredExpenses = allExpenses.filter(e => {
      if (startDate && e.date < startDate) return false;
      if (endDate && e.date > endDate) return false;
      return true;
    });

    const entriesSummary = aggregateFinancialEntries(filteredEntries);
    const expensesSummary = aggregateFinancialExpenses(filteredExpenses);
    const netProfit = entriesSummary.received - expensesSummary.paid;
    const profitMargin = entriesSummary.received > 0 ? (netProfit / entriesSummary.received) * 100 : 0;

    return {
      entries: filteredEntries,
      expenses: filteredExpenses,
      revenue: entriesSummary.received,
      pendingReceivables: entriesSummary.pending,
      paidExpenses: expensesSummary.paid,
      pendingExpenses: expensesSummary.pending,
      fixedExpenses: expensesSummary.fixed,
      variableExpenses: expensesSummary.variable,
      netProfit,
      profitMargin: Math.round(profitMargin * 10) / 10,
    };
  },
};
