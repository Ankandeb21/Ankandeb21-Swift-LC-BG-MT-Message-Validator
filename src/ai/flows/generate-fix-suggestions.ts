'use server';

/**
 * @fileOverview AI-powered suggestions for fixing invalid SWIFT MT messages.
 *
 * - generateFixSuggestions - A function that generates fix suggestions for invalid SWIFT MT messages.
 * - GenerateFixSuggestionsInput - The input type for the generateFixSuggestions function.
 * - GenerateFixSuggestionsOutput - The return type for the generateFixSuggestions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateFixSuggestionsInputSchema = z.object({
  message: z.string().describe('The invalid SWIFT MT message to fix.'),
  errors: z.array(z.string()).describe('The validation errors for the message.'),
});
export type GenerateFixSuggestionsInput = z.infer<typeof GenerateFixSuggestionsInputSchema>;

const GenerateFixSuggestionsOutputSchema = z.object({
  suggestions: z.array(z.string()).describe('The AI-generated suggestions for fixing the message.'),
});
export type GenerateFixSuggestionsOutput = z.infer<typeof GenerateFixSuggestionsOutputSchema>;

export async function generateFixSuggestions(input: GenerateFixSuggestionsInput): Promise<GenerateFixSuggestionsOutput> {
  return generateFixSuggestionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateFixSuggestionsPrompt',
  input: {schema: GenerateFixSuggestionsInputSchema},
  output: {schema: GenerateFixSuggestionsOutputSchema},
  prompt: `You are an expert in SWIFT MT message syntax and are able to suggest fixes for invalid messages.

  Given the following SWIFT MT message and the identified errors, provide a list of suggestions to fix the message.
  The suggestions should be clear, actionable, and specific to the errors identified. Return an array of strings, each being a specific suggestion.

  Message:
  {{message}}

  Errors:
  {{#each errors}}
  - {{this}}
  {{/each}}
  `,
});

const generateFixSuggestionsFlow = ai.defineFlow(
  {
    name: 'generateFixSuggestionsFlow',
    inputSchema: GenerateFixSuggestionsInputSchema,
    outputSchema: GenerateFixSuggestionsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
