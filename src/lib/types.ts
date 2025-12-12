export type Explanation = {
  explanation: string;
  originalQuestion: string;
};

export type QuizQuestion = {
  question: string;
  options: string[];
  answer: number; // 0-based index
  explanation: string;
};

export type Quiz = {
  subject: string;
  questions: QuizQuestion[];
};

export type QuizPerformance = {
    subject: string;
    score: number;
    totalQuestions: number;
    date: string; // ISO string
};
