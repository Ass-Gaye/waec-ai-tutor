'use client';

import type { Quiz, QuizPerformance, QuizQuestion } from '@/lib/types';
import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Label } from './ui/label';
import { Progress } from './ui/progress';
import { CheckCircle2, XCircle, BookOpen } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Separator } from './ui/separator';

interface QuizTakerProps {
  quiz: Quiz;
  onComplete: (result: Omit<QuizPerformance, 'date'>) => void;
}

type AnswerState = 'unanswered' | 'correct' | 'incorrect';

export function QuizTaker({ quiz, onComplete }: QuizTakerProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<(number | null)[]>(
    Array(quiz.questions.length).fill(null)
  );
  const [answerStates, setAnswerStates] = useState<AnswerState[]>(
    Array(quiz.questions.length).fill('unanswered')
  );
  const [isSubmitted, setIsSubmitted] = useState(false);

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const totalQuestions = quiz.questions.length;

  const handleSelectAnswer = (optionIndex: number) => {
    const newSelectedAnswers = [...selectedAnswers];
    newSelectedAnswers[currentQuestionIndex] = optionIndex;
    setSelectedAnswers(newSelectedAnswers);
  };

  const handleNext = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handleSubmit = () => {
    const newAnswerStates = quiz.questions.map((q, i) => {
      return selectedAnswers[i] === q.answer ? 'correct' : 'incorrect';
    });
    setAnswerStates(newAnswerStates);
    setIsSubmitted(true);
  };

  const handleFinish = () => {
    const score = answerStates.filter(s => s === 'correct').length;
    onComplete({
        subject: quiz.subject,
        score,
        totalQuestions,
    });
  };

  const score = answerStates.filter(s => s === 'correct').length;
  const progress = ((currentQuestionIndex + 1) / totalQuestions) * 100;
  
  if (isSubmitted) {
    return (
        <Card className="animate-in fade-in-50 duration-500">
            <CardHeader>
                <CardTitle>Quiz Results: {quiz.subject}</CardTitle>
                <CardDescription>You scored {score} out of {totalQuestions}!</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="text-center space-y-2">
                    <p className="text-5xl font-bold">{(score / totalQuestions * 100).toFixed(0)}%</p>
                    <Progress value={(score / totalQuestions) * 100} className="w-full" />
                </div>
                <div className="max-h-[400px] overflow-y-auto space-y-4 pr-2">
                    {quiz.questions.map((q, index) => (
                        <div key={index}>
                            <div className="flex items-start gap-3">
                                {answerStates[index] === 'correct' ? 
                                    <CheckCircle2 className="h-5 w-5 text-green-500 mt-1" /> :
                                    <XCircle className="h-5 w-5 text-destructive mt-1" />
                                }
                                <p className="font-medium flex-1">{q.question}</p>
                            </div>
                            <Alert className="mt-2 text-sm bg-muted/50">
                                <BookOpen className="h-4 w-4" />
                                <AlertTitle>Explanation</AlertTitle>
                                <AlertDescription>{q.explanation}</AlertDescription>
                            </Alert>
                        </div>
                    ))}
                </div>
            </CardContent>
            <CardFooter>
                <Button onClick={handleFinish} className="w-full">Finish & View Progress</Button>
            </CardFooter>
        </Card>
    )
  }

  return (
    <Card className="animate-in fade-in-50 duration-500">
      <CardHeader>
        <CardTitle>
          {quiz.subject} Quiz
        </CardTitle>
        <CardDescription>
          Question {currentQuestionIndex + 1} of {totalQuestions}
        </CardDescription>
        <Progress value={progress} className="mt-2" />
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="font-semibold text-lg">{currentQuestion.question}</p>
        <RadioGroup
          value={selectedAnswers[currentQuestionIndex]?.toString()}
          onValueChange={(value) => handleSelectAnswer(parseInt(value))}
        >
          {currentQuestion.options.map((option, index) => (
            <div key={index} className="flex items-center space-x-2">
              <RadioGroupItem value={index.toString()} id={`option-${index}`} />
              <Label htmlFor={`option-${index}`} className="flex-1 text-base font-normal">{option}</Label>
            </div>
          ))}
        </RadioGroup>
      </CardContent>
      <CardFooter className="flex justify-between">
        {currentQuestionIndex === totalQuestions - 1 ? (
          <Button onClick={handleSubmit} disabled={selectedAnswers[currentQuestionIndex] === null} className="w-full">
            Submit Quiz
          </Button>
        ) : (
          <Button onClick={handleNext} disabled={selectedAnswers[currentQuestionIndex] === null} className="w-full">
            Next Question
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
