'use client';

import { getQuiz } from '@/app/actions';
import type { Quiz, QuizPerformance } from '@/lib/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircle, BookCopy, LoaderCircle } from 'lucide-react';
import { useState, useTransition, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from './ui/form';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Icons } from './icons';
import { QuizTaker } from './quiz-taker';
import { PerformanceDashboard } from './performance-dashboard';

const FormSchema = z.object({
  subject: z.enum(['Maths', 'English', 'Physics', 'Chemistry', 'Biology'], {
    required_error: 'Please select a subject.',
  }),
  numQuestions: z.coerce.number().min(1, 'At least 1 question.').max(10, 'Max 10 questions.'),
});

const subjectIcons = {
  Maths: <Icons.math className="mr-2 h-4 w-4" />,
  English: <Icons.english className="mr-2 h-4 w-4" />,
  Physics: <Icons.physics className="mr-2 h-4 w-4" />,
  Chemistry: <Icons.chemistry className="mr-2 h-4 w-4" />,
  Biology: <Icons.biology className="mr-2 h-4 w-4" />,
};

export function QuizGenerator() {
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [performanceHistory, setPerformanceHistory] = useState<QuizPerformance[]>([]);

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: { numQuestions: 5 },
  });

  function onSubmit(data: z.infer<typeof FormSchema>) {
    setError(null);
    setQuiz(null);
    startTransition(async () => {
      const result = await getQuiz(data);
      if (result.data) {
        setQuiz(result.data);
      } else {
        setError(result.error);
      }
    });
  }
  
  const handleQuizComplete = (result: Omit<QuizPerformance, 'date'>) => {
    const newPerformanceRecord: QuizPerformance = {
        ...result,
        date: new Date().toISOString(),
    };
    setPerformanceHistory(prev => [...prev, newPerformanceRecord]);
    setQuiz(null); // Return to the main quiz generator view
  };

  const hasTakenQuiz = performanceHistory.length > 0;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl md:text-2xl">
            <BookCopy className="text-primary" />
            WAEC Quiz Generator
          </CardTitle>
          <CardDescription>
            Select a subject and the number of questions to generate a practice quiz. Your progress will be tracked over time.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="subject"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Subject</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a subject..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.keys(subjectIcons).map((subject) => (
                            <SelectItem key={subject} value={subject}>
                              <div className="flex items-center">
                                {subjectIcons[subject as keyof typeof subjectIcons]}
                                {subject}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="numQuestions"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Number of Questions</FormLabel>
                      <FormControl>
                        <Input type="number" min="1" max="10" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" disabled={isPending} className="w-full">
                {isPending ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : null}
                Generate Quiz
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      
      {isPending && (
        <div className="mt-6 flex flex-col items-center justify-center gap-4 text-center p-8 border-2 border-dashed rounded-lg">
            <LoaderCircle className="h-10 w-10 animate-spin text-primary" />
            <p className="font-medium text-lg">Generating your quiz...</p>
            <p className="text-muted-foreground">This might take a few seconds. Good luck!</p>
        </div>
      )}

      {error && (
        <Alert variant="destructive" className="mt-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {quiz && !isPending && (
        <QuizTaker quiz={quiz} onComplete={handleQuizComplete} />
      )}

      {hasTakenQuiz && !quiz && !isPending && (
        <PerformanceDashboard history={performanceHistory} />
      )}
    </div>
  );
}
