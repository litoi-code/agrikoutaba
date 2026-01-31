
"use client";
import { useMemo } from 'react';
import { collection } from 'firebase/firestore';
import { useFirestore, useCollection, useMemoFirebase, type WithId, useUser } from '@/firebase';
import { useTranslations } from 'next-intl';
import { format } from 'date-fns';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { PlusCircle, ArrowUpCircle, ArrowDownCircle } from "lucide-react";
import type { Income, Expense, Customer, Supplier } from "@/lib/types";
import { Skeleton } from '@/components/ui/skeleton';
import { AddTransactionDialog } from './add-transaction-dialog';

const TransactionsTable = ({ data, isLoading, t, tGlobal }: { data: (WithId<Income> | WithId<Expense>)[], isLoading: boolean, t: any, tGlobal: any }) => (
  <Card>
    <CardContent className="p-0">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t('dateColumn')}</TableHead>
            <TableHead>{t('descriptionColumn')}</TableHead>
            <TableHead className="text-right">{t('amountColumn')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            Array.from({length: 5}).map((_, i) => (
              <TableRow key={i}>
                <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                <TableCell><Skeleton className="h-4 w-1/2" /></TableCell>
                <TableCell className="text-right"><Skeleton className="h-4 w-20 ml-auto" /></TableCell>
              </TableRow>
            ))
          ) : (
            data.map((transaction) => (
              <TableRow key={transaction.id}>
                <TableCell>{format(new Date(transaction.date), 'PPP')}</TableCell>
                <TableCell className="font-medium">{transaction.description}</TableCell>
                <TableCell className="text-right font-mono">
                  {transaction.amount.toLocaleString('en-US')} {tGlobal('currency')}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </CardContent>
  </Card>
);

export default function FinancesPage() {
  const firestore = useFirestore();
  const { user } = useUser();
  const t = useTranslations('FinancesPage');
  const tGlobal = useTranslations('Global');

  const incomeQuery = useMemoFirebase(() => (firestore && user) ? collection(firestore, 'incomes') : null, [firestore, user]);
  const { data: income, isLoading: incomeLoading } = useCollection<Income>(incomeQuery);

  const expensesQuery = useMemoFirebase(() => (firestore && user) ? collection(firestore, 'expenses') : null, [firestore, user]);
  const { data: expenses, isLoading: expensesLoading } = useCollection<Expense>(expensesQuery);

  const customersQuery = useMemoFirebase(() => (firestore && user) ? collection(firestore, 'customers') : null, [firestore, user]);
  const { data: customers } = useCollection<Customer>(customersQuery);

  const suppliersQuery = useMemoFirebase(() => (firestore && user) ? collection(firestore, 'suppliers') : null, [firestore, user]);
  const { data: suppliers } = useCollection<Supplier>(suppliersQuery);
  
  const totalIncome = useMemo(() => income?.reduce((sum, t) => sum + t.amount, 0) ?? 0, [income]);
  const totalExpenses = useMemo(() => expenses?.reduce((sum, t) => sum + t.amount, 0) ?? 0, [expenses]);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-headline font-bold">{t('title')}</h1>
        <AddTransactionDialog customers={customers ?? []} suppliers={suppliers ?? []}>
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            {t('addNew')}
          </Button>
        </AddTransactionDialog>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('totalIncome')}</CardTitle>
            <ArrowUpCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            {incomeLoading ? <Skeleton className="h-8 w-32" /> : <div className="text-2xl font-bold">{totalIncome.toLocaleString('en-US')} {tGlobal('currency')}</div>}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('totalExpenses')}</CardTitle>
            <ArrowDownCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            {expensesLoading ? <Skeleton className="h-8 w-32" /> : <div className="text-2xl font-bold">{totalExpenses.toLocaleString('en-US')} {tGlobal('currency')}</div>}
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="income">
        <TabsList className="grid w-full grid-cols-2 md:w-[400px]">
          <TabsTrigger value="income">{t('incomeTab')}</TabsTrigger>
          <TabsTrigger value="expenses">{t('expensesTab')}</TabsTrigger>
        </TabsList>
        <TabsContent value="income">
          <TransactionsTable data={income ?? []} isLoading={incomeLoading} t={t} tGlobal={tGlobal} />
        </TabsContent>
        <TabsContent value="expenses">
          <TransactionsTable data={expenses ?? []} isLoading={expensesLoading} t={t} tGlobal={tGlobal} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
