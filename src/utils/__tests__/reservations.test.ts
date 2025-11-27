import { describe, it, expect } from 'vitest';
import {
  hasConflict,
  isWithinBusinessHours,
  isValidReservation,
  getReservationDurationMinutes,
  isActiveReservation,
  filterActiveReservations,
  groupReservationsBySpace,
  isSpaceAvailable,
  type ExistingReservation,
} from '../reservations';

describe('reservations utils', () => {
  describe('hasConflict', () => {
    const existingReservations: ExistingReservation[] = [
      {
        id: '1',
        start: '2024-01-15T10:00:00Z',
        end: '2024-01-15T12:00:00Z',
        spaceId: 'space1',
      },
      {
        id: '2',
        start: '2024-01-15T14:00:00Z',
        end: '2024-01-15T16:00:00Z',
        spaceId: 'space1',
      },
    ];

    it('deve detectar conflito com reserva existente', () => {
      const result = hasConflict(
        existingReservations,
        '2024-01-15T11:00:00Z',
        '2024-01-15T13:00:00Z'
      );
      expect(result).toBe(true);
    });

    it('deve não detectar conflito quando não há sobreposição', () => {
      const result = hasConflict(
        existingReservations,
        '2024-01-15T13:00:00Z',
        '2024-01-15T13:30:00Z'
      );
      expect(result).toBe(false);
    });

    it('deve excluir reserva específica da verificação', () => {
      const result = hasConflict(
        existingReservations,
        '2024-01-15T10:00:00Z',
        '2024-01-15T12:00:00Z',
        '1'
      );
      expect(result).toBe(false);
    });

    it('deve retornar false para lista vazia', () => {
      const result = hasConflict(
        [],
        '2024-01-15T10:00:00Z',
        '2024-01-15T12:00:00Z'
      );
      expect(result).toBe(false);
    });
  });

  describe('isWithinBusinessHours', () => {
    it('deve detectar que reserva está dentro do horário comercial', () => {
      const result = isWithinBusinessHours(
        '2024-01-15T10:00:00',
        '2024-01-15T12:00:00',
        '08:00',
        '20:00'
      );
      expect(result).toBe(true);
    });

    it('deve detectar que reserva está fora do horário comercial (muito cedo)', () => {
      const result = isWithinBusinessHours(
        '2024-01-15T06:00:00',
        '2024-01-15T08:00:00',
        '08:00',
        '20:00'
      );
      expect(result).toBe(false);
    });

    it('deve detectar que reserva está fora do horário comercial (muito tarde)', () => {
      const result = isWithinBusinessHours(
        '2024-01-15T20:00:00',
        '2024-01-15T22:00:00',
        '08:00',
        '20:00'
      );
      expect(result).toBe(false);
    });

    it('deve usar horários padrão quando não especificados', () => {
      const result = isWithinBusinessHours(
        '2024-01-15T10:00:00',
        '2024-01-15T12:00:00'
      );
      expect(result).toBe(true);
    });
  });

  describe('isValidReservation', () => {
    it('deve validar reserva válida', () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const start = tomorrow.toISOString();
      
      const end = new Date(tomorrow);
      end.setHours(tomorrow.getHours() + 2);
      const endStr = end.toISOString();

      const result = isValidReservation(start, endStr);
      expect(result).toBe(true);
    });

    it('deve rejeitar reserva no passado', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const start = yesterday.toISOString();
      
      const end = new Date(yesterday);
      end.setHours(yesterday.getHours() + 2);
      const endStr = end.toISOString();

      const result = isValidReservation(start, endStr);
      expect(result).toBe(false);
    });

    it('deve rejeitar reserva com data de fim anterior à data de início', () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const start = tomorrow.toISOString();
      
      const end = new Date(tomorrow);
      end.setHours(tomorrow.getHours() - 1);
      const endStr = end.toISOString();

      const result = isValidReservation(start, endStr);
      expect(result).toBe(false);
    });

    it('deve rejeitar reserva com duração menor que o mínimo', () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const start = tomorrow.toISOString();
      
      const end = new Date(tomorrow);
      end.setMinutes(tomorrow.getMinutes() + 15); // 15 minutos
      const endStr = end.toISOString();

      const result = isValidReservation(start, endStr, 30);
      expect(result).toBe(false);
    });

    it('deve aceitar reserva com duração mínima personalizada', () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const start = tomorrow.toISOString();
      
      const end = new Date(tomorrow);
      end.setMinutes(tomorrow.getMinutes() + 15);
      const endStr = end.toISOString();

      const result = isValidReservation(start, endStr, 10);
      expect(result).toBe(true);
    });
  });

  describe('getReservationDurationMinutes', () => {
    it('deve calcular duração corretamente', () => {
      const start = '2024-01-15T10:00:00Z';
      const end = '2024-01-15T12:00:00Z';
      
      const result = getReservationDurationMinutes(start, end);
      expect(result).toBe(120);
    });

    it('deve calcular duração de 30 minutos', () => {
      const start = '2024-01-15T10:00:00Z';
      const end = '2024-01-15T10:30:00Z';
      
      const result = getReservationDurationMinutes(start, end);
      expect(result).toBe(30);
    });
  });

  describe('isActiveReservation', () => {
    it('deve detectar reserva pendente como ativa', () => {
      expect(isActiveReservation('pendente')).toBe(true);
    });

    it('deve detectar reserva confirmada como ativa', () => {
      expect(isActiveReservation('confirmada')).toBe(true);
    });

    it('deve detectar reserva cancelada como inativa', () => {
      expect(isActiveReservation('cancelada')).toBe(false);
    });
  });

  describe('filterActiveReservations', () => {
    const reservations = [
      { id: '1', status: 'pendente', spaceId: 'space1' },
      { id: '2', status: 'confirmada', spaceId: 'space1' },
      { id: '3', status: 'cancelada', spaceId: 'space1' },
    ];

    it('deve filtrar apenas reservas ativas', () => {
      const result = filterActiveReservations(reservations);
      expect(result).toHaveLength(2);
      expect(result.map(r => r.id)).toEqual(['1', '2']);
    });

    it('deve retornar array vazio quando não há reservas ativas', () => {
      const inactiveReservations = [
        { id: '1', status: 'cancelada', spaceId: 'space1' },
        { id: '2', status: 'cancelada', spaceId: 'space1' },
      ];
      
      const result = filterActiveReservations(inactiveReservations);
      expect(result).toHaveLength(0);
    });
  });

  describe('groupReservationsBySpace', () => {
    const reservations = [
      { id: '1', spaceId: 'space1', status: 'pendente' },
      { id: '2', spaceId: 'space1', status: 'confirmada' },
      { id: '3', spaceId: 'space2', status: 'pendente' },
    ];

    it('deve agrupar reservas por espaço', () => {
      const result = groupReservationsBySpace(reservations);
      
      expect(result.space1).toHaveLength(2);
      expect(result.space2).toHaveLength(1);
      expect(result.space1?.map(r => r.id)).toEqual(['1', '2']);
      expect(result.space2?.map(r => r.id)).toEqual(['3']);
    });

    it('deve retornar objeto vazio para array vazio', () => {
      const result = groupReservationsBySpace([]);
      expect(result).toEqual({});
    });
  });

  describe('isSpaceAvailable', () => {
    const existingReservations: ExistingReservation[] = [
      {
        id: '1',
        start: '2024-01-15T10:00:00Z',
        end: '2024-01-15T12:00:00Z',
        spaceId: 'space1',
      },
      {
        id: '2',
        start: '2024-01-15T14:00:00Z',
        end: '2024-01-15T16:00:00Z',
        spaceId: 'space2',
      },
    ];

    it('deve detectar que espaço está disponível', () => {
      const result = isSpaceAvailable(
        'space1',
        '2024-01-15T13:00:00Z',
        '2024-01-15T13:30:00Z',
        existingReservations
      );
      expect(result).toBe(true);
    });

    it('deve detectar que espaço não está disponível', () => {
      const result = isSpaceAvailable(
        'space1',
        '2024-01-15T11:00:00Z',
        '2024-01-15T11:30:00Z',
        existingReservations
      );
      expect(result).toBe(false);
    });

    it('deve considerar apenas reservas do espaço específico', () => {
      const result = isSpaceAvailable(
        'space1',
        '2024-01-15T15:00:00Z',
        '2024-01-15T15:30:00Z',
        existingReservations
      );
      expect(result).toBe(true);
    });

    it('deve excluir reserva específica da verificação', () => {
      const result = isSpaceAvailable(
        'space1',
        '2024-01-15T10:00:00Z',
        '2024-01-15T12:00:00Z',
        existingReservations,
        '1'
      );
      expect(result).toBe(true);
    });
  });
});
