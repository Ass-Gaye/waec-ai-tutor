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

const QuizQuestionSchema = z.object({
  question: z.string().describe('The full text of the quiz question.'),
  options: z.array(z.string()).describe('An array of 4 possible answers for the question.'),
  answer: z.number().describe('The 0-based index of the correct answer in the options array.'),
  explanation: z.string().describe('A brief explanation for why the answer is correct.'),
});

const GenerateWAECQuizOutputSchema = z.object({
    subject: z.string().describe('The subject of the generated quiz.'),
    questions: z.array(QuizQuestionSchema).describe('An array of quiz questions.'),
});

export type GenerateWAECQuizOutput = z.infer<typeof GenerateWAECQuizOutputSchema>;

export async function generateWAECQuiz(input: GenerateWAECQuizInput): Promise<GenerateWAECQuizOutput> {
  return generateWAECQuizFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateWAECQuizPrompt',
  input: {schema: GenerateWAECQuizInputSchema},
  output: {schema: GenerateWAECQuizOutputSchema},
  prompt: `Generate a WAEC-style quiz for the subject of {{subject}} with {{numQuestions}} questions.
  
  For each question, provide:
  - The question text.
  - 4 multiple-choice options.
  - The 0-based index of the correct answer.
  - A brief explanation for the correct answer.

Ensure the quiz format is similar to past WAEC questions and the output is valid JSON conforming to the schema.
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
