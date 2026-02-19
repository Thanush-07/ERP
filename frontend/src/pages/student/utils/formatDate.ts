import { format, parseISO, isValid } from 'date-fns';

export function formatDate(date: string | Date | null | undefined, formatStr: string = 'MMM dd, yyyy'): string {
  if (!date) return 'N/A';
  
  try {
    const parsedDate = typeof date === 'string' ? parseISO(date) : date;
    
    if (!isValid(parsedDate)) {
      return 'Invalid Date';
    }
    
    return format(parsedDate, formatStr);
  } catch {
    return 'Invalid Date';
  }
}

export function formatDateTime(date: string | Date | null | undefined): string {
  return formatDate(date, 'MMM dd, yyyy HH:mm');
}

export function formatShortDate(date: string | Date | null | undefined): string {
  return formatDate(date, 'dd/MM/yyyy');
}

export function formatMonthYear(date: string | Date | null | undefined): string {
  return formatDate(date, 'MMMM yyyy');
}
