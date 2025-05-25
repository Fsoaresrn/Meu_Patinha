
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
  weightKm: z.number().optional().describe('O peso do pet em quilogramas. Ex: 7.5'),
  sex: z.string().optional().describe('O sexo do pet (Macho, Fêmea, Não especificado).'),
  symptoms: z.string().describe('Uma descrição detalhada dos sintomas do pet.'),
  followUpResponses: z
    .array(FollowUpResponseSchema)
    .optional()
    .describe('Opcional: Respostas do usuário a sintomas de acompanhamento previamente sugeridos pela IA.'),
  vaccineHistory: z
    .array(z.object({ 
      name: z.string().describe('Nome da vacina.'), 
      date: z.string().describe('Data da última dose (dd/MM/yyyy).') 
    }))
    .optional()
    .describe('Histórico de vacinas relevantes e recentes do pet.'),
  dewormingHistory: z
    .array(z.object({ 
      productName: z.string().describe('Nome do vermífugo.'), 
      date: z.string().describe('Data da última administração (dd/MM/yyyy).') 
    }))
    .optional()
    .describe('Histórico de vermifugação recente do pet.'),
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

  Analise os seguintes dados do pet para fornecer um diagnóstico preliminar. Considere **todos** os detalhes fornecidos: informações básicas do pet (nome, espécie, raça, idade, peso, sexo), sintomas principais, respostas aos sintomas de acompanhamento (se houver), histórico de vacinação (se fornecido) e histórico de vermifugação (se fornecido). Seja cauteloso: vacinas reduzem o risco, mas não eliminam totalmente a possibilidade de doença. Vermifugação em dia reduz a chance de parasitas, mas outros problemas gastrointestinais podem ocorrer.

  Dados do Pet:
  Nome: {{{petName}}}
  Espécie: {{{species}}}
  Raça: {{{breed}}}
  Idade: {{{age}}} anos
  {{#if weightKm}}
  Peso: {{{weightKm}}} kg
  {{/if}}
  {{#if sex}}
  Sexo: {{{sex}}}
  {{/if}}

  Sintomas Principais: {{{symptoms}}}

  {{#if followUpResponses}}
  Respostas aos sintomas de acompanhamento anteriores:
  {{#each followUpResponses}}
  - Pergunta: "{{{this.symptom}}}" Resposta do tutor: {{{this.response}}}
  {{/each}}
  {{/if}}

  {{#if vaccineHistory}}
  Histórico de Vacinação Recente:
  {{#each vaccineHistory}}
  - Vacina: {{{this.name}}}, Data da Última Dose: {{{this.date}}}
  {{/each}}
  (Considere este histórico. Se o pet estiver vacinado para uma doença X, ela é menos provável, mas não impossível. Patógenos podem ter variantes e a eficácia da vacina não é 100%.)
  {{else}}
  Histórico de Vacinação: Não fornecido ou não disponível.
  {{/if}}

  {{#if dewormingHistory}}
  Histórico de Vermifugação Recente:
  {{#each dewormingHistory}}
  - Produto: {{{this.productName}}}, Data da Última Administração: {{{this.date}}}
  {{/each}}
  (Considere este histórico. Sintomas gastrointestinais podem ser menos prováveis de serem parasitários se a vermifugação estiver em dia, mas não descarte totalmente.)
  {{else}}
  Histórico de Vermifugação: Não fornecido ou não disponível.
  {{/if}}

  **Diretrizes para Perguntas de Acompanhamento e Diagnóstico Interativo:**
  1.  **Evite Redundâncias e Multiperguntas:** Nunca repita perguntas já feitas, mesmo com formulações diferentes. Cada pergunta de acompanhamento em \`suggestedFollowUpSymptoms\` deve ser singular, focada em um único sintoma ou observação, e formulada para ser respondida com "Sim", "Não" ou "Não tenho certeza".
      *   Exemplo INCORRETO de pergunta para \`suggestedFollowUpSymptoms\`: "Está bebendo água normalmente, ou está bebendo mais ou menos que o normal?"
      *   Exemplo CORRETO para \`suggestedFollowUpSymptoms\`: "O pet está bebendo mais água do que o normal?"
  2.  **Coleta de Informações Detalhadas:** Se você precisar de informações que não se encaixam em um "Sim/Não" (ex: a cor de um vômito, a frequência de um sintoma), NÃO inclua essa pergunta diretamente em \`suggestedFollowUpSymptoms\`. Em vez disso:
      *   Defina \`needsMoreInfo\` como \`true\`.
      *   Na sua resposta textual (em \`potentialDiagnoses\` ou \`immediateCareSuggestions\`), explique claramente qual informação adicional é necessária e instrua o usuário a adicioná-la à descrição principal dos sintomas para a próxima análise. Exemplo: "Para refinar o diagnóstico, por favor, descreva a cor e consistência do vômito na caixa de sintomas e analise novamente."
  3.  **Observações com Múltiplas Opções:** Se um sintoma pode ter várias aparências (ex: sangue nas fezes), guie o usuário de forma similar ao item 2. Peça que ele observe e descreva os detalhes na caixa de sintomas. Exemplo: "Observe as fezes: são escuras como alcatrão, têm sangue vivo, ou coágulos? Descreva na caixa de sintomas."
  4.  **Limite de Interações e Conclusão:** Analise TODAS as informações fornecidas, incluindo as respostas de acompanhamento de rodadas anteriores. Se, após algumas rodadas de perguntas de acompanhamento (baseadas nas respostas do usuário), um diagnóstico claro ainda não for possível ou a informação não estiver convergindo, defina \`needsMoreInfo\` como \`false\` e, em \`potentialDiagnoses\` ou \`immediateCareSuggestions\`, inclua a seguinte instrução: "Não foi possível concluir um diagnóstico com segurança com as informações fornecidas. Recomendamos que você leve seu animal de estimação imediatamente a um médico veterinário."
  5.  **Contexto e Relevância:** Suas perguntas de acompanhamento devem ser sempre contextualmente relevantes, considerando todas as informações já fornecidas pelo usuário nas rodadas anteriores.

  Com base em TUDO o que foi fornecido:
  Se os sintomas (incluindo respostas de acompanhamento, se houver) ainda forem insuficientes para um diagnóstico ou se o diagnóstico for muito amplo, E você acreditar que perguntas adicionais (do tipo Sim/Não/Não sei que se encaixem na diretriz 1) podem ajudar, defina \`needsMoreInfo\` como \`true\` e forneça NOVAS perguntas claras em \`suggestedFollowUpSymptoms\` (em Português do Brasil).
  Se você tiver confiança suficiente para um diagnóstico preliminar OU se decidiu concluir a triagem conforme a diretriz 4, defina \`needsMoreInfo\` como \`false\`.

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

