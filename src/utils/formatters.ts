// ========================================================================
// SISTEMA DE GESTÃO — CAMILA RODRIGUES BEAUTY STUDIO
// Utilities: Formatters (BRL, Datas, Telefones)
// ========================================================================

import { format, parseISO, isValid } from 'date-fns';
import { ptBR } from 'date-fns/locale';

/**
 * Formata um valor numérico para a moeda brasileira (BRL).
 * Exemplo: 1250.5 -> "R$ 1.250,50"
 */
export function formatBRL(value: number | null | undefined): string {
  if (value === null || value === undefined || isNaN(value)) {
    return 'R$ 0,00';
  }
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

/**
 * Converte string digitada com máscara ou vírgula em número flutuante limpo.
 * Exemplo: "1.250,50" -> 1250.5
 */
export function parseBRL(value: string | number): number {
  if (typeof value === 'number') return value;
  if (!value) return 0;
  const cleanStr = value
    .replace(/[^\d,-]/g, '')
    .replace(',', '.');
  const parsed = parseFloat(cleanStr);
  return isNaN(parsed) ? 0 : Math.round(parsed * 100) / 100;
}

/**
 * Formata uma data ISO ou Date para o padrão brasileiro DD/MM/YYYY.
 */
export function formatDate(date: string | Date | null | undefined, pattern: string = 'dd/MM/yyyy'): string {
  if (!date) return '-';
  try {
    const parsed = typeof date === 'string' ? parseISO(date) : date;
    if (!isValid(parsed)) return '-';
    return format(parsed, pattern, { locale: ptBR });
  } catch {
    return '-';
  }
}

/**
 * Formata data e hora para exibição amigável: DD/MM/YYYY às HH:mm
 */
export function formatDateTime(date: string | Date | null | undefined): string {
  if (!date) return '-';
  return formatDate(date, "dd/MM/yyyy 'às' HH:mm");
}

/**
 * Formata apenas horário: HH:mm
 */
export function formatTime(date: string | Date | null | undefined): string {
  if (!date) return '--:--';
  return formatDate(date, 'HH:mm');
}

/**
 * Formata número de telefone ou WhatsApp brasileiro: (11) 98765-4321
 */
export function formatPhoneNumber(phone: string | null | undefined): string {
  if (!phone) return '-';
  const clean = phone.replace(/\D/g, '');
  if (clean.length === 11) {
    return `(${clean.slice(0, 2)}) ${clean.slice(2, 7)}-${clean.slice(7)}`;
  }
  if (clean.length === 10) {
    return `(${clean.slice(0, 2)}) ${clean.slice(2, 6)}-${clean.slice(6)}`;
  }
  if (clean.length === 13 && clean.startsWith('55')) {
    const sub = clean.slice(2);
    return `(${sub.slice(0, 2)}) ${sub.slice(2, 7)}-${sub.slice(7)}`;
  }
  return phone;
}

/**
 * Converte qualquer formato de telefone para link direto do WhatsApp (wa.me)
 */
export function getWhatsAppLink(phone: string, text?: string): string {
  const clean = phone.replace(/\D/g, '');
  const fullNumber = clean.startsWith('55') ? clean : `55${clean}`;
  const encodedText = text ? `?text=${encodeURIComponent(text)}` : '';
  return `https://wa.me/${fullNumber}${encodedText}`;
}

/**
 * Formata duração em minutos para texto legível.
 * Exemplo: 120 -> "2h", 90 -> "1h 30m"
 */
export function formatDuration(minutes: number): string {
  if (!minutes || minutes <= 0) return '0 min';
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (hours > 0 && remainingMinutes > 0) {
    return `${hours}h ${remainingMinutes}min`;
  }
  if (hours > 0) {
    return `${hours}h`;
  }
  return `${remainingMinutes}min`;
}
