
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { collection } from "firebase/firestore";
import { useFirestore, addDocumentNonBlocking, type WithId } from "@/firebase";
import { useTranslations } from "next-intl";

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
import { useToast } from "@/hooks/use-toast";
import type { Worker, CropCycle } from "@/lib/types";

const assignmentSchema = z.object({
  workerId: z.string().min(1, "Please select a worker"),
  salary: z.coerce.number().min(0, "Salary must be positive"),
});

export function AssignWorkerDialog({ 
  children, 
  cycle, 
  workers 
}: { 
  children: React.ReactNode, 
  cycle: WithId<CropCycle>,
  workers: WithId<Worker>[]
}) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const firestore = useFirestore();
  const t = useTranslations("ProductionPage.AssignWorker");

  const form = useForm<z.infer<typeof assignmentSchema>>({
    resolver: zodResolver(assignmentSchema),
    defaultValues: {
      workerId: "",
      salary: 0,
    },
  });

  const onSubmit = (values: z.infer<typeof assignmentSchema>) => {
    if (!firestore) return;
    
    const worker = workers.find(w => w.id === values.workerId);
    const workerName = worker ? `${worker.firstName} ${worker.lastName}` : "Worker";

    // 1. Save the assignment
    const assignmentsRef = collection(firestore, "cycleWorkers");
    addDocumentNonBlocking(assignmentsRef, {
      cycleId: cycle.id,
      workerId: values.workerId,
      salary: values.salary,
      assignedAt: new Date().toISOString(),
    });

    // 2. Automatically record an Expense for the labor
    const expensesRef = collection(firestore, "expenses");
    addDocumentNonBlocking(expensesRef, {
      date: new Date().toISOString(),
      description: `Labor: ${workerName} for ${cycle.cropType}`,
      amount: values.salary,
      supplierName: workerName,
      cropCycleId: cycle.id,
      createdAt: new Date().toISOString(),
    });

    toast({ 
      title: t("toastTitle"), 
      description: t("toastDescription", { name: workerName, crop: cycle.cropType }) 
    });
    
    form.reset();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("title", { crop: cycle.cropType })}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="workerId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("workerLabel")}</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t("selectWorkerPlaceholder")} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {workers.map(w => (
                        <SelectItem key={w.id} value={w.id}>{w.firstName} {w.lastName}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="salary"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("salaryLabel")}</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="50000" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit">{t("assignButton")}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
