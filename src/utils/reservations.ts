import { overlaps } from './datetime';

/**
 * Interface para uma reserva existente
 */
export interface ExistingReservation {
  start: string;
  end: string;
  id?: string;
  spaceId?: string;
  userId?: string;
}

/**
 * Verifica se uma nova reserva tem conflito com reservas existentes
 * @param existing - Array de reservas existentes
 * @param candidateStart - Data/hora de início da nova reserva
 * @param candidateEnd - Data/hora de fim da nova reserva
 * @param excludeId - ID da reserva a ser excluída da verificação (para edição)
 * @returns true se há conflito
 */
export function hasConflict(
  existing: ExistingReservation[],
  candidateStart: string,
  candidateEnd: string,
  excludeId?: string
): boolean {
  // Filtra reservas existentes (exclui a reserva sendo editada se especificado)
  const relevantReservations = existing.filter(
    reservation => reservation.id !== excludeId
  );

  // Verifica se há sobreposição com alguma reserva existente
  return relevantReservations.some(reservation =>
    overlaps(
      reservation.start,
      reservation.end,
      candidateStart,
      candidateEnd
    )
  );
}

/**
 * Verifica se uma reserva está dentro do horário comercial
 * @param start - Data/hora de início
 * @param end - Data/hora de fim
 * @param businessStart - Horário de início do expediente (padrão: '08:00')
 * @param businessEnd - Horário de fim do expediente (padrão: '20:00')
 * @returns true se está dentro do horário comercial
 */
export function isWithinBusinessHours(
  start: string,
  end: string,
  businessStart: string = '08:00',
  businessEnd: string = '20:00'
): boolean {
  const startDate = new Date(start);
  const endDate = new Date(end);
  
  const [startHour, startMinute] = businessStart.split(':').map(Number);
  const [endHour, endMinute] = businessEnd.split(':').map(Number);
  
  const businessStartTime = new Date(startDate);
  businessStartTime.setHours(startHour, startMinute, 0, 0);
  
  const businessEndTime = new Date(startDate);
  businessEndTime.setHours(endHour, endMinute, 0, 0);
  
  return startDate >= businessStartTime && endDate <= businessEndTime;
}

/**
 * Verifica se uma reserva é válida (duração mínima, não no passado, etc.)
 * @param start - Data/hora de início
 * @param end - Data/hora de fim
 * @param minDurationMinutes - Duração mínima em minutos (padrão: 30)
 * @returns true se a reserva é válida
 */
export function isValidReservation(
  start: string,
  end: string,
  minDurationMinutes: number = 30
): boolean {
  const startDate = new Date(start);
  const endDate = new Date(end);
  const now = new Date();
  
  // Verifica se não está no passado
  if (startDate < now) {
    return false;
  }
  
  // Verifica se a data de fim é posterior à data de início
  if (endDate <= startDate) {
    return false;
  }
  
  // Verifica se atende à duração mínima
  const durationMinutes = (endDate.getTime() - startDate.getTime()) / (1000 * 60);
  if (durationMinutes < minDurationMinutes) {
    return false;
  }
  
  return true;
}

/**
 * Calcula a duração de uma reserva em minutos
 * @param start - Data/hora de início
 * @param end - Data/hora de fim
 * @returns Duração em minutos
 */
export function getReservationDurationMinutes(start: string, end: string): number {
  const startDate = new Date(start);
  const endDate = new Date(end);
  return (endDate.getTime() - startDate.getTime()) / (1000 * 60);
}

/**
 * Verifica se uma reserva está ativa (não cancelada)
 * @param status - Status da reserva
 * @returns true se a reserva está ativa
 */
export function isActiveReservation(status: string): boolean {
  return status === 'pendente' || status === 'confirmada';
}

/**
 * Filtra reservas ativas
 * @param reservations - Array de reservas
 * @returns Array de reservas ativas
 */
export function filterActiveReservations<T extends { status: string }>(
  reservations: T[]
): T[] {
  return reservations.filter(reservation => 
    isActiveReservation(reservation.status)
  );
}

/**
 * Agrupa reservas por espaço
 * @param reservations - Array de reservas
 * @returns Objeto com reservas agrupadas por spaceId
 */
export function groupReservationsBySpace<T extends { spaceId: string }>(
  reservations: T[]
): Record<string, T[]> {
  return reservations.reduce((groups, reservation) => {
    const spaceId = reservation.spaceId;
    if (!groups[spaceId]) {
      groups[spaceId] = [];
    }
    groups[spaceId].push(reservation);
    return groups;
  }, {} as Record<string, T[]>);
}

/**
 * Verifica se um espaço está disponível em um determinado período
 * @param spaceId - ID do espaço
 * @param start - Data/hora de início
 * @param end - Data/hora de fim
 * @param existingReservations - Reservas existentes
 * @param excludeId - ID da reserva a ser excluída da verificação
 * @returns true se o espaço está disponível
 */
export function isSpaceAvailable(
  spaceId: string,
  start: string,
  end: string,
  existingReservations: ExistingReservation[],
  excludeId?: string
): boolean {
  // Filtra reservas do espaço específico
  const spaceReservations = existingReservations.filter(
    reservation => reservation.spaceId === spaceId
  );
  
  // Verifica se há conflito
  return !hasConflict(spaceReservations, start, end, excludeId);
}
