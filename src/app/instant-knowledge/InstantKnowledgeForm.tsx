'use client';

import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Sparkles } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ACCEPTED_FILE_TYPES = ["application/pdf"];

const formSchema = z.object({
  question: z.string().min(10, {
    message: 'Please enter a question with at least 10 characters.',
  }),
  gradeLevel: z.coerce.number().int().min(1, "Grade level is required.").max(12, "Grade level must be between 1 and 12."),
  language: z.string({
    required_error: "Please select a language.",
  }),
  textbookPdf: z
    .any()
    .refine((files) => files?.length === 1, "Textbook PDF is required.")
    .refine((files) => files?.[0]?.size <= MAX_FILE_SIZE, `Max file size is 10MB.`)
    .refine(
      (files) => ACCEPTED_FILE_TYPES.includes(files?.[0]?.type),
      "Only .pdf files are accepted."
    ),
});

export function InstantKnowledgeForm() {
  const [answer, setAnswer] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      question: '',
      language: 'English',
    },
  });

  const fileRef = form.register("textbookPdf");

  async function onSubmit(values: z.infer<typeof formSchema>) {
    startTransition(async () => {
      setAnswer(null);

      const formData = new FormData();
      formData.append('question', values.question);
      formData.append('grade_level', values.gradeLevel.toString());
      formData.append('language', values.language);
      formData.append('textbook', values.textbookPdf[0]);

      try {
        const res = await fetch('https://<your-cloud-run-url>/instant-knowledge-upload', {
          method: 'POST',
          body: formData,
        });

        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }

        const jsonResponse = await res.json();
        setAnswer(jsonResponse.answer);

      } catch (error) {
        console.error(error);
        toast({
          title: "Error",
          description: "Failed to get an answer. Please check the URL and try again.",
          variant: "destructive",
        });
      }
    });
  }

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Question Details</CardTitle>
          <CardDescription>Provide the student's question and relevant textbook context.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="question"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type out the question</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="e.g., 'Why is the sky blue?' or 'How does a seed grow into a plant?'"
                        className="min-h-[100px] resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="gradeLevel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Grade Level</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="e.g. 4" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="language"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Language</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a language" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="English">English</SelectItem>
                        <SelectItem value="Hindi">Hindi</SelectItem>
                        <SelectItem value="Kannada">Kannada</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="textbookPdf"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Upload textbook PDF</FormLabel>
                    <FormControl>
                      <Input type="file" accept=".pdf" {...fileRef} />
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
