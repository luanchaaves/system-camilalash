// ========================================================================
// SISTEMA DE GESTÃO — CAMILA RODRIGUES BEAUTY STUDIO
// Unit Tests: formatters.test.ts
// ========================================================================

import { describe, it, expect } from 'vitest';
import {
  formatBRL,
  parseBRL,
  formatPhoneNumber,
  getWhatsAppLink,
  formatDuration,
} from '../src/utils/formatters';

describe('Formatters and Helpers', () => {
  it('formata valor monetário para o padrão Real Brasileiro (BRL)', () => {
    const formatted = formatBRL(1250.5);
    expect(formatted).toContain('1.250,50');
    expect(formatted).toContain('R$');
  });

  it('faz parse de string formatada para número float', () => {
    expect(parseBRL('R$ 1.250,50')).toBe(1250.5);
    expect(parseBRL('150,00')).toBe(150);
  });

  it('formata números de telefone brasileiro com máscara', () => {
    expect(formatPhoneNumber('11941070247')).toBe('(11) 94107-0247');
    expect(formatPhoneNumber('1133334444')).toBe('(11) 3333-4444');
  });

  it('gera link wa.me com mensagem codificada para o WhatsApp', () => {
    const link = getWhatsAppLink('11941070247', 'Olá Camila');
    expect(link).toContain('https://wa.me/5511941070247');
    expect(link).toContain('text=Ol%C3%A1%20Camila');
  });

  it('formata duração de minutos para formato legível', () => {
    expect(formatDuration(120)).toBe('2h');
    expect(formatDuration(90)).toBe('1h 30min');
    expect(formatDuration(45)).toBe('45min');
  });
});
