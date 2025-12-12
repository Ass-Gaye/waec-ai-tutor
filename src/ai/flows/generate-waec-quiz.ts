'use server';

/**
 * @fileOverview Generates WAEC-style quizzes with answer keys for various subjects.
 *
 * - generateWAECQuiz - A function that generates a WAEC-style quiz.
 * - GenerateWAECQuizInput - The input type for the generateWAECQuiz function.
 * - GenerateWAECQuizOutput - The return type for the generateWAECQuiz function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateWAECQuizInputSchema = z.object({
  subject: z
    .string()
    .describe('The subject for which the quiz should be generated (e.g., Maths, English, Physics, Chemistry, Biology).'),
  numQuestions: z.number().describe('The number of questions to include in the quiz.'),
});

export type GenerateWAECQuizInput = z.infer<typeof GenerateWAECQuizInputSchema>;

const GenerateWAECQuizOutputSchema = z.object({
  quiz: z.string().describe('The generated WAEC-style quiz with answer key.'),
});

export type GenerateWAECQuizOutput = z.infer<typeof GenerateWAECQuizOutputSchema>;

export async function generateWAECQuiz(input: GenerateWAECQuizInput): Promise<GenerateWAECQuizOutput> {
  return generateWAECQuizFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateWAECQuizPrompt',
  input: {schema: GenerateWAECQuizInputSchema},
  output: {schema: GenerateWAECQuizOutputSchema},
  prompt: `Generate a WAEC-style quiz for the subject of {{subject}} with {{numQuestions}} questions, and provide an answer key.

Ensure the quiz format is similar to past WAEC questions. The output should have the questions and answers. Follow it up with a comprehensive key.
`,
});

const generateWAECQuizFlow = ai.defineFlow(
  {
    name: 'generateWAECQuizFlow',
    inputSchema: GenerateWAECQuizInputSchema,
    outputSchema: GenerateWAECQuizOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
