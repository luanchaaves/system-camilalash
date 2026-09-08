// ========================================================================
// SISTEMA DE GESTÃO — CAMILA RODRIGUES BEAUTY STUDIO
// Unit Tests: conflictDetector.test.ts
// ========================================================================

import { describe, it, expect } from 'vitest';
import { checkAppointmentConflict } from '../src/utils/conflictDetector';
import { Appointment } from '../src/types';

describe('Conflict Detector Algorithm', () => {
  const existingAppointments: Appointment[] = [
    {
      id: 'app_1',
      user_id: 'usr_camila_01',
      client_id: 'client_1',
      service_id: 'srv_1',
      appointment_type: 'application',
      start_time: '2026-09-08T09:00:00.000Z',
      end_time: '2026-09-08T11:00:00.000Z',
      duration_minutes: 120,
      total_amount: 120,
      deposit_amount: 0,
      remaining_amount: 120,
      payment_status: 'fully_paid',
      status: 'confirmed',
      created_at: '2026-09-08T00:00:00.000Z',
      updated_at: '2026-09-08T00:00:00.000Z',
    },
    {
      id: 'app_2',
      user_id: 'usr_camila_01',
      client_id: 'client_2',
      service_id: 'srv_2',
      appointment_type: 'maintenance',
      start_time: '2026-09-08T14:00:00.000Z',
      end_time: '2026-09-08T15:30:00.000Z',
      duration_minutes: 90,
      total_amount: 80,
      deposit_amount: 0,
      remaining_amount: 80,
      payment_status: 'pending',
      status: 'cancelled', // Cancelado não deve gerar conflito!
      created_at: '2026-09-08T00:00:00.000Z',
      updated_at: '2026-09-08T00:00:00.000Z',
    },
  ];

  it('detecta sobreposição direta no mesmo horário', () => {
    const result = checkAppointmentConflict(
      '2026-09-08T09:30:00.000Z',
      '2026-09-08T10:30:00.000Z',
      existingAppointments
    );

    expect(result.hasConflict).toBe(true);
    expect(result.conflictingAppointment?.id).toBe('app_1');
  });

  it('permite agendamento sem sobreposição (antes do horário)', () => {
    const result = checkAppointmentConflict(
      '2026-09-08T07:00:00.000Z',
      '2026-09-08T09:00:00.000Z',
      existingAppointments
    );

    expect(result.hasConflict).toBe(false);
  });

  it('permite agendamento imediatamente após o término', () => {
    const result = checkAppointmentConflict(
      '2026-09-08T11:00:00.000Z',
      '2026-09-08T13:00:00.000Z',
      existingAppointments
    );

    expect(result.hasConflict).toBe(false);
  });

  it('ignora agendamentos cancelados', () => {
    const result = checkAppointmentConflict(
      '2026-09-08T14:00:00.000Z',
      '2026-09-08T15:30:00.000Z',
      existingAppointments
    );

    expect(result.hasConflict).toBe(false);
  });

  it('ignora o próprio agendamento ao editar', () => {
    const result = checkAppointmentConflict(
      '2026-09-08T09:00:00.000Z',
      '2026-09-08T11:00:00.000Z',
      existingAppointments,
      'app_1' // Mesmo ID sendo editado
    );

    expect(result.hasConflict).toBe(false);
  });
});
