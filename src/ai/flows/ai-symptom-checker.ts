
'use server';

/**
 * @fileOverview Verificador de sintomas para pets, com tecnologia de IA.
 *
 * - checkSymptoms - Uma função que recebe detalhes do pet e sintomas como entrada e retorna diagnósticos potenciais e sugestões de cuidados.
 * - CheckSymptomsInput - O tipo de entrada para a função checkSymptoms.
 * - CheckSymptomsOutput - O tipo de retorno para a função checkSymptoms.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CheckSymptomsInputSchema = z.object({
  petName: z.string().describe('O nome do pet.'),
  species: z.enum(['Cão', 'Gato']).describe('A espécie do pet (Cão ou Gato).'),
  breed: z.string().describe('A raça do pet.'),
  age: z.number().describe('A idade do pet em anos.'),
  symptoms: z.string().describe('Uma descrição detalhada dos sintomas do pet.'),
  additionalSymptoms: z
    .array(z.string())
    .optional()
    .describe('Opcional: Sintomas adicionais a serem considerados.'),
});

export type CheckSymptomsInput = z.infer<typeof CheckSymptomsInputSchema>;

const CheckSymptomsOutputSchema = z.object({
  potentialDiagnoses: z
    .string()
    .describe('Uma lista de diagnósticos potenciais com base nos sintomas fornecidos, em Português do Brasil.'),
  immediateCareSuggestions: z
    .string()
    .describe('Sugestões para cuidados imediatos com base nos diagnósticos potenciais, em Português do Brasil.'),
  disclaimer: z
    .string()
    .describe(
      'Um aviso em Português do Brasil, informando que esta análise não substitui o aconselhamento veterinário profissional.'
    ),
  needsMoreInfo: z
    .boolean()
    .optional()
    .describe('Indica se mais informações são necessárias para um diagnóstico mais preciso.'),
  suggestedFollowUpSymptoms: z
    .array(z.string())
    .optional()
    .describe('Sintomas de acompanhamento sugeridos para perguntar ao usuário, em Português do Brasil, caso mais informações sejam necessárias.'),
});

export type CheckSymptomsOutput = z.infer<typeof CheckSymptomsOutputSchema>;

export async function checkSymptoms(input: CheckSymptomsInput): Promise<CheckSymptomsOutput> {
  return checkSymptomsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'checkSymptomsPrompt',
  input: {schema: CheckSymptomsInputSchema},
  output: {schema: CheckSymptomsOutputSchema},
  prompt: `Você é um assistente veterinário de IA ajudando tutores de pets a entenderem os sintomas de seus animais.
  **IMPORTANTE: Todas as suas respostas, incluindo diagnósticos, sugestões e avisos, DEVEM estar em Português do Brasil.**

  Com base nas informações fornecidas, apresente diagnósticos potenciais, sugira passos para cuidados imediatos e forneça um aviso legal.

  Nome do Pet: {{{petName}}}
  Espécie: {{{species}}}
  Raça: {{{breed}}}
  Idade: {{{age}}}
  Sintomas: {{{symptoms}}}
  {{#if additionalSymptoms}}
  Sintomas Adicionais:
  {{#each additionalSymptoms}}
  - {{{this}}}
  {{/each}}
  {{/if}}

  Diagnósticos Potenciais: (Responda em Português do Brasil. Liste as condições potenciais, separadas por vírgulas)
  Sugestões de Cuidados Imediatos: (Responda em Português do Brasil. Forneça passos acionáveis, separados por vírgulas)
  Aviso Legal: (Responda em Português do Brasil. Aviso padrão sobre não substituir o conselho veterinário profissional)

  Se os sintomas fornecidos forem insuficientes para um diagnóstico, defina needsMoreInfo como true e sugira sintomas de acompanhamento para perguntar. **Todas essas sugestões também devem estar em Português do Brasil.**
`,
});

const checkSymptomsFlow = ai.defineFlow(
  {
    name: 'checkSymptomsFlow',
    inputSchema: CheckSymptomsInputSchema,
    outputSchema: CheckSymptomsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
