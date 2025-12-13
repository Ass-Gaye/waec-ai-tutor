'use client';

import { getExplanation, getTranscription } from '@/app/actions';
import type { Explanation } from '@/lib/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircle, LoaderCircle, Mic, Paperclip, Send, StopCircle, X } from 'lucide-react';
import { useState, useTransition, useRef } from 'react';
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
  question: z.string(),
  photoDataUri: z.string().optional(),
});

export function QuestionExplainer() {
  const [explanation, setExplanation] = useState<Explanation | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const { toast } = useToast();
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: { question: '', photoDataUri: undefined },
  });

  function onSubmit(data: z.infer<typeof FormSchema>) {
    setError(null);
    setExplanation(null);
    startTransition(async () => {
      const result = await getExplanation(data);
      if (result.data) {
        setExplanation({
          explanation: result.data,
          originalQuestion: data.question || "question from image",
        });
        form.reset();
        setImagePreview(null);
      } else {
        setError(result.error);
      }
    });
  }

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUri = reader.result as string;
        form.setValue('photoDataUri', dataUri);
        setImagePreview(dataUri);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    form.setValue('photoDataUri', undefined);
    setImagePreview(null);
    if (fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  };

  const handleStartRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      audioChunksRef.current = [];

      mediaRecorderRef.current.addEventListener('dataavailable', (event) => {
        audioChunksRef.current.push(event.data);
      });

      mediaRecorderRef.current.addEventListener('stop', async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
          const base64Audio = reader.result as string;
          setIsTranscribing(true);
          const result = await getTranscription({ audioDataUri: base64Audio });
          setIsTranscribing(false);
          if (result.data) {
            form.setValue('question', result.data);
          } else {
            toast({
              variant: 'destructive',
              title: 'Transcription failed',
              description: result.error,
            });
          }
        };
        stream.getTracks().forEach(track => track.stop());
      });

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (err) {
      console.error('Error accessing microphone:', err);
      toast({
        variant: 'destructive',
        title: 'Microphone access denied',
        description: 'Please allow microphone access in your browser settings to use this feature.',
      });
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleMicClick = () => {
    if (isRecording) {
      handleStopRecording();
    } else {
      handleStartRecording();
    }
  };

  const isProcessingAudio = isRecording || isTranscribing;

  return (
    <Card className="shadow-lg bg-card/80 border border-white/10 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl md:text-2xl">
          Ask a WAEC Question
        </CardTitle>
        <CardDescription className="text-sm text-muted-foreground">
          Type your question, upload a picture, or use the microphone to ask it out loud.
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
                      placeholder="e.g., 'If x - 2 is a factor of x² + 2x - k, what is the value of k?' or describe the image you've uploaded."
                      className="resize-none min-h-[120px] text-base bg-transparent/20"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {imagePreview && (
              <div className="relative w-full max-w-sm">
                <img src={imagePreview} alt="Question preview" className="rounded-lg w-full h-auto object-cover" />
                <Button 
                  type="button" 
                  variant="destructive" 
                  size="icon" 
                  className="absolute top-2 right-2 h-7 w-7"
                  onClick={handleRemoveImage}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
            
            <div className="flex flex-col sm:flex-row items-center gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={isPending}
                className="w-full sm:w-auto"
                aria-label="Upload an image"
              >
                  <Paperclip className="mr-2 h-4 w-4" />
                 <span className="sm:hidden">Upload Image</span>
                 <span className="hidden sm:inline">Upload</span>
              </Button>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleImageChange}
                className="hidden" 
                accept="image/*"
              />

              <Button
                type="button"
                variant="outline"
                onClick={handleMicClick}
                disabled={isTranscribing || isPending}
                className={`w-full sm:w-auto ${isRecording ? 'bg-destructive/20 text-destructive' : ''}`}
                aria-label={isRecording ? 'Stop recording' : 'Start recording'}
              >
                {isTranscribing ? (
                  <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                ) : isRecording ? (
                  <StopCircle className="mr-2 h-4 w-4 animate-pulse" />
                ) : (
                  <Mic className="mr-2 h-4 w-4" />
                )}
                <span className="sm:hidden">{isRecording ? 'Stop Recording' : 'Record Audio'}</span>
                 <span className="hidden sm:inline">{isRecording ? 'Stop' : 'Record'}</span>
              </Button>
              <Button type="submit" disabled={isPending || isProcessingAudio} className="w-full font-semibold">
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
          <div className="mt-6 flex flex-col items-center justify-center gap-4 text-center p-8 border-2 border-dashed border-white/20 rounded-lg bg-muted/50">
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
