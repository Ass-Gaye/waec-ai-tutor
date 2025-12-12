'use client';

import { Header } from '@/components/header';
import { QuestionExplainer } from '@/components/question-explainer';
import { QuizGenerator } from '@/components/quiz-generator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen text-foreground">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-6 md:py-12">
        <div className="max-w-4xl mx-auto">
          <Tabs defaultValue="explainer" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-muted/80 rounded-xl h-12 border border-white/10">
              <TabsTrigger value="explainer" className="text-base rounded-lg">Explain a Question</TabsTrigger>
              <TabsTrigger value="quiz" className="text-base rounded-lg">Practice with a Quiz</TabsTrigger>
            </TabsList>
            <TabsContent value="explainer" className="mt-8">
              <QuestionExplainer />
            </TabsContent>
            <TabsContent value="quiz" className="mt-8">
              <QuizGenerator />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}