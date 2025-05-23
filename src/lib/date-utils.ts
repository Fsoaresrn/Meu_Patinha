
import { 
  format as formatFn, 
  parse as parseFn, 
  isValid as isValidFn,
  addMonths as addMonthsFn,
  addYears as addYearsFn,
  differenceInYears as differenceInYearsFn,
  differenceInMonths as differenceInMonthsFn,
  differenceInDays as differenceInDaysFn,
  isDate as isDateFn,
} from 'date-fns';
import { ptBR } from 'date-fns/locale';

const defaultLocale = ptBR;

export function formatDate(date: Date | number | string, formatStr: string = 'P'): string {
  try {
    let dateObj: Date;
    if (typeof date === 'string') {
      // Attempt to parse common formats if it's a string that might not be ISO
      dateObj = parseDateSafe(date) || new Date(date);
    } else {
      dateObj = new Date(date);
    }
    
    if (!isValidFn(dateObj)) {
      return String(date); // fallback for invalid dates
    }
    return formatFn(dateObj, formatStr, { locale: defaultLocale });
  } catch (e) {
    console.error("Error formatting date:", e);
    return String(date); // fallback
  }
}

export function parseDate(dateString: string, formatString: string, referenceDate: Date = new Date()): Date {
  return parseFn(dateString, formatString, referenceDate, { locale: defaultLocale });
}

export function parseDateSafe(dateString: string | undefined | null): Date | null {
  if (!dateString) return null;

  // Try "dd/MM/yyyy" first
  let parsed = parseFn(dateString, "dd/MM/yyyy", new Date(), { locale: defaultLocale });
  if (isValidFn(parsed)) return parsed;

  // Try "yyyy-MM-dd"
  parsed = parseFn(dateString, "yyyy-MM-dd", new Date(), { locale: defaultLocale });
  if (isValidFn(parsed)) return parsed;
  
  // Try ISO date string
  parsed = new Date(dateString);
  if (isValidFn(parsed)) return parsed;

  return null;
}


export function isValidDate(date: any): boolean {
  return isDateFn(date) && isValidFn(date);
}

export function formatDateToBrasil(date: Date | number | string | undefined | null): string {
  if (date === null || date === undefined) return "";
  const parsed = typeof date === 'string' ? parseDateSafe(date) : new Date(date);
  if (parsed && isValidDate(parsed)) {
    return formatDate(parsed, 'dd/MM/yyyy');
  }
  return typeof date === 'string' ? date : ""; // fallback
}

export function formatDateTimeToBrasil(date: Date | number | string | undefined | null): string {
  if (date === null || date === undefined) return "";
  const parsed = typeof date === 'string' ? parseDateSafe(date) : new Date(date);
   if (parsed && isValidDate(parsed)) {
    return formatDate(parsed, 'dd/MM/yyyy HH:mm');
  }
  return typeof date === 'string' ? date : "";
}


export function calculateAge(birthDate: Date | string): { years: number; months: number; display: string } {
  const birth = typeof birthDate === 'string' ? parseDateSafe(birthDate) : birthDate;
  if (!birth || !isValidDate(birth)) {
    return { years: 0, months: 0, display: "Idade desconhecida" };
  }

  const today = new Date();
  let years = differenceInYearsFn(today, birth);
  let months = differenceInMonthsFn(today, addYearsFn(birth, years));

  if (months < 0) { // Should not happen if logic is correct, but as a safeguard
    years--;
    months += 12;
  }
  
  let display = "";
  if (years > 0) {
    display += `${years} ano${years > 1 ? 's' : ''}`;
  }
  if (months > 0) {
    if (display.length > 0) display += " e ";
    display += `${months} mes${months > 1 ? 'es' : ''}`;
  }
  if (display.length === 0) { // Less than a month old
     const days = differenceInDaysFn(today, birth);
     display = `${days} dia${days > 1 ? 's' : ''}`;
  }

  return { years, months, display: display || "Recém-nascido" };
}

export function addMonths(date: Date | number, amount: number): Date {
  return addMonthsFn(date, amount);
}

export function addYears(date: Date | number, amount: number): Date {
  return addYearsFn(date, amount);
}
