'use server';

/**
 * @fileOverview Generates a personalized nutrition plan for a pet using AI.
 *
 * - generateNutritionPlan - A function that handles the nutrition plan generation process.
 * - NutritionPlanInput - The input type for the generateNutritionPlan function.
 * - NutritionPlanOutput - The return type for the generateNutritionPlan function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const NutritionPlanInputSchema = z.object({
  petName: z.string().describe('The name of the pet.'),
  species: z.string().describe('The species of the pet (e.g., dog, cat).'),
  breed: z.string().describe('The breed of the pet (e.g., Labrador, Siamese).'),
  age: z.number().describe('The age of the pet in years.'),
  weight: z.number().describe('The weight of the pet in kilograms.'),
});

export type NutritionPlanInput = z.infer<typeof NutritionPlanInputSchema>;

const NutritionPlanOutputSchema = z.object({
  recommendedFoodTypes: z.string().describe('Types of food recommended for the pet.'),
  dailyFoodAmount: z.string().describe('The recommended daily amount of food for the pet.'),
  feedingFrequency: z.string().describe('How often the pet should be fed per day.'),
  generalAdvice: z.string().describe('General nutritional advice for the pet.'),
  importantNotes: z.string().optional().describe('Any important notes or considerations.'),
  disclaimer: z.string().describe('A disclaimer for the generated plan.'),
});

export type NutritionPlanOutput = z.infer<typeof NutritionPlanOutputSchema>;

export async function generateNutritionPlan(input: NutritionPlanInput): Promise<NutritionPlanOutput> {
  return generateNutritionPlanFlow(input);
}

const prompt = ai.definePrompt({
  name: 'nutritionPlanPrompt',
  input: {schema: NutritionPlanInputSchema},
  output: {schema: NutritionPlanOutputSchema},
  prompt: `You are an expert pet nutritionist. Create a personalized nutrition plan for the following pet:

Pet Name: {{{petName}}}
Species: {{{species}}}
Breed: {{{breed}}}
Age: {{{age}}} years
Weight: {{{weight}}} kg

Consider the pet's species, breed, age, and weight to determine the optimal diet. Provide specific recommendations for:

- Types of food (e.g., specific brands or types of food)
- Daily amount of food (in grams or cups)
- Feeding frequency (e.g., twice a day, three times a day)
- General nutritional advice
- Important notes (optional, e.g., allergies or special considerations)
- A disclaimer stating that this is AI generated advice and a vet should be consulted for specific needs.

Format the output as a JSON object matching the NutritionPlanOutputSchema.`,
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
