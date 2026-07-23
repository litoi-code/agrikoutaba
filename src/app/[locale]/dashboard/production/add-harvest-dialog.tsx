
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { collection, doc } from "firebase/firestore";
import { useFirestore, addDocumentNonBlocking, updateDocumentNonBlocking, type WithId } from "@/firebase";
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
import type { CropCycle } from "@/lib/types";

const harvestSchema = z.object({
  cycleId: z.string().min(1, "Please select a cycle"),
  date: z.date(),
  quantity: z.coerce.number().positive(),
  unit: z.string().min(1),
  salesValue: z.coerce.number().min(0),
});

export function AddHarvestDialog({ children, cycles }: { children: React.ReactNode, cycles: WithId<CropCycle>[] }) {
  // Trigger re-build
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const firestore = useFirestore();
  const t = useTranslations("ProductionPage.AddHarvest");

  const form = useForm<z.infer<typeof harvestSchema>>({
    resolver: zodResolver(harvestSchema),
    defaultValues: {
      cycleId: "",
      date: new Date(),
      quantity: 0,
      unit: "Bags",
      salesValue: 0,
    },
  });

  const onSubmit = (values: z.infer<typeof harvestSchema>) => {
    if (!firestore) return;
    const harvestsRef = collection(firestore, "harvests");
    addDocumentNonBlocking(harvestsRef, {
      ...values,
      date: values.date.toISOString(),
      createdAt: new Date().toISOString(),
    });

    // Automatically update cycle status to Harvested
    const cycleRef = doc(firestore, "cropCycles", values.cycleId);
    updateDocumentNonBlocking(cycleRef, { status: "Harvested" });

    // Also record an Income automatically
    const incomesRef = collection(firestore, "incomes");
    addDocumentNonBlocking(incomesRef, {
      date: values.date.toISOString(),
      description: `Harvest Sales: ${values.quantity} ${values.unit}`,
      amount: values.salesValue,
      customerName: "Market/Wholesale",
      cropCycleId: values.cycleId,
      createdAt: new Date().toISOString(),
    });

    toast({ title: "Harvest Recorded", description: "Harvest and sales income logged successfully." });
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
              name="cycleId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("cycleLabel")}</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Select Cycle" /></SelectTrigger></FormControl>
                    <SelectContent>
                      {cycles.filter(c => c.status === 'Ongoing').map(c => (
                        <SelectItem key={c.id} value={c.id}>{c.cropType} (Start: {format(new Date(c.startDate), 'PP')})</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
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
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button variant="outline" className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                          {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit">Record Harvest</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
