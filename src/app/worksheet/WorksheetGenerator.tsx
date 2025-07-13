'use client';

import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { generateWorksheet, type GenerateWorksheetOutput } from '@/ai/flows/generate-worksheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Loader2, Sparkles, Printer } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

const formSchema = z.object({
  topic: z.string().min(3, 'Topic must be at least 3 characters.'),
  gradeLevels: z.array(z.number().int().min(1).max(12)).min(1, 'Please select at least one grade level.'),
  numberOfProblems: z.number().int().min(1).max(20),
});

const gradeLevelsOptions = Array.from({ length: 12 }, (_, i) => ({
  id: i + 1,
  label: `Grade ${i + 1}`,
}));

export function WorksheetGenerator() {
  const [worksheetData, setWorksheetData] = useState<GenerateWorksheetOutput | null>(null);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      topic: '',
      gradeLevels: [],
      numberOfProblems: 10,
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    startTransition(async () => {
      setWorksheetData(null);
      try {
        const result = await generateWorksheet(values);
        setWorksheetData(result);
      } catch (error) {
        console.error(error);
        toast({
          title: "Error",
          description: "Failed to generate worksheet. Please try again.",
          variant: "destructive",
        });
      }
    });
  }

  const handlePrint = () => {
    window.print();
  };
  
  return (
    <div className="space-y-8">
      <Card className="print-hidden">
        <CardHeader>
          <CardTitle className="font-headline">Worksheet Details</CardTitle>
          <CardDescription>Fill in the details to create your worksheet.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="topic"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Topic</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Addition, Fractions, Algebra" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="gradeLevels"
                render={() => (
                  <FormItem>
                    <FormLabel>Grade Levels</FormLabel>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                      {gradeLevelsOptions.map((item) => (
                        <FormField
                          key={item.id}
                          control={form.control}
                          name="gradeLevels"
                          render={({ field }) => {
                            return (
                              <FormItem key={item.id} className="flex flex-row items-start space-x-3 space-y-0">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(item.id)}
                                    onCheckedChange={(checked) => {
                                      return checked
                                        ? field.onChange([...field.value, item.id])
                                        : field.onChange(field.value?.filter((value) => value !== item.id));
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="font-normal">{item.label}</FormLabel>
                              </FormItem>
                            );
                          }}
                        />
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="numberOfProblems"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Number of Problems: <Badge variant="secondary">{field.value}</Badge></FormLabel>
                    <FormControl>
                        <Slider
                            min={1}
                            max={20}
                            step={1}
                            value={[field.value]}
                            onValueChange={(vals) => field.onChange(vals[0])}
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

      {worksheetData && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
                <CardTitle className="font-headline flex items-center gap-2">
                    <Sparkles className="text-accent h-6 w-6" />
                    Generated Worksheet: {form.getValues('topic')}
                </CardTitle>
                <CardDescription>Grades: {worksheetData.worksheets.map(w => w.gradeLevel).join(', ')}</CardDescription>
            </div>
            <Button onClick={handlePrint} variant="outline" className="print-hidden">
              <Printer className="mr-2 h-4 w-4" /> Print
            </Button>
          </CardHeader>
          <CardContent className="space-y-8">
            {worksheetData.worksheets.sort((a, b) => a.gradeLevel - b.gradeLevel).map((worksheet) => (
              <div key={worksheet.gradeLevel} className="prose max-w-none">
                <h3 className="text-2xl font-bold font-headline mb-4">Grade {worksheet.gradeLevel}</h3>
                <Separator className="mb-4" />
                <ol className="list-decimal list-inside space-y-4 text-lg">
                  {worksheet.problems.map((problem, index) => (
                    <li key={index} className="pl-2">{problem}</li>
                  ))}
                </ol>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
