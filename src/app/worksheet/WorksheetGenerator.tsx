'use client';

import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Sparkles, Upload, ExternalLink } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

const formSchema = z.object({
  textbookImage: z
    .any()
    .refine((files) => files?.length === 1, "Textbook image is required.")
    .refine((files) => files?.[0]?.size <= MAX_FILE_SIZE, `Max file size is 5MB.`)
    .refine(
      (files) => ACCEPTED_IMAGE_TYPES.includes(files?.[0]?.type),
      ".jpg, .jpeg, .png and .webp files are accepted."
    ),
  gradeLevels: z.string().min(1, 'Please enter at least one grade level.'),
  language: z.string({
    required_error: "Please select a language.",
  }),
});

// Helper function to convert markdown-like text to HTML and hide answers
function convertMarkdownToHtml(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong class="text-primary font-semibold">$1</strong>')
    .replace(/\*(.*?)\*/g, '<em class="text-muted-foreground">$1</em>')
    .replace(/\n\n/g, '</p><p class="mb-4 leading-relaxed">')
    .replace(/\n/g, '<br>')
    .replace(/`(.*?)`/g, '<code class="bg-muted px-1 py-0.5 rounded text-sm font-mono break-words">$1</code>')
    // Hide answers by replacing them with blank spaces
    .replace(/\(Write the name here: .*?\)/g, '(Write the name here: _________________________)')
    .replace(/\(Write the phone number here: .*?\)/g, '(Write the phone number here: _________________________)')
    .replace(/\(Write the date here: .*?\)/g, '(Write the date here: _________________________)')
    .replace(/\(Write the city name here: .*?\)/g, '(Write the city name here: _________________________)')
    .replace(/\(Write .*? here: .*?\)/g, '(Write your answer here: _________________________)')
    .replace(/^/, '<p class="mb-4 leading-relaxed">')
    .replace(/([^>])$/, '$1</p>');
}

// Helper function to render worksheet content
function renderWorksheetContent(data: any): React.ReactNode {
  if (typeof data === 'string') {
    return (
      <div 
        className="prose prose-lg max-w-none text-foreground"
        dangerouslySetInnerHTML={{ __html: convertMarkdownToHtml(data) }}
      />
    );
  }

  if (typeof data === 'object' && data !== null) {
    // Handle grade-specific worksheet format (e.g., grade_1, grade_2, etc.)
    const gradeKeys = Object.keys(data).filter(key => key.startsWith('grade_'));
    if (gradeKeys.length > 0) {
      return (
        <div className="space-y-8">
          {gradeKeys.map((gradeKey) => {
            const gradeNumber = gradeKey.replace('grade_', '');
            const worksheetContent = data[gradeKey];
            
            return (
              <div key={gradeKey} className="bg-white rounded-lg p-6 border border-border shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="text-primary font-bold text-sm">{gradeNumber}</span>
                  </div>
                  <h3 className="text-xl font-bold text-primary">
                    Grade {gradeNumber} Worksheet
                  </h3>
                </div>
                <div 
                  className="prose prose-lg max-w-none text-foreground break-words"
                  dangerouslySetInnerHTML={{ __html: convertMarkdownToHtml(worksheetContent) }}
                />
              </div>
            );
          })}
        </div>
      );
    }

    // Handle worksheets array format
    if (data.worksheets) {
      return (
        <div className="space-y-6">
          {data.worksheets.map((worksheet: any, index: number) => (
            <div key={index} className="bg-white rounded-lg p-6 border border-border shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                  <span className="text-primary font-bold text-sm">{worksheet.gradeLevel}</span>
                </div>
                <h3 className="text-xl font-bold text-primary">
                  Grade {worksheet.gradeLevel} Worksheet
                </h3>
              </div>
              <div className="space-y-3">
                {worksheet.problems?.map((problem: string, pIndex: number) => (
                  <div key={pIndex} className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                    <span className="text-sm font-bold text-primary min-w-[2rem] bg-white rounded-full w-6 h-6 flex items-center justify-center shadow-sm">
                      {pIndex + 1}
                    </span>
                    <div 
                      className="flex-1 text-foreground break-words leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: convertMarkdownToHtml(problem) }}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      );
    }

    if (data.content) {
      return (
        <div 
          className="prose prose-lg max-w-none text-foreground break-words"
          dangerouslySetInnerHTML={{ __html: convertMarkdownToHtml(data.content) }}
        />
      );
    }

    // Fallback: display as JSON
    return (
      <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
        <code>{JSON.stringify(data, null, 2)}</code>
      </pre>
    );
  }

  return <div className="text-muted-foreground">No content available</div>;
}

export function WorksheetGenerator() {
  const [response, setResponse] = useState<any>(null);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      gradeLevels: '',
      language: 'English',
    },
  });

  const fileRef = form.register("textbookImage");

  async function onSubmit(values: z.infer<typeof formSchema>) {
    startTransition(async () => {
      setResponse(null);
  
      const formData = new FormData();
      formData.append('file', values.textbookImage[0]);
      formData.append('grades', values.gradeLevels);
      formData.append('language', values.language);
  
      try {
        const res = await fetch('http://localhost:8080/generate-worksheet/', {
          method: 'POST',
          body: formData,
        });
  
        console.log("📡 Response received:", res);
        const contentType = res.headers.get("content-type");
        console.log("📄 Content-Type:", contentType);
  
        if (!res.ok) {
          const errorText = await res.text();
          console.error("❌ Backend returned error:", errorText);
          throw new Error(`HTTP ${res.status}`);
        }
  
        let data;
        if (contentType && contentType.includes("application/json")) {
          data = await res.json();
          console.log("✅ JSON response:", data);
        } else {
          data = await res.text();
          console.warn("⚠️ Non-JSON response:", data);
        }
  
        setResponse(data);
  
      } catch (error: any) {
        console.error("❌ Fetch failed:", error.message);
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      }
    });
  }
  

  return (
    <div className={`transition-all duration-500 ${response ? 'grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8' : 'flex justify-center'}`}>
      {/* Input Form */}
      <div className={`${response ? 'lg:col-span-1' : 'w-full max-w-2xl'}`}>
        <Card className="h-fit">
          <CardHeader>
            <CardTitle className="font-headline">Worksheet Details</CardTitle>
            <CardDescription>Upload a textbook page to generate a worksheet.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="textbookImage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Upload textbook image</FormLabel>
                      <FormControl>
                        <Input type="file" accept="image/*" {...fileRef} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="gradeLevels"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Grade levels (e.g. 1,2,3)</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. 1,2,3" {...field} />
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

                <Button type="submit" disabled={isPending} className="w-full sm:w-auto">
                  {isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Generate Worksheet
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>

      {/* AI Response */}
      {response && (
        <div className="transform transition-all duration-500 ease-out opacity-0 translate-x-4 animate-[fadeIn_0.5s_ease-out_forwards] lg:col-span-2">
          <Card className="h-fit shadow-lg bg-card rounded-xl border border-border">
            <CardHeader className="pb-4">
              <CardTitle className="font-headline flex items-center gap-2 text-2xl">
                📘 AI-Generated Worksheet
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-6">
                {/* Worksheet Metadata */}
                <div className="text-sm text-muted-foreground space-y-2">
                  <div className="flex items-center gap-2">
                    <span>📚 Grade Levels:</span>
                    <span className="font-medium">
                      {Object.keys(response).filter(key => key.startsWith('grade_')).map(key => 
                        `Grade ${key.replace('grade_', '')}`
                      ).join(', ')}
                    </span>
                  </div>
                  
                  {response.language && (
                    <div className="flex items-center gap-2">
                      <span>🌐 Language:</span>
                      <span className="font-medium">{response.language}</span>
                    </div>
                  )}
                  
                  {response.model_used && (
                    <div className="flex items-center gap-2">
                      <span>🤖 Model:</span>
                      <span className="font-medium">{response.model_used}</span>
                    </div>
                  )}

                  {response.confidence_score && (
                    <div className="flex items-center gap-2">
                      <span>📊 Confidence:</span>
                      <span className="font-medium">{(response.confidence_score * 100).toFixed(1)}%</span>
                    </div>
                  )}
                </div>

                {/* Source Image Link */}
                {response.source_image_url && (
                  <div className="flex items-center gap-2 p-3 bg-primary/5 rounded-lg border border-primary/20">
                    <ExternalLink className="h-4 w-4 text-primary" />
                    <a 
                      href={response.source_image_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:text-primary/80 font-medium transition-colors"
                    >
                      📎 View Uploaded Image
                    </a>
                  </div>
                )}

                {/* Worksheet Content */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-lg font-semibold text-primary">
                    <span>📝 Worksheet Content</span>
                    <span className="text-sm font-normal text-muted-foreground">
                      ({Object.keys(response).filter(key => key.startsWith('grade_')).length} grade{Object.keys(response).filter(key => key.startsWith('grade_')).length > 1 ? 's' : ''})
                    </span>
                  </div>
                  
                  <div className="bg-muted/50 rounded-lg p-6 border border-border">
                    {renderWorksheetContent(response)}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
