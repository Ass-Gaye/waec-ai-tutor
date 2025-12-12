'use client';

import { getExplanation } from '@/app/actions';
import type { Explanation } from '@/lib/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircle, LoaderCircle, Mic, Send, Sparkles } from 'lucide-react';
import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { ExplanationDisplay } from './explanation-display';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Form, FormControl, FormField, FormItem, FormMessage } from './ui/form';
import { Textarea } from './ui/textarea';
import { useToast } from '@/hooks/use-toast';

const FormSchema = z.object({
  question: z.string().min(10, {
    message: 'Please enter a full question (at least 10 characters).',
  }),
});

export function QuestionExplainer() {
  const [explanation, setExplanation] = useState<Explanation | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isRecording, setIsRecording] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: { question: '' },
  });

  function onSubmit(data: z.infer<typeof FormSchema>) {
    setError(null);
    setExplanation(null);
    startTransition(async () => {
      const result = await getExplanation(data);
      if (result.data) {
        setExplanation({
          explanation: result.data,
          originalQuestion: data.question,
        });
        form.reset();
      } else {
        setError(result.error);
      }
    });
  }

  const handleMicClick = () => {
    setIsRecording(!isRecording);
    toast({
        title: "Feature in development",
        description: "Audio recording and transcription will be available soon!",
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-2xl">
          <Sparkles className="text-primary" />
          Ask a WAEC Question
        </CardTitle>
        <CardDescription>
          Type your question below, and our AI tutor will provide a step-by-step explanation.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="question"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Textarea
                      placeholder="e.g., 'If x - 2 is a factor of x² + 2x - k, what is the value of k?'"
                      className="resize-none min-h-[120px] text-base"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex items-center justify-between gap-2">
                <Button 
                    type="button" 
                    variant="outline" 
                    size="icon" 
                    onClick={handleMicClick}
                    className={isRecording ? 'bg-destructive/20 text-destructive' : ''}
                    aria-label={isRecording ? "Stop recording" : "Start recording"}
                >
                    <Mic className={`h-5 w-5 ${isRecording ? 'animate-pulse' : ''}`}/>
                </Button>
                <Button type="submit" disabled={isPending} className="w-full max-w-xs">
                {isPending ? (
                  <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Send className="mr-2 h-4 w-4" />
                )}
                Get Explanation
              </Button>
            </div>
          </form>
        </Form>

        {isPending && (
            <div className="mt-6 flex flex-col items-center justify-center gap-4 text-center p-8 border-2 border-dashed rounded-lg">
                <LoaderCircle className="h-10 w-10 animate-spin text-primary" />
                <p className="font-medium text-lg">Our AI Tutor is thinking...</p>
                <p className="text-muted-foreground">Please wait a moment while we prepare your explanation.</p>
            </div>
        )}

        {error && (
            <Alert variant="destructive" className="mt-6">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
            </Alert>
        )}
      </CardContent>

      {explanation && <ExplanationDisplay data={explanation} />}
    </Card>
  );
}
