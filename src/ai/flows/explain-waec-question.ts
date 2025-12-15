'use server';

/**
 * @fileOverview Explains a WAEC question to a student in a step-by-step manner.
 *
 * - explainWAECQuestion - A function that handles the WAEC question explanation process.
 * - ExplainWAECQuestionInput - The input type for the explainWAECQuestion function.
 * - ExplainWAECQuestionOutput - The return type for the explainWAECQuestion function.
 */

import {ai} from '@/ai/genkit';
import {generate} from 'genkit/generate';
import {z} from 'genkit';

const ExplainWAECQuestionInputSchema = z.object({
  question: z
    .string()
    .describe('The WAEC question to explain. Can be text or from an image.'),
  photoDataUri: z
    .string()
    .optional()
    .describe(
      "An optional photo of a question, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type ExplainWAECQuestionInput = z.infer<typeof ExplainWAECQuestionInputSchema>;

const ExplainWAECQuestionOutputSchema = z.object({
  explanation: z.string().describe('The step-by-step explanation of the WAEC question.'),
});
export type ExplainWAECQuestionOutput = z.infer<typeof ExplainWAECQuestionOutputSchema>;

export async function explainWAECQuestion(input: ExplainWAECQuestionInput): Promise<ExplainWAECQuestionOutput> {
  return explainWAECQuestionFlow(input);
}

const systemPrompt = `You are an AI tutor designed to help secondary-school students understand WAEC-style questions in a simple, clear, and accessible way. Your role is to provide step-by-step explanations, break down complex concepts, and communicate at the level of students aged 14–18.

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
`;

const explainWAECQuestionFlow = ai.defineFlow(
  {
    name: 'explainWAECQuestionFlow',
    inputSchema: ExplainWAECQuestionInputSchema,
    outputSchema: ExplainWAECQuestionOutputSchema,
  },
  async input => {
    
    const promptParts: any[] = [];

    if (input.photoDataUri) {
        promptParts.push({ media: { url: input.photoDataUri } });
    }

    if (input.question) {
        promptParts.push({ text: `Question Text: ${input.question}` });
    } else if (input.photoDataUri) {
        promptParts.push({ text: "The user uploaded an image without additional text. Please analyze the image to identify and answer the question." });
    } else {
        // This case should be handled by form validation, but as a fallback:
        throw new Error('No question text or image was provided.');
    }

    const { output } = await generate({
        system: systemPrompt,
        model: 'googleai/gemini-1.5-flash',
        prompt: promptParts,
        output: {
            format: 'json',
            schema: ExplainWAECQuestionOutputSchema
        }
    });
    
    return output;
  }
);
