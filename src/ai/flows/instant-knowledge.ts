// src/ai/flows/instant-knowledge.ts
'use server';
/**
 * @fileOverview A tool to quickly answer common student questions using AI.
 *
 * - answerStudentQuestion - A function that handles answering student questions.
 * - AnswerStudentQuestionInput - The input type for the answerStudentQuestion function.
 * - AnswerStudentQuestionOutput - The return type for the answerStudentQuestion function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnswerStudentQuestionInputSchema = z.object({
  question: z.string().describe('The question the student asked.'),
});
export type AnswerStudentQuestionInput = z.infer<typeof AnswerStudentQuestionInputSchema>;

const AnswerStudentQuestionOutputSchema = z.object({
  answer: z.string().describe('The answer to the student question.'),
});
export type AnswerStudentQuestionOutput = z.infer<typeof AnswerStudentQuestionOutputSchema>;

export async function answerStudentQuestion(input: AnswerStudentQuestionInput): Promise<AnswerStudentQuestionOutput> {
  return answerStudentQuestionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'answerStudentQuestionPrompt',
  input: {schema: AnswerStudentQuestionInputSchema},
  output: {schema: AnswerStudentQuestionOutputSchema},
  prompt: `You are a helpful teacher. A student asked the following question:

{{question}}

Answer the question in a way that is easy for a student to understand.`,
});

const answerStudentQuestionFlow = ai.defineFlow(
  {
    name: 'answerStudentQuestionFlow',
    inputSchema: AnswerStudentQuestionInputSchema,
    outputSchema: AnswerStudentQuestionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
