'use server';

import {
  explainWAECQuestion,
  type ExplainWAECQuestionInput,
} from '@/ai/flows/explain-waec-question';
import {
  generateWAECQuiz,
  type GenerateWAECQuizInput,
} from '@/ai/flows/generate-waec-quiz';
import {
  simplifyExplanationOnConfusion,
  type SimplifyExplanationOnConfusionInput,
} from '@/ai/flows/simplify-explanation-on-confusion';
import { z } from 'zod';

const explainSchema = z.object({
  question: z.string().min(10, { message: 'Please enter a more detailed question (at least 10 characters).' }),
});

export async function getExplanation(
  values: ExplainWAECQuestionInput
): Promise<{ data: string; error: null } | { data: null; error: string }> {
  const validatedFields = explainSchema.safeParse(values);

  if (!validatedFields.success) {
    return { data: null, error: validatedFields.error.flatten().fieldErrors.question?.join(', ') || 'Invalid input.' };
  }

  try {
    const result = await explainWAECQuestion({ question: validatedFields.data.question });
    return { data: result.explanation, error: null };
  } catch (error) {
    return { data: null, error: 'An error occurred while generating the explanation. Please try again.' };
  }
}

const quizSchema = z.object({
    subject: z.enum(['Maths', 'English', 'Physics', 'Chemistry', 'Biology']),
    numQuestions: z.coerce.number().min(1, {message: 'Please enter at least 1 question.'}).max(20, {message: 'You can generate a maximum of 20 questions at a time.'}),
});

export async function getQuiz(
  values: GenerateWAECQuizInput
): Promise<{ data: string; error: null } | { data: null; error: string }> {
  const validatedFields = quizSchema.safeParse(values);

  if (!validatedFields.success) {
      const fieldErrors = validatedFields.error.flatten().fieldErrors;
      const errorMessage = fieldErrors.subject?.join(', ') || fieldErrors.numQuestions?.join(', ') || 'Invalid input.';
    return { data: null, error: errorMessage };
  }

  try {
    const result = await generateWAECQuiz({ subject: validatedFields.data.subject, numQuestions: validatedFields.data.numQuestions });
    return { data: result.quiz, error: null };
  } catch (error) {
    return { data: null, error: 'An error occurred while generating the quiz. Please try again.' };
  }
}

const simplifySchema = z.object({
    explanation: z.string(),
    studentQuestion: z.string(),
});

export async function getSimplifiedExplanation(
    values: SimplifyExplanationOnConfusionInput
): Promise<{ data: string; error: null } | { data: null; error: string }> {
    const validatedFields = simplifySchema.safeParse(values);

    if (!validatedFields.success) {
        return { data: null, error: 'Invalid input for simplification.' };
    }

    try {
        const result = await simplifyExplanationOnConfusion(validatedFields.data);
        return { data: result.simplifiedExplanation, error: null };
    } catch (error) {
        return { data: null, error: 'An error occurred while simplifying the explanation. Please try again.' };
    }
}
