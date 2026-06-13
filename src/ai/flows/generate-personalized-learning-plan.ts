'use server';
/**
 * @fileOverview A Genkit flow for generating a personalized learning plan for a child with TEA.
 *
 * - generateLearningPlan - A function that handles the generation of the learning plan.
 * - GenerateLearningPlanInput - The input type for the generateLearningPlan function.
 * - GenerateLearningPlanOutput - The return type for the generateLearningPlan function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AssessmentScoresSchema = z.object({
  emociones: z
    .number()
    .min(1)
    .max(5)
    .describe('Score for emotions (1-5, 1=requires much support, 5=independent).'),
  comunicacion: z
    .number()
    .min(1)
    .max(5)
    .describe('Score for communication (1-5, 1=requires much support, 5=independent).'),
  social: z
    .number()
    .min(1)
    .max(5)
    .describe('Score for social skills (1-5, 1=requires much support, 5=independent).'),
  cognitivo: z
    .number()
    .min(1)
    .max(5)
    .describe('Score for cognitive skills (1-5, 1=requires much support, 5=independent).'),
  motricidad: z
    .number()
    .min(1)
    .max(5)
    .describe('Score for motor skills (1-5, 1=requires much support, 5=independent).'),
  rutinas: z
    .number()
    .min(1)
    .max(5)
    .describe('Score for routines (1-5, 1=requires much support, 5=independent).'),
});

const GenerateLearningPlanInputSchema = z.object({
  childName: z.string().describe('The name of the child.'),
  teaLevel: z
    .enum(['leve', 'moderado', 'severo'])
    .describe('The TEA level of the child.'),
  interests: z.array(z.string()).describe('The interests of the child.'),
  learningStyle: z
    .enum(['visual', 'auditivo', 'kinestésico', 'mixto'])
    .describe('The preferred learning style of the child.'),
  assessmentResults: AssessmentScoresSchema.describe(
    'The detailed results of the initial assessment, with scores from 1 to 5 for each area.'
  ),
});

export type GenerateLearningPlanInput = z.infer<
  typeof GenerateLearningPlanInputSchema
>;

const GenerateLearningPlanOutputSchema = z.object({
  priorityAreas: z
    .array(z.string())
    .describe('A list of prioritized learning areas based on the assessment.'),
  weeklyGoals: z
    .array(z.string())
    .describe('A list of specific, achievable weekly goals for the child.'),
  recommendedActivities: z
    .array(z.string())
    .describe(
      'A list of recommended activities tailored to the child\u0027s needs and interests.'
    ),
  suggestionsForParents: z
    .array(z.string())
    .describe('Specific suggestions for parents to support the child at home.'),
  suggestionsForTeachers: z
    .array(z.string())
    .describe('Specific suggestions for teachers to support the child in the classroom.'),
});

export type GenerateLearningPlanOutput = z.infer<
  typeof GenerateLearningPlanOutputSchema
>;

export async function generateLearningPlan(
  input: GenerateLearningPlanInput
): Promise<GenerateLearningPlanOutput> {
  return generateLearningPlanFlow(input);
}

const learningPlanPrompt = ai.definePrompt({
  name: 'learningPlanPrompt',
  input: {schema: GenerateLearningPlanInputSchema},
  output: {schema: GenerateLearningPlanOutputSchema},
  prompt: `Eres un experto en desarrollo infantil y educación especial, especializado en niños con Trastorno del Espectro Autista (TEA).

Basándote en los resultados de la evaluación inicial y el perfil del niño, debes generar un plan de aprendizaje personalizado que incluya:
- Áreas prioritarias de desarrollo.
- Objetivos semanales claros y alcanzables.
- Actividades recomendadas que se alineen con los intereses y estilo de aprendizaje del niño.
- Sugerencias específicas para que los padres apoyen al niño en casa.
- Sugerencias específicas para que los docentes apoyen al niño en el aula.

Ten en cuenta que las puntuaciones de la evaluación son de 1 a 5, donde 1 significa 'Requiere mucho apoyo' y 5 significa 'Lo realiza de forma independiente'. Las áreas con puntuaciones bajas son las que requieren mayor prioridad.

--- Perfil del Niño ---
Nombre: {{{childName}}}
Nivel TEA: {{{teaLevel}}}
Intereses: {{#each interests}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}
Estilo de Aprendizaje: {{{learningStyle}}}

--- Resultados de la Evaluación ---
Emociones: {{{assessmentResults.emociones}}}
Comunicación: {{{assessmentResults.comunicacion}}}
Social: {{{assessmentResults.social}}}
Cognitivo: {{{assessmentResults.cognitivo}}}
Motricidad: {{{assessmentResults.motricidad}}}
Rutinas: {{{assessmentResults.rutinas}}}

Genera el plan de aprendizaje en formato JSON, siguiendo estrictamente el esquema de salida proporcionado.`,
});

const generateLearningPlanFlow = ai.defineFlow(
  {
    name: 'generateLearningPlanFlow',
    inputSchema: GenerateLearningPlanInputSchema,
    outputSchema: GenerateLearningPlanOutputSchema,
  },
  async (input) => {
    const {output} = await learningPlanPrompt(input);
    return output!;
  }
);
