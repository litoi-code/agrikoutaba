
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
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";

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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import type { Customer, Supplier, Income, Expense } from "@/lib/types";

const incomeSchema = z.object({
  description: z.string().min(1, "Description is required"),
  amount: z.coerce.number().positive("Amount must be positive"),
  date: z.date({ required_error: "Please select a date." }),
  customerName: z.string().min(1, "Customer name is required"),
});

const expenseSchema = z.object({
  description: z.string().min(1, "Description is required"),
  amount: z.coerce.number().positive("Amount must be positive"),
  date: z.date({ required_error: "Please select a date." }),
  supplierName: z.string().min(1, "Supplier name is required"),
});

interface AddTransactionDialogProps {
  children: React.ReactNode;
  customers: WithId<Customer>[];
  suppliers: WithId<Supplier>[];
  income?: WithId<Income>;
  expense?: WithId<Expense>;
  defaultTab?: 'income' | 'expense';
}

export function AddTransactionDialog({
  children,
  customers,
  suppliers,
  income,
  expense,
  defaultTab = 'income'
}: AddTransactionDialogProps) {
  const [open, setOpen] = useState(false);
  const [incomeDatePopoverOpen, setIncomeDatePopoverOpen] = useState(false);
  const [expenseDatePopoverOpen, setExpenseDatePopoverOpen] = useState(false);
  const { toast } = useToast();
  const firestore = useFirestore();
  const t = useTranslations("FinancesPage.AddTransactionDialog");
  const isEditMode = !!(income || expense);

  const incomeForm = useForm<z.infer<typeof incomeSchema>>({
    resolver: zodResolver(incomeSchema),
    defaultValues: {
      description: "",
      amount: "" as any,
      customerName: "",
      date: new Date(),
    },
  });

  const expenseForm = useForm<z.infer<typeof expenseSchema>>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      description: "",
      amount: "" as any,
      supplierName: "",
      date: new Date(),
    },
  });

  useEffect(() => {
    if (open) {
        if (income) {
            let name = (income as any).customerName;
            if (!name && (income as any).customerId) {
                const oldCustomer = customers.find(c => c.id === (income as any).customerId);
                if (oldCustomer) {
                    name = `${oldCustomer.firstName} ${oldCustomer.lastName}`;
                }
            }
            incomeForm.reset({ ...(income as any), date: new Date(income.date), customerName: name || "" });
        } else {
            incomeForm.reset({ description: "", amount: "" as any, customerName: "", date: new Date() });
        }
        if (expense) {
            let name = (expense as any).supplierName;
            if (!name && (expense as any).supplierId) {
                const oldSupplier = suppliers.find(s => s.id === (expense as any).supplierId);
                if (oldSupplier) {
                    name = oldSupplier.companyName;
                }
            }
            expenseForm.reset({ ...(expense as any), date: new Date(expense.date), supplierName: name || "" });
        } else {
            expenseForm.reset({ description: "", amount: "" as any, supplierName: "", date: new Date() });
        }
    }
  }, [open, income, expense, incomeForm, expenseForm, suppliers, customers]);


  const onIncomeSubmit = (values: z.infer<typeof incomeSchema>) => {
    if (!firestore) return;
    const data = { ...values, date: values.date.toISOString() };
    if (income) {
        const incomeRef = doc(firestore, "incomes", income.id);
        updateDocumentNonBlocking(incomeRef, data);
        toast({
            title: t("toastIncomeUpdateTitle"),
            description: t("toastIncomeDescription", { amount: values.amount }),
        });
    } else {
        const incomesRef = collection(firestore, "incomes");
        addDocumentNonBlocking(incomesRef, data);
        toast({
            title: t("toastIncomeTitle"),
            description: t("toastIncomeDescription", { amount: values.amount }),
        });
    }
    setOpen(false);
  };

  const onExpenseSubmit = (values: z.infer<typeof expenseSchema>) => {
    if (!firestore) return;
    const data = { ...values, date: values.date.toISOString() };

    if (expense) {
        const expenseRef = doc(firestore, "expenses", expense.id);
        updateDocumentNonBlocking(expenseRef, data);
        toast({
            title: t("toastExpenseUpdateTitle"),
            description: t("toastExpenseDescription", { amount: values.amount }),
        });
    } else {
        const expensesRef = collection(firestore, "expenses");
        addDocumentNonBlocking(expensesRef, data);
        toast({
            title: t("toastExpenseTitle"),
            description: t("toastExpenseDescription", { amount: values.amount }),
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
          <DialogDescription>{isEditMode ? t("editDescription") : t("description")}</DialogDescription>
        </DialogHeader>
        <Tabs defaultValue={defaultTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="income" disabled={isEditMode && !!expense}>{t("incomeTab")}</TabsTrigger>
            <TabsTrigger value="expense" disabled={isEditMode && !!income}>{t("expenseTab")}</TabsTrigger>
          </TabsList>
          <TabsContent value="income">
            <Form {...incomeForm}>
              <form
                onSubmit={incomeForm.handleSubmit(onIncomeSubmit)}
                className="space-y-4 py-4"
              >
                <FormField
                  control={incomeForm.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("descriptionLabel")}</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Sale of produce" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={incomeForm.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("amountLabel")}</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="10000" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={incomeForm.control}
                  name="customerName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("customerLabel")}</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. John Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={incomeForm.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>{t("dateLabel")}</FormLabel>
                      <Popover open={incomeDatePopoverOpen} onOpenChange={setIncomeDatePopoverOpen}>
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
                        <PopoverContent className="w-auto p-0" onPointerDownOutside={(e) => e.preventDefault()}>
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={(date) => {
                                field.onChange(date);
                                setIncomeDatePopoverOpen(false);
                            }}
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button type="submit">{isEditMode ? t('saveButton') : t("addIncomeButton")}</Button>
                </DialogFooter>
              </form>
            </Form>
          </TabsContent>
          <TabsContent value="expense">
            <Form {...expenseForm}>
              <form
                onSubmit={expenseForm.handleSubmit(onExpenseSubmit)}
                className="space-y-4 py-4"
              >
                <FormField
                  control={expenseForm.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("descriptionLabel")}</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g. Purchase of seeds"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={expenseForm.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("amountLabel")}</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="5000" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={expenseForm.control}
                  name="supplierName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("supplierLabel")}</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Global Seeds Inc." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={expenseForm.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>{t("dateLabel")}</FormLabel>
                      <Popover open={expenseDatePopoverOpen} onOpenChange={setExpenseDatePopoverOpen}>
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
                        <PopoverContent className="w-auto p-0" onPointerDownOutside={(e) => e.preventDefault()}>
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={(date) => {
                                field.onChange(date);
                                setExpenseDatePopoverOpen(false);
                            }}
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button type="submit">{isEditMode ? t('saveButton') : t("addExpenseButton")}</Button>
                </DialogFooter>
              </form>
            </Form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
