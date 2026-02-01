
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  customerId: z
    .string({ required_error: "Please select a customer." })
    .min(1, "Please select a customer."),
});

const expenseSchema = z.object({
  description: z.string().min(1, "Description is required"),
  amount: z.coerce.number().positive("Amount must be positive"),
  date: z.date({ required_error: "Please select a date." }),
  supplierId: z
    .string({ required_error: "Please select a supplier." })
    .min(1, "Please select a supplier."),
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
  const { toast } = useToast();
  const firestore = useFirestore();
  const t = useTranslations("FinancesPage.AddTransactionDialog");
  const isEditMode = !!(income || expense);

  const incomeForm = useForm<z.infer<typeof incomeSchema>>({
    resolver: zodResolver(incomeSchema),
    defaultValues: {
      description: "",
      amount: "" as any,
      customerId: "",
    },
  });

  const expenseForm = useForm<z.infer<typeof expenseSchema>>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      description: "",
      amount: "" as any,
      supplierId: "",
    },
  });

  useEffect(() => {
    if (open) {
        if (income) {
            incomeForm.reset({ ...income, date: new Date(income.date) });
        } else {
            incomeForm.reset({ description: "", amount: "" as any, customerId: "", date: new Date() });
        }
        if (expense) {
            expenseForm.reset({ ...expense, date: new Date(expense.date) });
        } else {
            expenseForm.reset({ description: "", amount: "" as any, supplierId: "", date: new Date() });
        }
    }
  }, [open, income, expense, incomeForm, expenseForm]);


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
    <Dialog open={open} onOpenChange={setOpen} modal={false}>
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
                  name="customerId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("customerLabel")}</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue
                              placeholder={t("selectCustomerPlaceholder")}
                            />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {customers.map((c) => (
                            <SelectItem key={c.id} value={c.id}>
                              {c.firstName} {c.lastName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
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
                  name="supplierId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("supplierLabel")}</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue
                              placeholder={t("selectSupplierPlaceholder")}
                            />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {suppliers.map((s) => (
                            <SelectItem key={s.id} value={s.id}>
                              {s.companyName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
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
