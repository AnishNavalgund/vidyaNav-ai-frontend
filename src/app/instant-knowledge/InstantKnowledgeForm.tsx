'use client';

import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { answerStudentQuestion } from '@/ai/flows/instant-knowledge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Loader2, Sparkles } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  question: z.string().min(10, {
    message: 'Please enter a question with at least 10 characters.',
  }),
});

export function InstantKnowledgeForm() {
  const [answer, setAnswer] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      question: '',
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    startTransition(async () => {
      setAnswer(null);
      try {
        const result = await answerStudentQuestion(values);
        setAnswer(result.answer);
      } catch (error) {
        console.error(error);
        toast({
          title: "Error",
          description: "Failed to get an answer. Please try again.",
          variant: "destructive",
        });
      }
    });
  }

  return (
    <div className="space-y-8">
      <Card>
        <CardContent className="p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="question"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-lg">Student's Question</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="e.g., 'Why is the sky blue?' or 'How does a seed grow into a plant?'"
                        className="min-h-[120px] resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isPending} className="w-full sm:w-auto">
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Getting Answer...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Get Answer
                  </>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {answer && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="font-headline flex items-center gap-2">
              <Sparkles className="text-accent h-6 w-6" />
              AI Generated Answer
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-lg max-w-none text-foreground">
                <p>{answer}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
