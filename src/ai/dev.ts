import { config } from 'dotenv';
config();

import '@/ai/flows/explain-waec-question.ts';
import '@/ai/flows/simplify-explanation-on-confusion.ts';
import '@/ai/flows/generate-waec-quiz.ts';
import '@/ai/flows/transcribe-audio';
import '@/ai/flows/text-to-speech';
