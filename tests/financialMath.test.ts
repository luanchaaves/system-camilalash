// ========================================================================
// SISTEMA DE GESTÃO — CAMILA RODRIGUES BEAUTY STUDIO
// Unit Tests: financialMath.test.ts
// ========================================================================

import { describe, it, expect } from 'vitest';
import {
  toCents,
  fromCents,
  calculateNetProfit,
  calculateAverageTicket,
  calculateRemainingAmount,
  calculateProfitMargin,
} from '../src/utils/financialMath';

describe('Financial Math Precision', () => {
  it('converte corretamente para centavos sem perda de ponto flutuante', () => {
    expect(toCents(120.55)).toBe(12055);
    expect(toCents(0.1 + 0.2)).toBe(30); // Previne o famoso bug 0.30000000000000004
    expect(fromCents(12055)).toBe(120.55);
  });

  it('calcula lucro líquido com exatidão', () => {
    const revenue = 4500.75;
    const expenses = 1850.50;
    const profit = calculateNetProfit(revenue, expenses);
    expect(profit).toBe(2650.25);
  });

  it('calcula ticket médio com divisão segura por zero', () => {
    expect(calculateAverageTicket(1500, 10)).toBe(150);
    expect(calculateAverageTicket(1500, 0)).toBe(0);
  });

  it('calcula valor restante descontando o sinal', () => {
    const total = 150.0;
    const deposit = 50.0;
    expect(calculateRemainingAmount(total, deposit)).toBe(100.0);
  });

  it('calcula margem de lucro percentual com segurança', () => {
    expect(calculateProfitMargin(1000, 2000)).toBe(50);
    expect(calculateProfitMargin(0, 0)).toBe(0);
  });
});
