// 'use server'
'use server';

/**
 * @fileOverview AI-powered symptom checker for pets.
 *
 * - checkSymptoms - A function that takes pet details and symptoms as input and returns potential diagnoses and care suggestions.
 * - CheckSymptomsInput - The input type for the checkSymptoms function.
 * - CheckSymptomsOutput - The return type for the checkSymptoms function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CheckSymptomsInputSchema = z.object({
  petName: z.string().describe('The name of the pet.'),
  species: z.enum(['Cachorro', 'Gato']).describe('The species of the pet (Cachorro or Gato).'),
  breed: z.string().describe('The breed of the pet.'),
  age: z.number().describe('The age of the pet in years.'),
  symptoms: z.string().describe('A detailed description of the pet\'s symptoms.'),
  additionalSymptoms: z
    .array(z.string())
    .optional()
    .describe('Optional: Additional symptoms to consider.'),
});

export type CheckSymptomsInput = z.infer<typeof CheckSymptomsInputSchema>;

const CheckSymptomsOutputSchema = z.object({
  potentialDiagnoses: z
    .string()
    .describe('A list of potential diagnoses based on the symptoms provided.'),
  immediateCareSuggestions: z
    .string()
    .describe('Suggestions for immediate care based on the potential diagnoses.'),
  disclaimer: z
    .string()
    .describe(
      'A disclaimer stating that this is not a substitute for professional veterinary advice.'
    ),
  needsMoreInfo: z
    .boolean()
    .optional()
    .describe('Whether more information is needed to make a diagnosis.'),
  suggestedFollowUpSymptoms: z
    .array(z.string())
    .optional()
    .describe('Suggested follow-up symptoms to ask about.'),
});

export type CheckSymptomsOutput = z.infer<typeof CheckSymptomsOutputSchema>;

export async function checkSymptoms(input: CheckSymptomsInput): Promise<CheckSymptomsOutput> {
  return checkSymptomsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'checkSymptomsPrompt',
  input: {schema: CheckSymptomsInputSchema},
  output: {schema: CheckSymptomsOutputSchema},
  prompt: `You are an AI veterinary assistant helping pet owners understand their pet's symptoms.

  Based on the information provided, give potential diagnoses, suggest immediate care steps, and provide a disclaimer.

  Pet Name: {{{petName}}}
  Species: {{{species}}}
  Breed: {{{breed}}}
  Age: {{{age}}}
  Symptoms: {{{symptoms}}}
  {{#if additionalSymptoms}}
  Additional Symptoms:
  {{#each additionalSymptoms}}
  - {{{this}}}
  {{/each}}
  {{/if}}

  Potential Diagnoses: (List potential conditions, separated by commas)
  Immediate Care Suggestions: (Provide actionable steps, separated by commas)
  Disclaimer: (Standard disclaimer about not replacing professional vet advice)

  If the provided symptoms are insufficient for a diagnosis, set needsMoreInfo to true and suggest follow-up symptoms to ask about.
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
