// Summarize Validation Errors
'use server';
/**
 * @fileOverview Summarizes validation errors in a SWIFT MT message using AI.
 *
 * - summarizeValidationErrors - A function that takes validation errors as input and returns a summarized explanation.
 * - SummarizeValidationErrorsInput - The input type for the summarizeValidationErrors function.
 * - SummarizeValidationErrorsOutput - The return type for the summarizeValidationErrors function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeValidationErrorsInputSchema = z.object({
  errors: z
    .string()
    .describe('A string containing the validation errors found in the SWIFT MT message.'),
});
export type SummarizeValidationErrorsInput = z.infer<
  typeof SummarizeValidationErrorsInputSchema
>;

const SummarizeValidationErrorsOutputSchema = z.object({
  summary: z
    .string()
    .describe('A concise summary of the validation errors and their potential impact.'),
  suggestions: z
    .string()
    .describe('Suggestions of how to fix errors based on the error summary.'),
});
export type SummarizeValidationErrorsOutput = z.infer<
  typeof SummarizeValidationErrorsOutputSchema
>;

export async function summarizeValidationErrors(
  input: SummarizeValidationErrorsInput
): Promise<SummarizeValidationErrorsOutput> {
  return summarizeValidationErrorsFlow(input);
}

const summarizeValidationErrorsPrompt = ai.definePrompt({
  name: 'summarizeValidationErrorsPrompt',
  input: {schema: SummarizeValidationErrorsInputSchema},
  output: {schema: SummarizeValidationErrorsOutputSchema},
  prompt: `You are an expert SWIFT MT message validator. You will receive a list of validation errors for a SWIFT MT message. Provide a concise summary of the errors and their potential impact. Also provide actionable suggestions on how to fix them. 

Validation Errors:\n{{errors}}`,
});

const summarizeValidationErrorsFlow = ai.defineFlow(
  {
    name: 'summarizeValidationErrorsFlow',
    inputSchema: SummarizeValidationErrorsInputSchema,
    outputSchema: SummarizeValidationErrorsOutputSchema,
  },
  async input => {
    const {output} = await summarizeValidationErrorsPrompt(input);
    return output!;
  }
);
