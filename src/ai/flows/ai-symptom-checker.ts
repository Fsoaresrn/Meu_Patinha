
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

// Adicionando um esquema para perguntas detalhadas
const DetailedQuestionSchema = z.object({
  type: z.enum(["open_text", "single_select", "multi_select", "date"]).describe("Tipo de pergunta detalhada: 'open_text' para entrada de texto livre, 'single_select' para escolha única, 'multi_select' para múltipla escolha, 'date' para entrada de data."),
  text: z.string().describe("O texto da pergunta detalhada."),
  options: z.array(z.string()).optional().describe("Opções para perguntas 'single_select' ou 'multi_select'."),
  requiredFollowUp: z.boolean().optional().describe("Indica se esta pergunta detalhada é um seguimento direto de uma resposta 'Sim' a uma pergunta anterior em suggestedFollowUpSymptoms.")
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
    .describe('Perguntas de acompanhamento simples (Sim/Não/Não tenho certeza) sugeridas para perguntar ao usuário, em Português do Brasil. Devem ser perguntas claras, únicas e que não foram feitas antes.'),
  detailedQuestion: DetailedQuestionSchema.optional().describe("Uma pergunta detalhada específica se a IA precisar de informações que não sejam Sim/Não. A interface do usuário deve ser capaz de renderizar essa pergunta com base no 'type'.")
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

  Analise os seguintes dados do pet para fornecer um diagnóstico preliminar. Considere **todos** os detalhes fornecidos: informações básicas do pet (nome, espécie, raça, idade, peso, sexo), sintomas principais, histórico de vacinação, histórico de vermifugação e, crucialmente, **todo o histórico de perguntas e respostas de acompanhamento anteriores** para evitar repetições e fazer perguntas progressivamente mais específicas.

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

  Sintomas Principais Fornecidos pelo Tutor: {{{symptoms}}}

  {{#if followUpResponses}}
  Histórico de Perguntas e Respostas de Acompanhamento (Considere este histórico cuidadosamente para evitar repetições):
  {{#each followUpResponses}}
  - IA Perguntou: "{{{this.symptom}}}" -> Tutor Respondeu: {{{this.response}}}
  {{/each}}
  {{/if}}

  {{#if vaccineHistory}}
  Histórico de Vacinação Recente:
  {{#each vaccineHistory}}
  - Vacina: {{{this.name}}}, Data da Última Dose: {{{this.date}}}
  {{/each}}
  (Lembre-se: vacinas reduzem risco, mas não o eliminam.)
  {{else}}
  Histórico de Vacinação: Não fornecido.
  {{/if}}

  {{#if dewormingHistory}}
  Histórico de Vermifugação Recente:
  {{#each dewormingHistory}}
  - Produto: {{{this.productName}}}, Data da Última Administração: {{{this.date}}}
  {{/each}}
  (Lembre-se: vermifugação em dia reduz chance de parasitas, mas outros problemas gastrointestinais podem ter sintomas similares.)
  {{else}}
  Histórico de Vermifugação: Não fornecido.
  {{/if}}

  **Diretrizes para Perguntas de Acompanhamento e Diagnóstico Interativo:**

  1.  **NÃO FAÇA PERGUNTAS REPETIDAS:** Analise CUIDADOSAMENTE o histórico de \`followUpResponses\` e os sintomas principais. Se uma informação já foi dada ou uma pergunta similar já foi respondida, não pergunte novamente, mesmo que com palavras diferentes.
  2.  **PERGUNTAS SIMPLES (Sim/Não/Não tenho certeza):**
      *   Se precisar de esclarecimentos que se encaixam em respostas Sim/Não/Não tenho certeza, formule perguntas claras, **únicas** e que **não foram feitas antes**, e adicione-as ao campo \`suggestedFollowUpSymptoms\`.
      *   Cada pergunta deve ser singular. Exemplo INCORRETO: "Ele está comendo e bebendo normalmente?" Correto: "Ele está comendo normalmente?" (e em outra pergunta, se necessário "Ele está bebendo normalmente?").
      *   Evite perguntas como "O sintoma X está presente ou ausente?". Reformule para algo como "O sintoma X está presente?".

  3.  **PERGUNTAS DETALHADAS (Texto, Datas, Múltipla Escolha):**
      *   Se você precisar de informações que EXIGEM uma resposta descritiva (ex: cor de um vômito, frequência de um sintoma, uma data específica, ou escolher entre várias características), você DEVE usar o campo \`detailedQuestion\`.
      *   Defina \`needsMoreInfo\` como \`true\`.
      *   Preencha \`detailedQuestion\` com:
          *   \`type\`: \`'open_text'\` (para descrição), \`'date'\` (para data como "dd/MM/aaaa"), \`'single_select'\` ou \`'multi_select'\` (para opções).
          *   \`text\`: A pergunta clara e direta. Ex: "Qual a data da última vermifugação (dd/MM/aaaa)?", "Descreva a aparência do vômito (cor, consistência, presença de sangue, etc.).", "Quais destas características você observa no sangue presente nas fezes?"
          *   \`options\` (para select/multi-select): Um array de strings com as opções. Ex: ["Sangue vermelho vivo", "Coágulos", "Fezes escuras tipo borra de café", "Apenas laivos de sangue"].
      *   Se uma pergunta detalhada é um seguimento direto de uma resposta "Sim" a uma pergunta anterior em \`suggestedFollowUpSymptoms\` (ex: "O pet já foi vermifugado?" -> "Sim". Próxima pergunta: "Qual a data da última vermifugação?"), defina \`detailedQuestion.requiredFollowUp\` como \`true\`.
      *   **NÃO** coloque perguntas que exigem respostas detalhadas no campo \`suggestedFollowUpSymptoms\`.

  4.  **LIMITE DE INTERAÇÕES E ENCAMINHAMENTO:**
      *   Seu objetivo é tentar refinar o diagnóstico, mas não prolongar a interação indefinidamente se a informação não estiver convergindo ou se os sintomas forem muito graves.
      *   Se após cerca de **3-5 rodadas de perguntas de acompanhamento** (incluindo tanto as de \`suggestedFollowUpSymptoms\` quanto as de \`detailedQuestion\`) um diagnóstico provisório claro ainda não estiver emergindo, OU se os sintomas indicarem uma emergência, você DEVE:
          *   Definir \`needsMoreInfo\` como \`false\` (ou omitir).
          *   Omitir \`suggestedFollowUpSymptoms\` e \`detailedQuestion\`.
          *   Em \`immediateCareSuggestions\`, priorize a instrução: **"Recomendamos enfaticamente que você procure um médico veterinário imediatamente para uma avaliação presencial do seu pet."**
          *   Em \`potentialDiagnoses\`, você pode listar possibilidades muito genéricas se ainda incerto, ou focar nos sintomas mais preocupantes, mas sempre reforce a necessidade de avaliação veterinária.

  5.  **GRAVIDADE E URGÊNCIA:** Se os sintomas iniciais ou as respostas subsequentes indicarem uma condição potencialmente fatal ou muito grave (ex: dificuldade respiratória severa, convulsões contínuas, hemorragia intensa, prostração extrema), priorize o encaminhamento imediato ao veterinário (conforme diretriz 4), mesmo que seja na primeira ou segunda interação.

  **FLUXO DA RESPOSTA:**
  a.  Analise TODAS as informações: dados do pet, sintomas principais, histórico de vacinação/vermifugação e TODO o histórico de perguntas e respostas anteriores (\`followUpResponses\`).
  b.  Se os sintomas são graves ou se o limite de interações foi atingido, siga a diretriz 4 e 5.
  c.  Caso contrário, se você precisar de mais informações:
      i.  Se for uma pergunta Sim/Não/Não sei, use \`suggestedFollowUpSymptoms\` (Diretriz 2).
      ii. Se for uma pergunta detalhada, use \`detailedQuestion\` (Diretriz 3).
      iii.Defina \`needsMoreInfo\` como \`true\`.
  d.  Se você tem informações suficientes para um diagnóstico preliminar e não precisa de mais perguntas:      
      i.  Defina \`needsMoreInfo\` como \`false\` (ou omita).
      ii. Omita \`suggestedFollowUpSymptoms\` e \`detailedQuestion\`.
  e.  Sempre forneça \`potentialDiagnoses\`, \`immediateCareSuggestions\`, e o \`disclaimer\` padrão.

  Aviso Legal Padrão (use este texto exato para o campo \`disclaimer\`):
  "Esta análise é baseada em IA e não substitui o diagnóstico ou aconselhamento de um médico veterinário qualificado. A saúde do seu pet é uma prioridade; se os sintomas persistirem, piorarem, ou se você estiver preocupado, procure atendimento veterinário imediatamente."
`,
});

const checkSymptomsFlow = ai.defineFlow(
  {
    name: 'checkSymptomsFlow',
    inputSchema: CheckSymptomsInputSchema,
    outputSchema: CheckSymptomsOutputSchema,
  },
  async input => {
    // Adicionar lógica para garantir que o histórico de vacinação e vermifugação seja passado corretamente, mesmo que vazio.
    const sanitizedInput = {
      ...input,
      vaccineHistory: input.vaccineHistory || [],
      dewormingHistory: input.dewormingHistory || [],
      followUpResponses: input.followUpResponses || [],
    };
    const {output} = await prompt(sanitizedInput);
    return output!;
  }
);

