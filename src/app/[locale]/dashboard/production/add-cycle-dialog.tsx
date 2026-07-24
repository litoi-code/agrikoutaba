
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { collection } from "firebase/firestore";
import { useFirestore, addDocumentNonBlocking, type WithId } from "@/firebase";
import { useTranslations } from "next-intl";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import type { Plot } from "@/lib/types";

const cycleSchema = z.object({
  plotId: z.string().min(1, "Please select a plot"),
  cropType: z.string().min(1, "Crop type is required"),
  startDate: z.date(),
  estimatedEndDate: z.date().optional(),
});

export function AddCycleDialog({ children, plots }: { children: React.ReactNode, plots: WithId<Plot>[] }) {
  const [open, setOpen] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const { toast } = useToast();
  const firestore = useFirestore();
  const t = useTranslations("ProductionPage.AddCycle");

  const form = useForm<z.infer<typeof cycleSchema>>({
    resolver: zodResolver(cycleSchema),
    defaultValues: {
      plotId: "",
      cropType: "",
      startDate: new Date(),
    },
  });

  const onSubmit = (values: z.infer<typeof cycleSchema>) => {
    if (!firestore) return;
    const cyclesRef = collection(firestore, "cropCycles");
    addDocumentNonBlocking(cyclesRef, {
      ...values,
      startDate: values.startDate.toISOString(),
      estimatedEndDate: values.estimatedEndDate?.toISOString() || null,
      status: "Ongoing",
      createdAt: new Date().toISOString(),
    });
    toast({ title: "Cycle Started", description: `Production of ${values.cropType} has begun.` });
    form.reset();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="plotId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("plotLabel")}</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Select Plot" /></SelectTrigger></FormControl>
                    <SelectContent>
                      {plots.map(plot => (
                        <SelectItem key={plot.id} value={plot.id}>{plot.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="cropType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("cropLabel")}</FormLabel>
                  <FormControl><Input placeholder="e.g. Maize, Banana, Cocoa" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="startDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>{t("startDateLabel")}</FormLabel>
                  <Popover modal={true} open={calendarOpen} onOpenChange={setCalendarOpen}>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button variant="outline" className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                          {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar mode="single" selected={field.value} onSelect={(date) => { field.onChange(date); setCalendarOpen(false); }} initialFocus />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit">Start Cycle</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
