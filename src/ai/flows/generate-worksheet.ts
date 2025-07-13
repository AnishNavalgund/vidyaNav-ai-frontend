// src/ai/flows/generate-worksheet.ts
'use server';
/**
 * @fileOverview AI agent for generating math worksheets tailored to different grade levels.
 *
 * - generateWorksheet - A function that generates math worksheets based on grade levels.
 * - GenerateWorksheetInput - The input type for the generateWorksheet function.
 * - GenerateWorksheetOutput - The return type for the generateWorksheet function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateWorksheetInputSchema = z.object({
  gradeLevels: z
    .array(z.number().int().min(1).max(12))
    .describe('The grade levels to generate math problems for.'),
  topic: z.string().describe('The topic of the math worksheet.'),
  numberOfProblems: z
    .number()
    .int()
    .min(1)
    .max(20)
    .default(10)
    .describe('The number of math problems to generate for each grade level.'),
});
export type GenerateWorksheetInput = z.infer<typeof GenerateWorksheetInputSchema>;

const GenerateWorksheetOutputSchema = z.object({
  worksheets: z.array(
    z.object({
      gradeLevel: z.number().int(),
      problems: z.array(z.string()),
    })
  ),
});
export type GenerateWorksheetOutput = z.infer<typeof GenerateWorksheetOutputSchema>;

export async function generateWorksheet(input: GenerateWorksheetInput): Promise<GenerateWorksheetOutput> {
  return generateWorksheetFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateWorksheetPrompt',
  input: {schema: GenerateWorksheetInputSchema},
  output: {schema: GenerateWorksheetOutputSchema},
  prompt: `You are an expert math teacher. You will generate math problems for the given grade levels and topic.

Generate {{numberOfProblems}} math problems for each grade level.

Topic: {{{topic}}}

Grade Levels: {{gradeLevels}}

Format the output as a JSON object with a 'worksheets' field. The 'worksheets' field should be an array of objects, where each object has a 'gradeLevel' field and a 'problems' field. The 'problems' field should be an array of strings, where each string is a math problem suitable for that grade level. Ensure that the problems are diverse and cover the topic well. The problems should be challenging, but not too difficult for the given grade level.

For example, if the gradeLevels are [1, 2] and the topic is "Addition", the output should look like this:

{
  "worksheets": [
    {
      "gradeLevel": 1,
      "problems": [
        "1 + 1 = ?",
        "2 + 3 = ?",
        "4 + 5 = ?",
        "6 + 7 = ?",
        "8 + 9 = ?",
        "10 + 2 = ?",
        "3 + 4 = ?",
        "5 + 6 = ?",
        "7 + 8 = ?",
        "9 + 1 = ?"
      ]
    },
    {
      "gradeLevel": 2,
      "problems": [
        "11 + 12 = ?",
        "13 + 14 = ?",
        "15 + 16 = ?",
        "17 + 18 = ?",
        "19 + 20 = ?",
        "21 + 22 = ?",
        "23 + 24 = ?",
        "25 + 26 = ?",
        "27 + 28 = ?",
        "29 + 30 = ?"
      ]
    }
  ]
}
`,
});

const generateWorksheetFlow = ai.defineFlow(
  {
    name: 'generateWorksheetFlow',
    inputSchema: GenerateWorksheetInputSchema,
    outputSchema: GenerateWorksheetOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
