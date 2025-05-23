import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPhoneNumberForDisplay(value: string | undefined): string {
  if (!value) return "";
  const numericValue = value.replace(/\D/g, ""); // Garante que estamos trabalhando apenas com números

  if (numericValue.length === 0) return "";
  if (numericValue.length <= 5) {
    return numericValue;
  }
  // Aplica a máscara XXXXX-XXX para 8 dígitos
  if (numericValue.length <= 8) {
    return `${numericValue.slice(0, 5)}-${numericValue.slice(5)}`;
  }
  // Se tiver mais de 8 dígitos, trunca para o formato XXXXX-XXX
  return `${numericValue.slice(0, 5)}-${numericValue.slice(5, 8)}`;
}
