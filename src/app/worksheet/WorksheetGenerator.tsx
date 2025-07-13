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
import { Loader2, Sparkles, Upload } from 'lucide-react';
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

export function WorksheetGenerator() {
  const [response, setResponse] = useState<string | null>(null);
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
        const res = await fetch('https://<your-cloud-run-url>/generate-worksheet/', {
          method: 'POST',
          body: formData,
        });

        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }

        const jsonResponse = await res.json();
        setResponse(JSON.stringify(jsonResponse, null, 2));

      } catch (error) {
        console.error(error);
        toast({
          title: "Error",
          description: "Failed to generate worksheet. Please check the URL and try again.",
          variant: "destructive",
        });
      }
    });
  }

  return (
    <div className="space-y-8">
      <Card>
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
                    <FormLabel>Grade levels (e.g. Class 3, Class 5)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Class 3, Class 5" {...field} />
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

      {response && (
        <Card>
          <CardHeader>
            <CardTitle className="font-headline flex items-center gap-2">
              <Sparkles className="text-accent h-6 w-6" />
              API Response
            </CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
              <code>{response}</code>
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
