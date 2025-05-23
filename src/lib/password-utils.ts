
"use client";

export interface PasswordStrengthResult {
  score: 0 | 1 | 2 | 3 | 4;
  label: string;
  colorClass: string;
}

export function calculatePasswordStrength(password: string): PasswordStrengthResult {
  if (!password) return { score: 0, label: "", colorClass: "" };

  const len = password.length;

  if (len === 0) return { score: 0, label: "", colorClass: "" };
  if (len < 6) return { score: 0, label: "Muito curta", colorClass: "text-destructive" };

  let score = 1; // Base score for length >= 6 (Fraca)

  const hasLowerCase = /[a-z]/.test(password);
  const hasUpperCase = /[A-Z]/.test(password);
  const hasNumbers = /[0-9]/.test(password);
  const hasSpecialChars = /[^a-zA-Z0-9]/.test(password);

  let typesCount = 0;
  if (hasLowerCase) typesCount++;
  if (hasUpperCase) typesCount++;
  if (hasNumbers) typesCount++;
  if (hasSpecialChars) typesCount++;

  if (typesCount >= 2) { // Pelo menos dois tipos de caracteres
    score = 2; // Média
  }
  if (typesCount >= 3 && len >= 8) { // Pelo menos três tipos e tamanho bom
    score = 3; // Forte
  }
  if (typesCount === 4 && len >= 8) { // Todos os quatro tipos e tamanho bom
    score = 4; // Muito Forte
  }
  
  // Reforça a pontuação se o comprimento for muito bom, mas os tipos não são muitos
  if (len >= 10 && typesCount === 2) score = Math.max(score, 3); // Forte
  if (len >= 12 && typesCount === 3) score = Math.max(score, 4); // Muito Forte


  switch (score) {
    case 1: return { score, label: "Fraca", colorClass: "text-destructive" };
    case 2: return { score, label: "Média", colorClass: "text-orange-500" };
    case 3: return { score, label: "Forte", colorClass: "text-green-500" };
    case 4: return { score, label: "Muito Forte", colorClass: "text-green-600" };
    default: // Caso score seja 0 por algum motivo não coberto ou se len < 6 já foi tratado
      return { score: 0, label: "Muito curta", colorClass: "text-destructive" };
  }
}
