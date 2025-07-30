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

// Define the answer response type
interface AnswerResponse {
  answer: string;
  analogy_used?: boolean;
  confidence_score?: number;
  model_used?: string;
  source_chunks?: string[];
}

export function InstantKnowledgeForm() {
  const [answer, setAnswer] = useState<AnswerResponse | null>(null);
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
        const res = await fetch('http://localhost:8080/instant-knowledge-upload', {
          method: 'POST',
          body: formData,
        });
  
        if (!res.ok) {
          const errText = await res.text();
          throw new Error(`HTTP error! ${res.status}: ${errText}`);
        }
  
        const jsonResponse = await res.json();
        console.log("🎯 Full AnswerResponse:", jsonResponse);
        setAnswer(jsonResponse); // now storing the entire response object
  
      } catch (error) {
        console.error("❌ QnA error:", error);
        toast({
          title: "Error",
          description: "Failed to get an answer. Please check the URL and try again.",
          variant: "destructive",
        });
      }
    });
  }

  return (
    <div className={`transition-all duration-500 ${answer ? 'grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8' : 'flex justify-center'}`}>
      {/* Input Form */}
      <div className={`${answer ? 'xl:col-span-1' : 'w-full max-w-2xl'}`}>
        <Card className="h-fit">
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
                          <SelectItem value="German">German</SelectItem>
                          <SelectItem value="Italian">Italian</SelectItem>
                          <SelectItem value="French">French</SelectItem>
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
      </div>

            {/* AI Response */}
      {answer && (
        <div className="transform transition-all duration-500 ease-out opacity-0 translate-x-4 animate-[fadeIn_0.5s_ease-out_forwards]">
          <Card className="h-fit shadow-lg bg-card rounded-xl border border-border">
            <CardHeader className="pb-4">
              <CardTitle className="font-headline flex items-center gap-2 text-2xl">
                🧠 AI Generated Answer
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-6">
                {/* Main Answer */}
                <div className="prose prose-lg max-w-none text-foreground bg-muted/50 rounded-lg p-6 border border-border">
                  <p>{answer.answer}</p>
                </div>

                {/* Answer Metadata */}
                <div className="text-sm text-muted-foreground space-y-2">
                  <div className="flex items-center gap-2">
                    <span>🧠 Analogy used:</span>
                    <span className="font-medium">{answer.analogy_used ? "Yes" : "No"}</span>
                  </div>
                  
                  {answer.confidence_score && (
                    <div className="flex items-center gap-2">
                      <span>📊 Confidence:</span>
                      <span className="font-medium">{(answer.confidence_score * 100).toFixed(1)}%</span>
                    </div>
                  )}
                  
                  {answer.model_used && (
                    <div className="flex items-center gap-2">
                      <span>🤖 Model:</span>
                      <span className="font-medium">{answer.model_used}</span>
                    </div>
                  )}

                  {/* Source Chunks */}
                  {answer.source_chunks && answer.source_chunks.length > 0 && (
                    <details className="mt-4">
                      <summary className="cursor-pointer font-medium text-foreground hover:text-primary transition-colors">
                        📚 Source Chunks ({answer.source_chunks.length})
                      </summary>
                      <ul className="list-disc ml-4 mt-2 space-y-1">
                        {answer.source_chunks.map((chunk: string, idx: number) => (
                          <li key={idx} className="text-sm">{chunk}</li>
                        ))}
                      </ul>
                    </details>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
