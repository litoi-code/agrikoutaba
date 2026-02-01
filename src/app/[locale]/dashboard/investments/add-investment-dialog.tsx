
"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { collection, doc } from "firebase/firestore";
import {
  useFirestore,
  addDocumentNonBlocking,
  updateDocumentNonBlocking,
  type WithId,
} from "@/firebase";
import { useTranslations } from "next-intl";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";

import { cn } from "@/lib/utils";
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
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import type { Investment } from "@/lib/types";

const investmentSchema = z.object({
  investorName: z.string().min(1, "Investor name is required"),
  description: z.string().min(1, "Description is required"),
  amount: z.coerce.number().positive("Amount must be positive"),
  date: z.date({ required_error: "Please select a date." }),
  equityDetails: z.string().min(1, "Equity details are required"),
});

export function AddInvestmentDialog({
  children,
  investment,
}: {
  children: React.ReactNode;
  investment?: WithId<Investment>;
}) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const firestore = useFirestore();
  const t = useTranslations("InvestmentsPage.AddInvestmentDialog");
  const isEditMode = !!investment;

  const form = useForm<z.infer<typeof investmentSchema>>({
    resolver: zodResolver(investmentSchema),
    defaultValues: {
      investorName: "",
      description: "",
      amount: "" as any,
      equityDetails: "",
      date: new Date(),
    },
  });

  useEffect(() => {
    if (open) {
      if (investment) {
        form.reset({
          ...investment,
          date: new Date(investment.date),
        });
      } else {
        form.reset({
          investorName: "",
          description: "",
          amount: "" as any,
          equityDetails: "",
          date: new Date(),
        });
      }
    }
  }, [open, investment, form]);

  const onSubmit = (values: z.infer<typeof investmentSchema>) => {
    if (!firestore) return;
    const data = {
      ...values,
      date: values.date.toISOString(),
    };

    if (isEditMode && investment) {
      const investmentRef = doc(firestore, "investments", investment.id);
      updateDocumentNonBlocking(investmentRef, data);
      toast({
        title: t("toastUpdateTitle"),
        description: t("toastDescription", {
          investorName: values.investorName,
        }),
      });
    } else {
      const investmentsRef = collection(firestore, "investments");
      addDocumentNonBlocking(investmentsRef, data);
      toast({
        title: t("toastTitle"),
        description: t("toastDescription", {
          investorName: values.investorName,
        }),
      });
    }

    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen} modal>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEditMode ? t("editTitle") : t("title")}</DialogTitle>
          <DialogDescription>
            {isEditMode ? t("editDescription") : t("description")}
          </DialogDescription>
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
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit">{isEditMode ? t("saveButton") : t("addButton")}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

    