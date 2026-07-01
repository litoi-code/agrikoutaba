
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { collection } from "firebase/firestore";
import { useFirestore, addDocumentNonBlocking } from "@/firebase";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

const plotSchema = z.object({
  name: z.string().min(1, "Plot name is required"),
  area: z.coerce.number().positive("Area must be positive"),
  location: z.string().optional(),
  soilType: z.string().optional(),
});

export function AddPlotDialog({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const firestore = useFirestore();
  const t = useTranslations("ProductionPage.AddPlot");

  const form = useForm<z.infer<typeof plotSchema>>({
    resolver: zodResolver(plotSchema),
    defaultValues: {
      name: "",
      area: 0,
      location: "",
      soilType: "",
    },
  });

  const onSubmit = (values: z.infer<typeof plotSchema>) => {
    if (!firestore) return;
    const plotsRef = collection(firestore, "plots");
    addDocumentNonBlocking(plotsRef, {
      ...values,
      createdAt: new Date().toISOString(),
    });
    toast({ title: "Plot Added", description: `${values.name} has been registered.` });
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
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("nameLabel")}</FormLabel>
                  <FormControl><Input placeholder="e.g. Nord Field A" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="area"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("areaLabel")}</FormLabel>
                  <FormControl><Input type="number" step="0.1" placeholder="2.5" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("locationLabel")}</FormLabel>
                  <FormControl><Input placeholder="e.g. Koutaba Sector 3" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="soilType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("soilLabel")}</FormLabel>
                  <FormControl><Input placeholder="e.g. Volcanic / Clay" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit">Register Plot</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
