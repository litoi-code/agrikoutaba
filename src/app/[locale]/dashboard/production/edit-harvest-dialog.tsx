"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { doc, updateDoc } from "firebase/firestore";
import { useFirestore, type WithId } from "@/firebase";
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
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import type { Harvest } from "@/lib/types";

const harvestSchema = z.object({
  date: z.date(),
  quantity: z.coerce.number().positive(),
  unit: z.string().min(1),
  salesValue: z.coerce.number().min(0),
});

export function EditHarvestDialog({
  harvest,
  open,
  onOpenChange,
}: {
  harvest: WithId<Harvest> | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [calendarOpen, setCalendarOpen] = useState(false);
  const { toast } = useToast();
  const firestore = useFirestore();
  const t = useTranslations("ProductionPage.AddHarvest");

  const form = useForm<z.infer<typeof harvestSchema>>({
    resolver: zodResolver(harvestSchema),
    defaultValues: {
      date: new Date(),
      quantity: 0,
      unit: "Bags",
      salesValue: 0,
    },
  });

  useEffect(() => {
    if (harvest) {
      form.reset({
        date: new Date(harvest.date),
        quantity: harvest.quantity,
        unit: harvest.unit,
        salesValue: harvest.salesValue,
      });
    }
  }, [harvest, form]);

  const onSubmit = async (values: z.infer<typeof harvestSchema>) => {
    if (!firestore || !harvest) return;
    const harvestRef = doc(firestore, "harvests", harvest.id);
    await updateDoc(harvestRef, {
      ...values,
      date: values.date.toISOString(),
    });
    toast({ title: "Harvest Updated", description: "Harvest record has been updated." });
    setCalendarOpen(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("quantityLabel")}</FormLabel>
                    <FormControl><Input type="number" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="unit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("unitLabel")}</FormLabel>
                    <FormControl><Input placeholder="Bags, Kg, Tons" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="salesValue"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("valueLabel")}</FormLabel>
                  <FormControl><Input type="number" placeholder="500000" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>{t("dateLabel")}</FormLabel>
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
              <Button type="submit">Update Harvest</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}