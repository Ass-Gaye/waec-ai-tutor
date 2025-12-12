'use server';

/**
 * @fileOverview Simplifies an explanation if the student is detected to be confused.
 *
 * This file exports:
 * - `simplifyExplanationOnConfusion` - The main function to simplify explanations.
 * - `SimplifyExplanationOnConfusionInput` - The input type for the function.
 * - `SimplifyExplanationOnConfusionOutput` - The output type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SimplifyExplanationOnConfusionInputSchema = z.object({
  explanation: z.string().describe('The explanation to simplify.'),
  studentQuestion: z.string().describe('The student\s question that led to the original explanation.'),
});
export type SimplifyExplanationOnConfusionInput = z.infer<typeof SimplifyExplanationOnConfusionInputSchema>;

const SimplifyExplanationOnConfusionOutputSchema = z.object({
  simplifiedExplanation: z.string().describe('The simplified explanation.'),
});
export type SimplifyExplanationOnConfusionOutput = z.infer<typeof SimplifyExplanationOnConfusionOutputSchema>;

export async function simplifyExplanationOnConfusion(
  input: SimplifyExplanationOnConfusionInput
): Promise<SimplifyExplanationOnConfusionOutput> {
  return simplifyExplanationOnConfusionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'simplifyExplanationOnConfusionPrompt',
  input: {schema: SimplifyExplanationOnConfusionInputSchema},
  output: {schema: SimplifyExplanationOnConfusionOutputSchema},
  prompt: `You are an AI tutor who specializes in simplifying explanations for secondary school students.

  A student asked the following question: {{{studentQuestion}}}

  You provided the following explanation: {{{explanation}}}

The student is still confused.  Simplify your explanation so that it is easier to understand.

Ensure the simplified explanation is still accurate and complete, but uses simpler language and avoids jargon.`,
});

const simplifyExplanationOnConfusionFlow = ai.defineFlow(
  {
    name: 'simplifyExplanationOnConfusionFlow',
    inputSchema: SimplifyExplanationOnConfusionInputSchema,
    outputSchema: SimplifyExplanationOnConfusionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
