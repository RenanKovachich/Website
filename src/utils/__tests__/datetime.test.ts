import { describe, it, expect } from 'vitest';
import {
  toZoned,
  overlaps,
  clampToBusinessHours,
  formatDateBR,
  isPast,
  isFuture,
  addDays,
  addHours,
} from '../datetime';

describe('datetime utils', () => {
  describe('toZoned', () => {
    it('deve converter data para fuso horário UTC', () => {
      const date = new Date('2024-01-15T10:00:00Z');
      const result = toZoned(date, 'UTC');
      expect(result).toEqual(date);
    });

    it('deve converter data para fuso horário de São Paulo', () => {
      const date = new Date('2024-01-15T10:00:00Z');
      const result = toZoned(date, 'America/Sao_Paulo');
      expect(result).toBeInstanceOf(Date);
    });

    it('deve aceitar string como entrada', () => {
      const result = toZoned('2024-01-15T10:00:00Z', 'America/Sao_Paulo');
      expect(result).toBeInstanceOf(Date);
    });

    it('deve aceitar timestamp como entrada', () => {
      const timestamp = Date.now();
      const result = toZoned(timestamp, 'America/Sao_Paulo');
      expect(result).toBeInstanceOf(Date);
    });
  });

  describe('overlaps', () => {
    it('deve detectar sobreposição de intervalos', () => {
      const result = overlaps(
        '2024-01-15T10:00:00Z',
        '2024-01-15T12:00:00Z',
        '2024-01-15T11:00:00Z',
        '2024-01-15T13:00:00Z'
      );
      expect(result).toBe(true);
    });

    it('deve detectar quando não há sobreposição', () => {
      const result = overlaps(
        '2024-01-15T10:00:00Z',
        '2024-01-15T11:00:00Z',
        '2024-01-15T12:00:00Z',
        '2024-01-15T13:00:00Z'
      );
      expect(result).toBe(false);
    });

    it('deve detectar sobreposição quando um intervalo contém o outro', () => {
      const result = overlaps(
        '2024-01-15T09:00:00Z',
        '2024-01-15T15:00:00Z',
        '2024-01-15T10:00:00Z',
        '2024-01-15T12:00:00Z'
      );
      expect(result).toBe(true);
    });

    it('deve aceitar objetos Date como entrada', () => {
      const start1 = new Date('2024-01-15T10:00:00Z');
      const end1 = new Date('2024-01-15T12:00:00Z');
      const start2 = new Date('2024-01-15T11:00:00Z');
      const end2 = new Date('2024-01-15T13:00:00Z');
      
      const result = overlaps(start1, end1, start2, end2);
      expect(result).toBe(true);
    });
  });

  describe('clampToBusinessHours', () => {
    it('deve ajustar data antes do horário comercial', () => {
      const date = new Date('2024-01-15T06:00:00');
      const result = clampToBusinessHours(date, '08:00', '20:00');
      
      expect(result.getHours()).toBe(8);
      expect(result.getMinutes()).toBe(0);
    });

    it('deve ajustar data depois do horário comercial', () => {
      const date = new Date('2024-01-15T22:00:00');
      const result = clampToBusinessHours(date, '08:00', '20:00');
      
      expect(result.getHours()).toBe(20);
      expect(result.getMinutes()).toBe(0);
    });

    it('deve manter data dentro do horário comercial', () => {
      const date = new Date('2024-01-15T14:00:00');
      const result = clampToBusinessHours(date, '08:00', '20:00');
      
      expect(result).toEqual(date);
    });

    it('deve aceitar string como entrada', () => {
      const result = clampToBusinessHours('2024-01-15T06:00:00', '09:00', '18:00');
      expect(result.getHours()).toBe(9);
    });
  });

  describe('formatDateBR', () => {
    it('deve formatar data em português brasileiro', () => {
      const date = new Date('2024-01-15T10:30:00Z');
      const result = formatDateBR(date);
      
      expect(result).toMatch(/\d{2}\/\d{2}\/\d{4}/);
    });

    it('deve incluir horário quando solicitado', () => {
      const date = new Date('2024-01-15T10:30:00Z');
      const result = formatDateBR(date, true);
      
      expect(result).toMatch(/\d{2}\/\d{2}\/\d{4}/);
    });

    it('deve aceitar string como entrada', () => {
      const result = formatDateBR('2024-01-15T10:30:00Z');
      expect(result).toMatch(/\d{2}\/\d{2}\/\d{4}/);
    });
  });

  describe('isPast', () => {
    it('deve detectar data no passado', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      expect(isPast(yesterday)).toBe(true);
    });

    it('deve detectar que data futura não é passado', () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      expect(isPast(tomorrow)).toBe(false);
    });

    it('deve aceitar string como entrada', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      expect(isPast(yesterday.toISOString())).toBe(true);
    });
  });

  describe('isFuture', () => {
    it('deve detectar data no futuro', () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      expect(isFuture(tomorrow)).toBe(true);
    });

    it('deve detectar que data passada não é futuro', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      expect(isFuture(yesterday)).toBe(false);
    });
  });

  describe('addDays', () => {
    it('deve adicionar dias a uma data', () => {
      const date = new Date('2024-01-15T10:00:00Z');
      const result = addDays(date, 5);
      
      expect(result.getDate()).toBe(20);
    });

    it('deve subtrair dias quando número é negativo', () => {
      const date = new Date('2024-01-15T10:00:00Z');
      const result = addDays(date, -3);
      
      expect(result.getDate()).toBe(12);
    });

    it('deve aceitar string como entrada', () => {
      const result = addDays('2024-01-15T10:00:00Z', 7);
      expect(result.getDate()).toBe(22);
    });
  });

  describe('addHours', () => {
    it('deve adicionar horas a uma data', () => {
      const date = new Date('2024-01-15T10:00:00Z');
      const result = addHours(date, 3);
      
      // Verifica se a diferença é de 3 horas (em UTC)
      const expectedTime = date.getTime() + (3 * 60 * 60 * 1000);
      expect(result.getTime()).toBe(expectedTime);
    });

    it('deve subtrair horas quando número é negativo', () => {
      const date = new Date('2024-01-15T10:00:00Z');
      const result = addHours(date, -2);
      
      // Verifica se a diferença é de -2 horas (em UTC)
      const expectedTime = date.getTime() + (-2 * 60 * 60 * 1000);
      expect(result.getTime()).toBe(expectedTime);
    });

    it('deve aceitar string como entrada', () => {
      const result = addHours('2024-01-15T10:00:00Z', 1);
      const originalDate = new Date('2024-01-15T10:00:00Z');
      const expectedTime = originalDate.getTime() + (1 * 60 * 60 * 1000);
      expect(result.getTime()).toBe(expectedTime);
    });
  });
});
