'use client';

import { getSimplifiedExplanation, getSpeech } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import type { Explanation } from '@/lib/types';
import { BrainCircuit, LoaderCircle, StopCircle, Volume2 } from 'lucide-react';
import React, { useState, useTransition, useRef, useEffect } from 'react';
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
  const [isGeneratingSpeech, setIsGeneratingSpeech] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { toast } = useToast();

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

  const handleReadAloud = async () => {
    if (audioRef.current && !audioRef.current.paused) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsReading(false);
      return;
    }

    setIsGeneratingSpeech(true);
    const cleanText = currentExplanation.replace(/#|##|###|\*|```[\s\S]*?```/g, '');

    const result = await getSpeech({ text: cleanText });
    setIsGeneratingSpeech(false);

    if (result.data) {
      if (!audioRef.current) {
        audioRef.current = new Audio();
        audioRef.current.onplay = () => setIsReading(true);
        audioRef.current.onpause = () => setIsReading(false);
        audioRef.current.onended = () => setIsReading(false);
      }
      audioRef.current.src = result.data;
      audioRef.current.play();
    } else {
      toast({
        variant: 'destructive',
        title: 'Text-to-Speech Failed',
        description: result.error,
      });
    }
  };

  useEffect(() => {
    // Cleanup audio element when component unmounts
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const isBusy = isSimplifying || isGeneratingSpeech;

  return (
    <Card className="mt-6 animate-in fade-in-50 duration-500 bg-card/80 border-white/10 backdrop-blur-sm">
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
        <div className="prose prose-sm sm:prose-base max-w-none prose-invert prose-p:text-foreground/80 prose-strong:text-foreground">
          <MarkdownRenderer text={currentExplanation} />
        </div>
      </CardContent>
      <CardFooter className="flex flex-col sm:flex-row gap-2 justify-end">
        <Button variant="outline" onClick={handleReadAloud} disabled={isBusy} className="w-full sm:w-auto">
          {isGeneratingSpeech ? (
            <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
          ) : isReading ? (
            <StopCircle className="mr-2 h-4 w-4 animate-pulse" />
          ) : (
            <Volume2 className="mr-2 h-4 w-4" />
          )}
          {isGeneratingSpeech ? 'Generating...' : isReading ? 'Stop Reading' : 'Read Aloud'}
        </Button>
        <Button onClick={handleSimplify} disabled={isBusy} className="w-full sm:w-auto">
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
