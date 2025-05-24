
import { 
  format as formatFn, 
  parse as parseFn, 
  isValid as isValidFn,
  addMonths as addMonthsFn,
  addYears as addYearsFn,
  differenceInYears as differenceInYearsFn,
  differenceInMonths as differenceInMonthsFn,
  differenceInDays as differenceInDaysFn,
  differenceInWeeks as differenceInWeeksFn,
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


export function calculateAge(birthDateInput: Date | string | undefined | null): { years: number; months: number; days: number; totalWeeks: number; display: string } {
  const birth = typeof birthDateInput === 'string' ? parseDateSafe(birthDateInput) : birthDateInput;

  if (!birth || !isValidDate(birth)) {
    return { years: 0, months: 0, days: 0, totalWeeks: 0, display: "Idade desconhecida" };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0); // Normalizar para o início do dia
  const birthDayStart = new Date(birth.getFullYear(), birth.getMonth(), birth.getDate());


  if (birthDayStart.getTime() === today.getTime()) {
    return { years: 0, months: 0, days: 0, totalWeeks: 0, display: "Recém-nascido" };
  }
  if (birthDayStart > today) {
    return { years: 0, months: 0, days: 0, totalWeeks: 0, display: "Data futura" };
  }

  let years = differenceInYearsFn(today, birthDayStart);
  const dateAfterYears = addYearsFn(birthDayStart, years);
  let months = differenceInMonthsFn(today, dateAfterYears);
  const dateAfterMonths = addMonthsFn(dateAfterYears, months);
  let days = differenceInDaysFn(today, dateAfterMonths);
  const totalWeeks = differenceInWeeksFn(today, birthDayStart);


  // Ajustes finos para meses e dias
  if (days < 0) { // Se o dia do mês atual é menor que o dia do nascimento
    months--; // Reduz um mês
    const monthBefore = addMonthsFn(dateAfterMonths, -1); // Pega o mês anterior ao "dateAfterMonths"
    days = differenceInDaysFn(today, monthBefore); // Calcula os dias a partir do início do mês anterior correto
  }
  if (months < 0) { // Se o mês ajustado ficou negativo
    years--;
    months += 12;
  }

  let displayParts: string[] = [];
  if (years > 0) {
    displayParts.push(`${years} ano${years > 1 ? 's' : ''}`);
  }
  if (months > 0) {
    displayParts.push(`${months} ${months > 1 ? 'meses' : 'mês'}`);
  }
  if (days > 0 && years === 0) { // Só mostrar dias se não houver anos
    displayParts.push(`${days} dia${days > 1 ? 's' : ''}`);
  }
  
  if (displayParts.length === 0) { // Caso muito jovem, menos de 1 dia ou cálculo resultou em 0 para tudo
     if (days === 0 && months === 0 && years === 0) { // Realmente menos de 1 dia
      return { years, months, days, totalWeeks, display: "Menos de 1 dia" };
    }
    // Fallback se algo estranho acontecer e days for 0 mas não for recém-nascido
    return { years, months, days, totalWeeks, display: "Recém-nascido" }; 
  }

  return { years, months, days, totalWeeks, display: displayParts.join(', ') };
}


export function addMonths(date: Date | number, amount: number): Date {
  return addMonthsFn(date, amount);
}

export function addYears(date: Date | number, amount: number): Date {
  return addYearsFn(date, amount);
}

    