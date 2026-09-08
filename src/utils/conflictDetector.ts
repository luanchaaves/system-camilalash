// ========================================================================
// SISTEMA DE GESTÃO — CAMILA RODRIGUES BEAUTY STUDIO
// Utilities: Conflict Detector (Algoritmo de Conflito de Horários)
// ========================================================================

import { parseISO, isBefore, isAfter, isEqual } from 'date-fns';
import { Appointment } from '../types';

export interface ConflictCheckResult {
  hasConflict: boolean;
  conflictingAppointment?: Appointment;
  message?: string;
}

/**
 * Verifica se dois intervalos de data/hora se sobrepõem.
 * Considera sobreposição se: StartA < EndB AND EndA > StartB
 */
export function doIntervalsOverlap(
  startA: Date,
  endA: Date,
  startB: Date,
  endB: Date
): boolean {
  // Se A termina exatamente quando B começa ou antes, não há sobreposição
  if (isBefore(endA, startB) || isEqual(endA, startB)) {
    return false;
  }
  // Se A começa exatamente quando B termina ou depois, não há sobreposição
  if (isAfter(startA, endB) || isEqual(startA, endB)) {
    return false;
  }
  return true;
}

/**
 * Analisa a lista de agendamentos e verifica se há colisão de horários.
 * Ignora agendamentos cancelados e o próprio agendamento sendo editado.
 */
export function checkAppointmentConflict(
  newStartTime: string | Date,
  newEndTime: string | Date,
  existingAppointments: Appointment[],
  excludeAppointmentId?: string
): ConflictCheckResult {
  const targetStart = typeof newStartTime === 'string' ? parseISO(newStartTime) : newStartTime;
  const targetEnd = typeof newEndTime === 'string' ? parseISO(newEndTime) : newEndTime;

  if (isAfter(targetStart, targetEnd) || isEqual(targetStart, targetEnd)) {
    return {
      hasConflict: true,
      message: 'O horário final deve ser posterior ao horário inicial.',
    };
  }

  for (const app of existingAppointments) {
    // Ignorar o próprio agendamento na edição
    if (excludeAppointmentId && app.id === excludeAppointmentId) {
      continue;
    }

    // Ignorar agendamentos cancelados ou com falta
    if (app.status === 'cancelled') {
      continue;
    }

    const appStart = parseISO(app.start_time);
    const appEnd = parseISO(app.end_time);

    if (doIntervalsOverlap(targetStart, targetEnd, appStart, appEnd)) {
      const clientName = app.client?.full_name || 'outro cliente';
      const serviceName = app.service?.name || 'atendimento';
      
      return {
        hasConflict: true,
        conflictingAppointment: app,
        message: `Este horário possui conflito com o agendamento de ${clientName} (${serviceName}).`,
      };
    }
  }

  return {
    hasConflict: false,
  };
}
