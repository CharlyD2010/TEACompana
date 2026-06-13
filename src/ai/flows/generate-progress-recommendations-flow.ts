'use server';
/**
 * @fileOverview A Genkit flow for generating AI-powered progress recommendations for children with TEA.
 *
 * - generateProgressRecommendations - A function that generates personalized recommendations based on a child's performance.
 * - GenerateProgressRecommendationsInput - The input type for the generateProgressRecommendations function.
 * - GenerateProgressRecommendationsOutput - The return type for the generateProgressRecommendations function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateProgressRecommendationsInputSchema = z.object({
  childId: z.string().describe('The unique identifier of the child.'),
  childName: z.string().describe('The name of the child.'),
  teaLevel: z.enum(['leve', 'moderado', 'severo']).describe('The TEA level of the child.'),
  interests: z.array(z.string()).describe('A list of the childs interests.'),
  learningStyle: z.enum(['visual', 'auditivo', 'kinestésico', 'mixto']).describe('The learning style of the child.'),
  reportPeriod: z.string().describe('The period this report covers (e.g., "semanal", "mensual").'),
  performanceSummary: z.array(
    z.object({
      gameName: z.string().describe('The name of the game or activity.'),
      area: z.string().describe('The developmental area addressed by the game (e.g., "Emociones", "Comunicación").'),
      level: z.number().describe('The level achieved in the game.'),
      score: z.number().describe('The score obtained in the game.'),
      stars: z.number().describe('The number of stars earned (e.g., 0-3).'),
      correctAnswers: z.number().describe('The number of correct answers.'),
      incorrectAnswers: z.number().describe('The number of incorrect answers.'),
      accuracy: z.number().describe('The percentage of correct answers.'),
      durationSeconds: z.number().describe('The duration of the game session in seconds.'),
      isCompleted: z.boolean().describe('Whether the game or activity was completed.'),
    })
  ).describe('A summary of the childs performance in various games and activities.'),
  priorityAreas: z.array(z.string()).describe('Priority areas identified in the childs learning plan.'),
  weeklyGoals: z.array(z.string()).describe('Weekly goals set in the childs learning plan.'),
});
export type GenerateProgressRecommendationsInput = z.infer<typeof GenerateProgressRecommendationsInputSchema>;

const GenerateProgressRecommendationsOutputSchema = z.object({
  strengths: z.string().describe('Detailed description of the childs strengths based on performance data.'),
  areasForImprovement: z.string().describe('Detailed description of areas where the child can improve, based on performance data.'),
  personalizedStrategies: z.string().describe('Actionable and personalized recommendations for parents and teachers to support the childs development, considering their TEA level, interests, and learning style.'),
});
export type GenerateProgressRecommendationsOutput = z.infer<typeof GenerateProgressRecommendationsOutputSchema>;

export async function generateProgressRecommendations(input: GenerateProgressRecommendationsInput): Promise<GenerateProgressRecommendationsOutput> {
  return generateProgressRecommendationsFlow(input);
}

const recommendationPrompt = ai.definePrompt({
  name: 'progressRecommendationPrompt',
  input: { schema: GenerateProgressRecommendationsInputSchema },
  output: { schema: GenerateProgressRecommendationsOutputSchema },
  prompt: `You are an expert in child development and special education, with a focus on supporting children with Autism Spectrum Disorder (TEA). Your task is to analyze a child's recent performance data and provide a comprehensive report for parents and teachers.

The child's details are:
- Name: {{{childName}}}
- TEA Level: {{{teaLevel}}}
- Interests: {{#each interests}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}
- Learning Style: {{{learningStyle}}}

This report covers the {{{reportPeriod}}} period.

Current Learning Plan Context:
- Priority Areas: {{#each priorityAreas}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}
- Weekly Goals: {{#each weeklyGoals}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}

Performance Summary for the {{{reportPeriod}}} period:
{{#each performanceSummary}}
- Game: {{{gameName}}} (Area: {{{area}}}), Level: {{{level}}}
  - Score: {{{score}}}, Stars: {{{stars}}}, Accuracy: {{{accuracy}}}%, Correct: {{{correctAnswers}}}, Incorrect: {{{incorrectAnswers}}}, Duration: {{{durationSeconds}}} seconds, Completed: {{{isCompleted}}}
{{/each}}

Based on this information, please provide a structured analysis highlighting the child's strengths, identifying areas for improvement, and offering personalized, actionable strategies.

Make sure to interpret the performance data, relating it back to their TEA level, interests, and learning style. Provide specific examples or observations where possible.

Output should be in JSON format, strictly adhering to the provided schema, with descriptions for strengths, areasForImprovement, and personalizedStrategies.`,
});

const generateProgressRecommendationsFlow = ai.defineFlow(
  {
    name: 'generateProgressRecommendationsFlow',
    inputSchema: GenerateProgressRecommendationsInputSchema,
    outputSchema: GenerateProgressRecommendationsOutputSchema,
  },
  async (input) => {
    const { output } = await recommendationPrompt(input);
    return output!;
  }
);
