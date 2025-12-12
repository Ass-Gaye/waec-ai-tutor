'use client';

import { getSimplifiedExplanation } from '@/app/actions';
import type { Explanation } from '@/lib/types';
import { BrainCircuit, LoaderCircle, Volume2 } from 'lucide-react';
import React, { useState, useTransition } from 'react';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Button } from './ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from './ui/card';
import { MarkdownRenderer } from './markdown-renderer';

interface ExplanationDisplayProps {
  data: Explanation;
}

export function ExplanationDisplay({ data }: ExplanationDisplayProps) {
  const [currentExplanation, setCurrentExplanation] = useState(data.explanation);
  const [error, setError] = useState<string | null>(null);
  const [isSimplifying, startSimplifying] = useTransition();
  const [isReading, setIsReading] = useState(false);

  const handleSimplify = async () => {
    setError(null);
    startSimplifying(async () => {
      const result = await getSimplifiedExplanation({
        explanation: currentExplanation,
        studentQuestion: data.originalQuestion,
      });
      if (result.data) {
        setCurrentExplanation(result.data);
      } else {
        setError(result.error);
      }
    });
  };

  const handleReadAloud = () => {
    if ('speechSynthesis' in window) {
      const synth = window.speechSynthesis;
      if (synth.speaking) {
        synth.cancel();
        setIsReading(false);
        return;
      }
      // Remove markdown for cleaner speech
      const cleanText = currentExplanation.replace(/\*\*/g, '');
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.onstart = () => setIsReading(true);
      utterance.onend = () => setIsReading(false);
      utterance.onerror = () => setIsReading(false);
      synth.speak(utterance);
    } else {
      alert('Sorry, your browser does not support text-to-speech.');
    }
  };

  React.useEffect(() => {
    // Stop speech synthesis when component unmounts
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  return (
    <Card className="mt-6 animate-in fade-in-50 duration-500">
      <CardHeader>
        <CardTitle className="text-xl">Here's the explanation</CardTitle>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertTitle>Simplification Failed</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <div className="prose prose-sm sm:prose-base max-w-none">
          <MarkdownRenderer text={currentExplanation} />
        </div>
      </CardContent>
      <CardFooter className="flex flex-col sm:flex-row gap-2 justify-end">
        <Button variant="outline" onClick={handleReadAloud} disabled={isSimplifying} className="w-full sm:w-auto">
          <Volume2 className={`mr-2 h-4 w-4 ${isReading ? 'animate-pulse' : ''}`} />
          {isReading ? 'Stop Reading' : 'Read Aloud'}
        </Button>
        <Button onClick={handleSimplify} disabled={isSimplifying} className="w-full sm:w-auto">
          {isSimplifying ? (
            <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <BrainCircuit className="mr-2 h-4 w-4" />
          )}
          I'm still confused
        </Button>
      </CardFooter>
    </Card>
  );
}
