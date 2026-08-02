"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {useFirestore, type WithId, doc, updateDoc} from "@/firebase";
import { useTranslations } from "next-intl";

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
import { useToast } from "@/hooks/use-toast";
import type { Plot } from "@/lib/types";

const plotSchema = z.object({
  name: z.string().min(1, "Plot name is required"),
  area: z.coerce.number().positive("Area must be positive"),
  location: z.string().optional(),
  soilType: z.string().optional(),
});

export function EditPlotDialog({
  plot,
  open,
  onOpenChange,
}: {
  plot: WithId<Plot> | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
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

  useEffect(() => {
    if (plot) {
      form.reset({
        name: plot.name,
        area: plot.area,
        location: plot.location || "",
        soilType: plot.soilType || "",
      });
    }
  }, [plot, form]);

  const onSubmit = async (values: z.infer<typeof plotSchema>) => {
    if (!firestore || !plot) return;
    const plotRef = doc(firestore, "plots", plot.id);
    await updateDoc(plotRef, values);
    toast({ title: "Plot Updated", description: `${values.name} has been updated.` });
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
              <Button type="submit">Update Plot</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}