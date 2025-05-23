
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

const FollowUpResponseSchema = z.object({
  symptom: z.string().describe('A pergunta/sintoma de acompanhamento sugerido pela IA.'),
  response: z.enum(["Sim", "Não", "Não tenho certeza"]).describe('A resposta do usuário ao sintoma de acompanhamento.'),
});

const CheckSymptomsInputSchema = z.object({
  petName: z.string().describe('O nome do pet.'),
  species: z.enum(['Cão', 'Gato']).describe('A espécie do pet (Cão ou Gato).'),
  breed: z.string().describe('A raça do pet.'),
  age: z.number().describe('A idade do pet em anos.'),
  symptoms: z.string().describe('Uma descrição detalhada dos sintomas do pet.'),
  followUpResponses: z
    .array(FollowUpResponseSchema)
    .optional()
    .describe('Opcional: Respostas do usuário a sintomas de acompanhamento previamente sugeridos pela IA.'),
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
    .describe('Sintomas de acompanhamento sugeridos para perguntar ao usuário, em Português do Brasil, caso mais informações sejam necessárias. Devem ser perguntas claras que podem ser respondidas com "Sim", "Não" ou "Não tenho certeza".'),
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
  **IMPORTANTE: Todas as suas respostas, incluindo diagnósticos, sugestões, avisos e perguntas de acompanhamento, DEVEM estar em Português do Brasil.**

  Com base nas informações fornecidas, apresente diagnósticos potenciais, sugira passos para cuidados imediatos e forneça um aviso legal.

  Nome do Pet: {{{petName}}}
  Espécie: {{{species}}}
  Raça: {{{breed}}}
  Idade: {{{age}}}
  Sintomas Principais: {{{symptoms}}}
  {{#if followUpResponses}}
  Respostas aos sintomas de acompanhamento anteriores:
  {{#each followUpResponses}}
  - Pergunta: "{{{this.symptom}}}" Resposta do tutor: {{{this.response}}}
  {{/each}}
  {{/if}}

  Se os sintomas fornecidos (incluindo respostas de acompanhamento, se houver) ainda forem insuficientes para um diagnóstico ou se o diagnóstico for muito amplo, defina needsMoreInfo como true e sugira NOVOS sintomas de acompanhamento (PERGUNTAS claras para o usuário responder com "Sim", "Não" ou "Não tenho certeza") em Português do Brasil para refinar a análise.
  Se você tiver confiança suficiente para um diagnóstico preliminar com base nas informações atuais, defina needsMoreInfo como false.

  Diagnósticos Potenciais: (Responda em Português do Brasil. Liste as condições potenciais, separadas por vírgulas)
  Sugestões de Cuidados Imediatos: (Responda em Português do Brasil. Forneça passos acionáveis, separados por vírgulas)
  Aviso Legal: (Responda em Português do Brasil. Aviso padrão sobre não substituir o conselho veterinário profissional)
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
