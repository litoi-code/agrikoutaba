'use server';

import { forecastCashFlow } from '@/ai/flows/financial-forecasting';
import { z } from 'zod';

const ForecastSchema = z.object({
  salesForecast: z.string().min(10, "Please provide a more detailed sales forecast."),
  anticipatedExpenses: z.string().min(10, "Please provide more detailed anticipated expenses."),
});

export type FormState = {
  success: boolean;
  message: string;
  data?: {
    cashFlowForecast: string;
    recommendations: string;
  };
};

export async function generateForecastAction(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const validatedFields = ForecastSchema.safeParse({
    salesForecast: formData.get('salesForecast'),
    anticipatedExpenses: formData.get('anticipatedExpenses'),
  });

  if (!validatedFields.success) {
    return {
      success: false,
      message: 'Invalid form data. Please check your inputs.',
      data: undefined,
    };
  }
  
  try {
    const result = await forecastCashFlow(validatedFields.data);
    return {
      success: true,
      message: 'Forecast generated successfully.',
      data: result,
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      message: 'Failed to generate forecast. Please try again later.',
      data: undefined,
    };
  }
}
