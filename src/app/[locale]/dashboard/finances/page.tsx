
"use client";
import { useMemo, useState, useEffect } from 'react';
import { collection, doc } from 'firebase/firestore';
import { useFirestore, useCollection, useMemoFirebase, type WithId, useUser, deleteDocumentNonBlocking } from '@/firebase';
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { PlusCircle, ArrowUpCircle, ArrowDownCircle, MoreHorizontal, Edit, Trash } from "lucide-react";
import type { Income, Expense, Customer, Supplier } from "@/lib/types";
import { Skeleton } from '@/components/ui/skeleton';
import { TransactionFormDialog } from './add-transaction-dialog';
import { useToast } from '@/hooks/use-toast';

const TransactionRow = ({ transaction, type, tGlobal, t, tDialog }: { transaction: WithId<Income> | WithId<Expense>, type: 'income' | 'expense', tGlobal: any, t: any, tDialog: any }) => {
  const [formattedDate, setFormattedDate] = useState('');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { toast } = useToast();
  const firestore = useFirestore();

  useEffect(() => {
    setFormattedDate(format(new Date(transaction.date), 'PPP'));
  }, [transaction.date]);

  const handleDelete = () => {
    if (!firestore) return;
    const collectionName = type === 'income' ? 'incomes' : 'expenses';
    const docRef = doc(firestore, collectionName, transaction.id);
    deleteDocumentNonBlocking(docRef);

    toast({
        title: tDialog(`toast${type === 'income' ? 'Income' : 'Expense'}DeleteTitle`),
        description: tDialog(`toast${type === 'income' ? 'Income' : 'Expense'}Description`, {
            amount: transaction.amount,
        }),
    });
    setIsDeleteDialogOpen(false);
  };


  return (
    <>
      <TableRow>
        <TableCell>{formattedDate ? formattedDate : <Skeleton className="h-4 w-24" />}</TableCell>
        <TableCell className="font-medium">{transaction.description}</TableCell>
        <TableCell className="text-right font-mono">
          {transaction.amount.toLocaleString('en-US')} {tGlobal('currency')}
        </TableCell>
        <TableCell className="text-right">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <TransactionFormDialog 
                income={type === 'income' ? (transaction as WithId<Income>) : undefined}
                expense={type === 'expense' ? (transaction as WithId<Expense>) : undefined}
                defaultTab={type}
              >
                 <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                    <Edit className="mr-2 h-4 w-4" />
                    <span>{t('editAction')}</span>
                </DropdownMenuItem>
              </TransactionFormDialog>
              <DropdownMenuItem onClick={() => setIsDeleteDialogOpen(true)} className="text-destructive focus:text-destructive">
                 <Trash className="mr-2 h-4 w-4" />
                 <span>{t('deleteAction')}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </TableCell>
      </TableRow>
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{tDialog('deleteTitle')}</AlertDialogTitle>
            <AlertDialogDescription>
              {tDialog('deleteDescription')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{tDialog('cancelButton')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">{tDialog('deleteButton')}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

const TransactionsTable = ({ data, type, isLoading, t, tDialog, tGlobal }: { data: (WithId<Income> | WithId<Expense>)[], type: 'income' | 'expense', isLoading: boolean, t: any, tDialog: any, tGlobal: any }) => (
  <Card>
    <CardContent className="p-0">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t('dateColumn')}</TableHead>
            <TableHead>{t('descriptionColumn')}</TableHead>
            <TableHead className="text-right">{t('amountColumn')}</TableHead>
            <TableHead className="w-[100px] text-right">{t('actionsColumn')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            Array.from({length: 5}).map((_, i) => (
              <TableRow key={i}>
                <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                <TableCell><Skeleton className="h-4 w-1/2" /></TableCell>
                <TableCell className="text-right"><Skeleton className="h-4 w-20 ml-auto" /></TableCell>
                <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
              </TableRow>
            ))
          ) : (
            data.map((transaction) => (
              <TransactionRow key={transaction.id} transaction={transaction} type={type} tGlobal={tGlobal} t={t} tDialog={tDialog} />
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
  const tDialog = useTranslations('FinancesPage.AddTransactionDialog');
  const tGlobal = useTranslations('Global');

  const incomeQuery = useMemoFirebase(() => (firestore && user) ? collection(firestore, 'incomes') : null, [firestore, user]);
  const { data: income, isLoading: incomeLoading } = useCollection<Income>(incomeQuery);

  const expensesQuery = useMemoFirebase(() => (firestore && user) ? collection(firestore, 'expenses') : null, [firestore, user]);
  const { data: expenses, isLoading: expensesLoading } = useCollection<Expense>(expensesQuery);
  
  const totalIncome = useMemo(() => income?.reduce((sum, t) => sum + t.amount, 0) ?? 0, [income]);
  const totalExpenses = useMemo(() => expenses?.reduce((sum, t) => sum + t.amount, 0) ?? 0, [expenses]);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-headline font-bold">{t('title')}</h1>
        <TransactionFormDialog>
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            {t('addNew')}
          </Button>
        </TransactionFormDialog>
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
          <TransactionsTable data={income ?? []} type="income" isLoading={incomeLoading} t={t} tDialog={tDialog} tGlobal={tGlobal} />
        </TabsContent>
        <TabsContent value="expenses">
          <TransactionsTable data={expenses ?? []} type="expense" isLoading={expensesLoading} t={t} tDialog={tDialog} tGlobal={tGlobal} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
