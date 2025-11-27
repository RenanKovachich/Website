import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const formatDate = (date: string | Date) => {
  const parsedDate = typeof date === 'string' ? parseISO(date) : date;
  return format(parsedDate, 'dd/MM/yyyy', { locale: ptBR });
};

export const formatDateTime = (date: string | Date) => {
  const parsedDate = typeof date === 'string' ? parseISO(date) : date;
  return format(parsedDate, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
};

export const formatTime = (date: string | Date) => {
  const parsedDate = typeof date === 'string' ? parseISO(date) : date;
  return format(parsedDate, 'HH:mm', { locale: ptBR });
};

export const isDateValid = (date: string | Date) => {
  const parsedDate = typeof date === 'string' ? parseISO(date) : date;
  return !isNaN(parsedDate.getTime());
};

export const isDateInPast = (date: string | Date) => {
  const parsedDate = typeof date === 'string' ? parseISO(date) : date;
  return parsedDate < new Date();
};

export const isDateInFuture = (date: string | Date) => {
  const parsedDate = typeof date === 'string' ? parseISO(date) : date;
  return parsedDate > new Date();
};

export const isDateBetween = (
  date: string | Date,
  startDate: string | Date,
  endDate: string | Date
) => {
  const parsedDate = typeof date === 'string' ? parseISO(date) : date;
  const parsedStartDate = typeof startDate === 'string' ? parseISO(startDate) : startDate;
  const parsedEndDate = typeof endDate === 'string' ? parseISO(endDate) : endDate;

  return parsedDate >= parsedStartDate && parsedDate <= parsedEndDate;
}; 