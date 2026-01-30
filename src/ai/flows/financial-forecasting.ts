'use server';

/**
 * @fileOverview AI-powered financial forecasting tool for farm owners.
 *
 * - forecastCashFlow - A function that predicts future cash flow based on sales projections and anticipated expenses.
 * - ForecastCashFlowInput - The input type for the forecastCashFlow function.
 * - ForecastCashFlowOutput - The return type for the forecastCashFlow function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ForecastCashFlowInputSchema = z.object({
  salesForecast: z
    .string()
    .describe(
      'A detailed sales forecast, including projected sales volume and revenue for the upcoming period.'
    ),
  anticipatedExpenses: z
    .string()
    .describe(
      'A comprehensive list of anticipated expenses, including payroll, operational costs, and other financial obligations for the upcoming period.'
    ),
});
export type ForecastCashFlowInput = z.infer<typeof ForecastCashFlowInputSchema>;

const ForecastCashFlowOutputSchema = z.object({
  cashFlowForecast: z
    .string()
    .describe(
      'A detailed cash flow forecast, including projected income, expenses, and net cash flow for the upcoming period.'
    ),
  recommendations: z
    .string()
    .describe(
      'Recommendations for optimizing cash flow based on the forecast results.'
    ),
});
export type ForecastCashFlowOutput = z.infer<typeof ForecastCashFlowOutputSchema>;

export async function forecastCashFlow(input: ForecastCashFlowInput): Promise<ForecastCashFlowOutput> {
  return forecastCashFlowFlow(input);
}

const prompt = ai.definePrompt({
  name: 'forecastCashFlowPrompt',
  input: {schema: ForecastCashFlowInputSchema},
  output: {schema: ForecastCashFlowOutputSchema},
  prompt: `You are a financial advisor specializing in agriculture. Analyze the provided sales forecast and anticipated expenses to generate a cash flow forecast and provide recommendations for optimizing cash flow.

Sales Forecast: {{{salesForecast}}}
Anticipated Expenses: {{{anticipatedExpenses}}}

Based on this information, provide a detailed cash flow forecast and recommendations for the farm owner.`,
});

const forecastCashFlowFlow = ai.defineFlow(
  {
    name: 'forecastCashFlowFlow',
    inputSchema: ForecastCashFlowInputSchema,
    outputSchema: ForecastCashFlowOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
