/**
 * Utilitários para manipulação de datas e horários
 */

/**
 * Converte uma data para o fuso horário especificado
 * @param dateLike - Data em formato string, Date ou timestamp
 * @param tz - Fuso horário (padrão: 'America/Sao_Paulo')
 * @returns Data formatada no fuso horário especificado
 */
export function toZoned(dateLike: string | Date | number, tz: string = 'America/Sao_Paulo'): Date {
  const date = new Date(dateLike);
  
  // Se o fuso horário for UTC, retorna a data como está
  if (tz === 'UTC') {
    return date;
  }
  
  // Para outros fusos horários, ajusta baseado na diferença
  // Esta é uma implementação simplificada - em produção use uma biblioteca como date-fns-tz
  const offset = getTimezoneOffset(tz);
  return new Date(date.getTime() + (offset * 60 * 1000));
}

/**
 * Obtém o offset do fuso horário em minutos
 * @param tz - Fuso horário
 * @returns Offset em minutos
 */
function getTimezoneOffset(tz: string): number {
  const offsets: Record<string, number> = {
    'America/Sao_Paulo': -180, // UTC-3
    'America/New_York': 300,   // UTC-5
    'Europe/London': 0,        // UTC+0
    'Asia/Tokyo': -540,        // UTC+9
  };
  
  return offsets[tz] || 0;
}

/**
 * Verifica se dois intervalos de tempo se sobrepõem
 * @param aStart - Início do primeiro intervalo
 * @param aEnd - Fim do primeiro intervalo
 * @param bStart - Início do segundo intervalo
 * @param bEnd - Fim do segundo intervalo
 * @returns true se os intervalos se sobrepõem
 */
export function overlaps(
  aStart: string | Date,
  aEnd: string | Date,
  bStart: string | Date,
  bEnd: string | Date
): boolean {
  const startA = new Date(aStart).getTime();
  const endA = new Date(aEnd).getTime();
  const startB = new Date(bStart).getTime();
  const endB = new Date(bEnd).getTime();
  
  // Verifica se os intervalos se sobrepõem
  // Dois intervalos se sobrepõem se: startA < endB && startB < endA
  return startA < endB && startB < endA;
}

/**
 * Ajusta uma data para ficar dentro do horário comercial
 * @param date - Data a ser ajustada
 * @param start - Horário de início do expediente (formato HH:MM)
 * @param end - Horário de fim do expediente (formato HH:MM)
 * @returns Data ajustada para o horário comercial
 */
export function clampToBusinessHours(
  date: string | Date,
  start: string = '08:00',
  end: string = '20:00'
): Date {
  const targetDate = new Date(date);
  const [startHour, startMinute] = start.split(':').map(Number);
  const [endHour, endMinute] = end.split(':').map(Number);
  
  const startTime = new Date(targetDate);
  startTime.setHours(startHour, startMinute, 0, 0);
  
  const endTime = new Date(targetDate);
  endTime.setHours(endHour, endMinute, 0, 0);
  
  // Se a data está antes do horário de início, ajusta para o início
  if (targetDate < startTime) {
    return startTime;
  }
  
  // Se a data está depois do horário de fim, ajusta para o fim
  if (targetDate > endTime) {
    return endTime;
  }
  
  // Se está dentro do horário comercial, retorna como está
  return targetDate;
}

/**
 * Formata uma data para exibição em português brasileiro
 * @param date - Data a ser formatada
 * @param includeTime - Se deve incluir o horário
 * @returns Data formatada
 */
export function formatDateBR(date: string | Date, includeTime: boolean = false): string {
  const targetDate = new Date(date);
  
  const options: Intl.DateTimeFormatOptions = {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: 'America/Sao_Paulo',
  };
  
  if (includeTime) {
    options.hour = '2-digit';
    options.minute = '2-digit';
  }
  
  return targetDate.toLocaleDateString('pt-BR', options);
}

/**
 * Verifica se uma data está no passado
 * @param date - Data a ser verificada
 * @returns true se a data está no passado
 */
export function isPast(date: string | Date): boolean {
  return new Date(date) < new Date();
}

/**
 * Verifica se uma data está no futuro
 * @param date - Data a ser verificada
 * @returns true se a data está no futuro
 */
export function isFuture(date: string | Date): boolean {
  return new Date(date) > new Date();
}

/**
 * Adiciona dias a uma data
 * @param date - Data base
 * @param days - Número de dias a adicionar
 * @returns Nova data
 */
export function addDays(date: string | Date, days: number): Date {
  const targetDate = new Date(date);
  targetDate.setDate(targetDate.getDate() + days);
  return targetDate;
}

/**
 * Adiciona horas a uma data
 * @param date - Data base
 * @param hours - Número de horas a adicionar
 * @returns Nova data
 */
export function addHours(date: string | Date, hours: number): Date {
  const targetDate = new Date(date);
  targetDate.setHours(targetDate.getHours() + hours);
  return targetDate;
}
