// ========================================================================
// SISTEMA DE GESTÃO — CAMILA RODRIGUES BEAUTY STUDIO
// Utilities: Financial Math (Cálculos Financeiros de Alta Precisão)
// ========================================================================

import { FinancialEntry, FinancialExpense, Appointment } from '../types';

/**
 * Converte valor numérico para centavos inteiros para evitar imprecisão de floating-point.
 */
export function toCents(amount: number): number {
  if (isNaN(amount)) return 0;
  return Math.round(amount * 100);
}

/**
 * Converte centavos inteiros de volta para valor float arredondado.
 */
export function fromCents(cents: number): number {
  return Math.round(cents) / 100;
}

/**
 * Calcula o Lucro Líquido Realizado (Faturamento Recebido - Despesas Pagas).
 */
export function calculateNetProfit(receivedRevenue: number, paidExpenses: number): number {
  const revCents = toCents(receivedRevenue);
  const expCents = toCents(paidExpenses);
  return fromCents(revCents - expCents);
}

/**
 * Calcula o Ticket Médio: Faturamento Recebido / Quantidade de Atendimentos Concluídos.
 */
export function calculateAverageTicket(revenue: number, completedCount: number): number {
  if (!completedCount || completedCount <= 0) return 0;
  const revCents = toCents(revenue);
  const ticketCents = Math.round(revCents / completedCount);
  return fromCents(ticketCents);
}

/**
 * Calcula o Valor Restante após pagamento de sinal.
 */
export function calculateRemainingAmount(totalAmount: number, depositAmount: number): number {
  const totalCents = toCents(totalAmount);
  const depositCents = toCents(depositAmount);
  const remainingCents = Math.max(0, totalCents - depositCents);
  return fromCents(remainingCents);
}

/**
 * Calcula a Margem de Lucro percentual.
 */
export function calculateProfitMargin(profit: number, revenue: number): number {
  if (!revenue || revenue <= 0) return 0;
  return Math.round((profit / revenue) * 10000) / 100; // e.g. 68.25%
}

/**
 * Agrega totais de Entradas Financeiras por status.
 */
export function aggregateFinancialEntries(entries: FinancialEntry[]) {
  let receivedCents = 0;
  let pendingCents = 0;
  let cancelledCents = 0;

  for (const entry of entries) {
    const amountCents = toCents(entry.amount);
    if (entry.status === 'received') {
      receivedCents += amountCents;
    } else if (entry.status === 'pending') {
      pendingCents += amountCents;
    } else if (entry.status === 'cancelled') {
      cancelledCents += amountCents;
    }
  }

  return {
    received: fromCents(receivedCents),
    pending: fromCents(pendingCents),
    cancelled: fromCents(cancelledCents),
    total: fromCents(receivedCents + pendingCents),
  };
}

/**
 * Agrega totais de Despesas por status e tipo de custo.
 */
export function aggregateFinancialExpenses(expenses: FinancialExpense[]) {
  let paidCents = 0;
  let pendingCents = 0;
  let fixedCents = 0;
  let variableCents = 0;

  for (const exp of expenses) {
    const amountCents = toCents(exp.amount);
    if (exp.status === 'paid') {
      paidCents += amountCents;
      if (exp.cost_type === 'fixed') {
        fixedCents += amountCents;
      } else {
        variableCents += amountCents;
      }
    } else if (exp.status === 'pending') {
      pendingCents += amountCents;
    }
  }

  return {
    paid: fromCents(paidCents),
    pending: fromCents(pendingCents),
    fixed: fromCents(fixedCents),
    variable: fromCents(variableCents),
    total: fromCents(paidCents + pendingCents),
  };
}

/**
 * Analisa atendimentos para métricas de conversão.
 */
export function aggregateAppointments(appointments: Appointment[]) {
  let completed = 0;
  let scheduled = 0;
  let cancelled = 0;
  let noShow = 0;

  for (const app of appointments) {
    if (app.status === 'completed') completed++;
    else if (app.status === 'scheduled' || app.status === 'confirmed' || app.status === 'in_progress') scheduled++;
    else if (app.status === 'cancelled') cancelled++;
    else if (app.status === 'no_show') noShow++;
  }

  const totalActionable = completed + noShow + cancelled;
  const noShowRate = totalActionable > 0 ? (noShow / totalActionable) * 100 : 0;
  const cancellationRate = totalActionable > 0 ? (cancelled / totalActionable) * 100 : 0;

  return {
    completed,
    scheduled,
    cancelled,
    noShow,
    total: appointments.length,
    noShowRate: Math.round(noShowRate * 10) / 10,
    cancellationRate: Math.round(cancellationRate * 10) / 10,
  };
}
