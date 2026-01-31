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
import { Textarea } from "@/components/ui/textarea";
import { DatePicker } from "@/components/ui/datepicker";
import { useToast } from "@/hooks/use-toast";

const investmentSchema = z.object({
  investorName: z.string().min(1, "Investor name is required"),
  description: z.string().min(1, "Description is required"),
  amount: z.coerce.number().positive("Amount must be positive"),
  date: z.date({ required_error: "Please select a date." }),
  equityDetails: z.string().min(1, "Equity details are required"),
});

export function AddInvestmentDialog({
  children,
}: {
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const firestore = useFirestore();
  const t = useTranslations("InvestmentsPage.AddInvestmentDialog");

  const form = useForm<z.infer<typeof investmentSchema>>({
    resolver: zodResolver(investmentSchema),
  });

  const onSubmit = (values: z.infer<typeof investmentSchema>) => {
    if (!firestore) return;
    const investmentsRef = collection(firestore, "investments");
    addDocumentNonBlocking(investmentsRef, {
      ...values,
      date: values.date.toISOString(),
    });
    toast({
      title: t("toastTitle"),
      description: t("toastDescription", {
        investorName: values.investorName,
      }),
    });
    form.reset();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription>{t("description")}</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 py-4"
          >
            <FormField
              control={form.control}
              name="investorName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("investorNameLabel")}</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Venture Capital Inc." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("descriptionLabel")}</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Series A Funding" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("amountLabel")}</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="1000000" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="equityDetails"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("equityDetailsLabel")}</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="e.g. 10% equity for 1,000,000 Fcfa"
                      {...field}
                    />
                  </FormControl>
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
                  <DatePicker date={field.value} setDate={field.onChange} />
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit">{t("addButton")}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
