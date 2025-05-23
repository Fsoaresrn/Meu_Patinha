
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPhoneNumberForDisplay(value: string | undefined): string {
  if (!value) return "";
  const numericValue = value.replace(/\D/g, "");

  if (numericValue.length === 0) return "";

  // Para números de 9 dígitos (celular) ou 8 dígitos (fixo)
  if (numericValue.length === 9) { // Celular: XXXXX-XXXX
    return `${numericValue.slice(0, 5)}-${numericValue.slice(5)}`;
  }
  if (numericValue.length === 8) { // Fixo: XXXX-XXXX
    return `${numericValue.slice(0, 4)}-${numericValue.slice(4)}`;
  }
  // Se não se encaixa, retorna os números como estão até o limite
  return numericValue.slice(0,9);
}


    