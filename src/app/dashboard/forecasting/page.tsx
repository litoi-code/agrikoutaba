"use client";

import { useFormState, useFormStatus } from "react-dom";
import { generateForecastAction, type FormState } from "@/app/actions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { BrainCircuit, Bot, Loader2, Lightbulb, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";

const initialState: FormState = {
  success: false,
  message: "",
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Generating...
        </>
      ) : (
        <>
          <BrainCircuit className="mr-2 h-4 w-4" />
          Generate Forecast
        </>
      )}
    </Button>
  );
}

export default function ForecastingPage() {
  const [state, formAction] = useFormState(generateForecastAction, initialState);
  const { toast } = useToast();

  useEffect(() => {
    if (state.message && !state.success) {
      toast({
        variant: "destructive",
        title: "Error",
        description: state.message,
      });
    }
  }, [state, toast]);

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-3xl font-headline font-bold">AI Financial Forecasting</h1>
      
      <div className="grid lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-1">
          <form action={formAction}>
            <CardHeader>
              <CardTitle>Input Data</CardTitle>
              <CardDescription>
                Provide your sales projections and anticipated expenses to generate a cash flow forecast.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="salesForecast">Sales Forecast</Label>
                <Textarea
                  id="salesForecast"
                  name="salesForecast"
                  placeholder="e.g., Expecting to sell 500 units of tomatoes at $2/unit, 1000 units of corn at $1/unit..."
                  className="min-h-[150px]"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="anticipatedExpenses">Anticipated Expenses</Label>
                <Textarea
                  id="anticipatedExpenses"
                  name="anticipatedExpenses"
                  placeholder="e.g., Payroll: $3500, Fertilizer: $500, Fuel: $200, Loan payment: $1000..."
                  className="min-h-[150px]"
                  required
                />
              </div>
            </CardContent>
            <CardFooter>
              <SubmitButton />
            </CardFooter>
          </form>
        </Card>

        <div className="lg:col-span-2">
          {state.success && state.data ? (
            <div className="space-y-8">
              <Card>
                <CardHeader className="flex-row gap-4 items-center">
                  <TrendingUp className="w-8 h-8 text-primary" />
                  <div>
                    <CardTitle>Cash Flow Forecast</CardTitle>
                    <CardDescription>AI-generated projection based on your inputs.</CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-wrap">{state.data.cashFlowForecast}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex-row gap-4 items-center">
                  <Lightbulb className="w-8 h-8 text-amber-500" />
                  <div>
                    <CardTitle>Recommendations</CardTitle>
                    <CardDescription>Suggestions for optimizing your cash flow.</CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-wrap">{state.data.recommendations}</p>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card className="flex flex-col items-center justify-center h-full min-h-[400px]">
              <CardContent className="text-center">
                <Bot className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">Awaiting Your Data</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Your forecast results will appear here once generated.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
