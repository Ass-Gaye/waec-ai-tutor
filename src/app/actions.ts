'use server';

import {
  explainWAECQuestion,
  type ExplainWAECQuestionInput,
} from '@/ai/flows/explain-waec-question';
import {
  generateWAECQuiz,
  type GenerateWAECQuizInput,
  type GenerateWAECQuizOutput
} from '@/ai/flows/generate-waec-quiz';
import {
  simplifyExplanationOnConfusion,
  type SimplifyExplanationOnConfusionInput,
} from '@/aiflows/simplify-explanation-on-confusion';
import {
  textToSpeech,
  type TextToSpeechInput
} from '@/ai/flows/text-to-speech';
import {
    transcribeAudio,
    type TranscribeAudioInput,
} from '@/ai/flows/transcribe-audio';
import { z } from 'zod';

const explainSchema = z.object({
  question: z.string(),
  photoDataUri: z.string().optional(),
});

export async function getExplanation(
  values: ExplainWAECQuestionInput
): Promise<{ data: string; error: null } | { data: null; error: string }> {
  const validatedFields = explainSchema.safeParse(values);

  if (!validatedFields.success) {
    return { data: null, error: validatedFields.error.flatten().fieldErrors.question?.join(', ') || 'Invalid input.' };
  }
  
  if (!validatedFields.data.question && !validatedFields.data.photoDataUri) {
      return { data: null, error: 'Please enter a question or upload an image.' };
  }

  try {
    const result = await explainWAECQuestion(validatedFields.data);
    return { data: result.explanation, error: null };
  } catch (error) {
    return { data: null, error: 'An error occurred while generating the explanation. Please try again.' };
  }
}

const quizSchema = z.object({
    subject: z.enum(['Maths', 'English', 'Physics', 'Chemistry', 'Biology']),
    numQuestions: z.coerce.number().min(1, {message: 'Please enter at least 1 question.'}).max(10, {message: 'You can generate a maximum of 10 questions at a time.'}),
});

export async function getQuiz(
  values: GenerateWAECQuizInput
): Promise<{ data: GenerateWAECQuizOutput; error: null } | { data: null; error: string }> {
  const validatedFields = quizSchema.safeParse(values);

  if (!validatedFields.success) {
      const fieldErrors = validatedFields.error.flatten().fieldErrors;
      const errorMessage = fieldErrors.subject?.join(', ') || fieldErrors.numQuestions?.join(', ') || 'Invalid input.';
    return { data: null, error: errorMessage };
  }

  try {
    const result = await generateWAECQuiz({ subject: validatedFields.data.subject, numQuestions: validatedFields.data.numQuestions });
    return { data: result, error: null };
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

const transcribeSchema = z.object({
    audioDataUri: z.string(),
});

export async function getTranscription(
    values: TranscribeAudioInput
): Promise<{ data: string; error: null } | { data: null; error: string }> {
    const validatedFields = transcribeSchema.safeParse(values);
    if (!validatedFields.success) {
        return { data: null, error: 'Invalid audio data.' };
    }
    try {
        const result = await transcribeAudio(validatedFields.data);
        return { data: result.text, error: null };
    } catch (error) {
        return { data: null, error: 'An error occurred during transcription. Please try again.' };
    }
}

const ttsSchema = z.object({
    text: z.string(),
});

export async function getSpeech(
    values: TextToSpeechInput
): Promise<{ data: string; error: null } | { data: null; error: string }> {
    const validatedFields = ttsSchema.safeParse(values);

    if (!validatedFields.success) {
        return { data: null, error: 'Invalid text for speech synthesis.' };
    }

    try {
        const result = await textToSpeech(validatedFields.data);
        return { data: result.audioDataUri, error: null };
    } catch (error) {
        return { data: null, error: 'An error occurred during speech synthesis. Please try again.' };
    }
}
