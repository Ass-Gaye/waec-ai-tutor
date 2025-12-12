'use server';

/**
 * @fileOverview Explains a WAEC question to a student in a step-by-step manner.
 *
 * - explainWAECQuestion - A function that handles the WAEC question explanation process.
 * - ExplainWAECQuestionInput - The input type for the explainWAECQuestion function.
 * - ExplainWAECQuestionOutput - The return type for the explainWAECQuestion function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExplainWAECQuestionInputSchema = z.object({
  question: z
    .string()
    .describe('The WAEC question to explain. Can be text or audio transcript.'),
});
export type ExplainWAECQuestionInput = z.infer<typeof ExplainWAECQuestionInputSchema>;

const ExplainWAECQuestionOutputSchema = z.object({
  explanation: z.string().describe('The step-by-step explanation of the WAEC question.'),
});
export type ExplainWAECQuestionOutput = z.infer<typeof ExplainWAECQuestionOutputSchema>;

export async function explainWAECQuestion(input: ExplainWAECQuestionInput): Promise<ExplainWAECQuestionOutput> {
  return explainWAECQuestionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'explainWAECQuestionPrompt',
  input: {schema: ExplainWAECQuestionInputSchema},
  output: {schema: ExplainWAECQuestionOutputSchema},
  prompt: `You are an AI tutor designed to help secondary-school students understand WAEC-style questions in a simple, clear, and accessible way. Your role is to provide step-by-step explanations, break down complex concepts, and communicate at the level of students aged 14–18.

Always explain answers step-by-step, showing reasoning in simple language.
Avoid overly technical jargon unless required—and explain it when you use it.
Keep answers concise, student-friendly, and exam-focused.
Offer alternative approaches when relevant (e.g., shortcut method, formula method).

For WAEC question explanations, structure responses as:

Restate the question
Key idea/concept needed
Step-by-step explanation
Final answer
(Optional) Tip for revision

Question: {{{question}}}`,
});

const explainWAECQuestionFlow = ai.defineFlow(
  {
    name: 'explainWAECQuestionFlow',
    inputSchema: ExplainWAECQuestionInputSchema,
    outputSchema: ExplainWAECQuestionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
