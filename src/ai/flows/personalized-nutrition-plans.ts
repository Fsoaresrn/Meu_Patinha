
'use server';

/**
 * @fileOverview Gera um plano de nutrição personalizado para um pet usando IA.
 *
 * - generateNutritionPlan - Uma função que lida com o processo de geração do plano de nutrição.
 * - NutritionPlanInput - O tipo de entrada para a função generateNutritionPlan.
 * - NutritionPlanOutput - O tipo de retorno para a função generateNutritionPlan.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const NutritionPlanInputSchema = z.object({
  petName: z.string().describe('O nome do pet.'),
  species: z.string().describe('A espécie do pet (ex: cão, gato).'),
  breed: z.string().describe('A raça do pet (ex: Labrador, Siamês).'),
  age: z.number().describe('A idade do pet em anos.'),
  weight: z.number().describe('O peso do pet em quilogramas.'),
});

export type NutritionPlanInput = z.infer<typeof NutritionPlanInputSchema>;

const NutritionPlanOutputSchema = z.object({
  recommendedFoodTypes: z.string().describe('Tipos de alimentos recomendados para o pet, em Português do Brasil.'),
  dailyFoodAmount: z.string().describe('A quantidade diária recomendada de alimento para o pet, em Português do Brasil.'),
  feedingFrequency: z.string().describe('Com que frequência o pet deve ser alimentado por dia, em Português do Brasil.'),
  generalAdvice: z.string().describe('Conselhos nutricionais gerais para o pet, em Português do Brasil.'),
  importantNotes: z.string().optional().describe('Quaisquer notas ou considerações importantes, em Português do Brasil.'),
  disclaimer: z.string().describe('Um aviso para o plano gerado, em Português do Brasil.'),
});

export type NutritionPlanOutput = z.infer<typeof NutritionPlanOutputSchema>;

export async function generateNutritionPlan(input: NutritionPlanInput): Promise<NutritionPlanOutput> {
  return generateNutritionPlanFlow(input);
}

const prompt = ai.definePrompt({
  name: 'nutritionPlanPrompt',
  input: {schema: NutritionPlanInputSchema},
  output: {schema: NutritionPlanOutputSchema},
  prompt: `Você é um nutricionista pet especialista. **IMPORTANTE: Todas as suas respostas, incluindo recomendações, conselhos e avisos, DEVEM estar em Português do Brasil.**

Crie um plano de nutrição personalizado para o seguinte pet:

Nome do Pet: {{{petName}}}
Espécie: {{{species}}}
Raça: {{{breed}}}
Idade: {{{age}}} anos
Peso: {{{weight}}} kg

Considere a espécie, raça, idade e peso do pet para determinar a dieta ideal. Forneça recomendações específicas para (tudo em Português do Brasil):

- Tipos de alimento (ex: marcas específicas ou tipos de alimento)
- Quantidade diária de alimento (em gramas ou xícaras)
- Frequência de alimentação (ex: duas vezes ao dia, três vezes ao dia)
- Conselhos nutricionais gerais
- Notas importantes (opcional, ex: alergias ou considerações especiais)
- Um aviso informando que este é um conselho gerado por IA e um veterinário deve ser consultado para necessidades específicas.

Formate a saída como um objeto JSON correspondente ao NutritionPlanOutputSchema.`,
});

const generateNutritionPlanFlow = ai.defineFlow(
  {
    name: 'generateNutritionPlanFlow',
    inputSchema: NutritionPlanInputSchema,
    outputSchema: NutritionPlanOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
