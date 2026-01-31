"use client"
import { useMemo } from 'react';
import { collection } from 'firebase/firestore';
import { useFirestore, useCollection, useMemoFirebase, type WithId, useUser } from '@/firebase';
import { useTranslations } from 'next-intl';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from "recharts";
import {
  UsersRound,
  ClipboardCheck,
  DollarSign,
} from "lucide-react";
import type { Customer, Supplier, Task, Worker, Income, Expense, FinancialData } from "@/lib/types";
import { Skeleton } from '@/components/ui/skeleton';

const chartConfig = {
  Income: {
    label: "Income",
    color: "hsl(var(--chart-1))",
  },
  Expenses: {
    label: "Expenses",
    color: "hsl(var(--chart-2))",
  },
};

export default function DashboardPage() {
  const firestore = useFirestore();
  const { user } = useUser();
  const t = useTranslations('DashboardPage');
  const tGlobal = useTranslations('Global');

  // Fetching data
  const customersQuery = useMemoFirebase(() => (firestore && user) ? collection(firestore, 'customers') : null, [firestore, user]);
  const { data: customers, isLoading: customersLoading } = useCollection<Customer>(customersQuery);

  const suppliersQuery = useMemoFirebase(() => (firestore && user) ? collection(firestore, 'suppliers') : null, [firestore, user]);
  const { data: suppliers, isLoading: suppliersLoading } = useCollection<Supplier>(suppliersQuery);

  const tasksQuery = useMemoFirebase(() => (firestore && user) ? collection(firestore, 'tasks') : null, [firestore, user]);
  const { data: tasks, isLoading: tasksLoading } = useCollection<Task>(tasksQuery);
  
  const workersQuery = useMemoFirebase(() => (firestore && user) ? collection(firestore, 'workers') : null, [firestore, user]);
  const { data: workers, isLoading: workersLoading } = useCollection<Worker>(workersQuery);

  const incomeQuery = useMemoFirebase(() => (firestore && user) ? collection(firestore, 'incomes') : null, [firestore, user]);
  const { data: income, isLoading: incomeLoading } = useCollection<Income>(incomeQuery);

  const expensesQuery = useMemoFirebase(() => (firestore && user) ? collection(firestore, 'expenses') : null, [firestore, user]);
  const { data: expenses, isLoading: expensesLoading } = useCollection<Expense>(expensesQuery);

  // Memoized calculations
  const totalContacts = useMemo(() => (customers?.length ?? 0) + (suppliers?.length ?? 0), [customers, suppliers]);
  const pendingTasks = useMemo(() => tasks?.filter(task => task.status !== "Completed").length ?? 0, [tasks]);
  
  const netIncome = useMemo(() => {
    const totalIncome = income?.reduce((acc, item) => acc + item.amount, 0) ?? 0;
    const totalExpenses = expenses?.reduce((acc, item) => acc + item.amount, 0) ?? 0;
    return totalIncome - totalExpenses;
  }, [income, expenses]);

  const financialChartData = useMemo<FinancialData[]>(() => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const data: FinancialData[] = months.map(m => ({ month: m, Income: 0, Expenses: 0 }));

    income?.forEach(i => {
      const monthIndex = new Date(i.date).getMonth();
      data[monthIndex].Income += i.amount;
    });
    expenses?.forEach(e => {
      const monthIndex = new Date(e.date).getMonth();
      data[monthIndex].Expenses += e.amount;
    });

    return data.slice(0, 7); // Show first 7 months for now
  }, [income, expenses]);

  const workersMap = useMemo(() => {
    if (!workers) return new Map<string, WithId<Worker>>();
    return new Map(workers.map(w => [w.id, w]));
  }, [workers]);

  const isLoading = customersLoading || suppliersLoading || tasksLoading || incomeLoading || expensesLoading || workersLoading;

  chartConfig.Income.label = t('income');
  chartConfig.Expenses.label = t('expenses');

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-3xl font-headline font-bold">{t('title')}</h1>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('totalContacts')}</CardTitle>
            <UsersRound className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {customersLoading || suppliersLoading ? <Skeleton className="h-8 w-16" /> : <div className="text-2xl font-bold">{totalContacts}</div>}
            <p className="text-xs text-muted-foreground">{t('totalContactsDescription')}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('pendingTasks')}</CardTitle>
            <ClipboardCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {tasksLoading ? <Skeleton className="h-8 w-16" /> : <div className="text-2xl font-bold">{pendingTasks}</div>}
            <p className="text-xs text-muted-foreground">{t('pendingTasksDescription')}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('netIncome')}</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {incomeLoading || expensesLoading ? <Skeleton className="h-8 w-24" /> : <div className="text-2xl font-bold">{netIncome.toLocaleString()} {tGlobal('currency')}</div>}
            <p className="text-xs text-muted-foreground">{t('netIncomeDescription')}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <Card className="col-span-1 lg:col-span-2">
          <CardHeader>
            <CardTitle>{t('financialOverview')}</CardTitle>
            <CardDescription>{t('financialOverviewDescription')}</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="h-[300px] w-full" /> : (
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                 <BarChart data={financialChartData} margin={{ top: 20, right: 20, bottom: 5, left: 0 }}>
                    <CartesianGrid vertical={false} />
                    <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
                    <YAxis tickFormatter={(value) => `${value/1000}k ${tGlobal('currency')}`} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="Income" fill="var(--color-Income)" radius={4} />
                    <Bar dataKey="Expenses" fill="var(--color-Expenses)" radius={4} />
                  </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
            )}
          </CardContent>
        </Card>
        
        <Card className="col-span-1 lg:col-span-2">
          <CardHeader>
            <CardTitle>{t('recentTasks')}</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('taskColumn')}</TableHead>
                  <TableHead>{t('statusColumn')}</TableHead>
                  <TableHead>{t('assigneeColumn')}</TableHead>
                  <TableHead>{t('dueDateColumn')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tasksLoading || workersLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-4 w-1/2" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    </TableRow>
                  ))
                ) : (
                  tasks?.slice(0, 5).map((task) => {
                    const worker = workersMap.get(task.workerId);
                    const workerName = worker ? `${worker.firstName} ${worker.lastName}` : 'Unassigned';
                    return (
                      <TableRow key={task.id}>
                        <TableCell className="font-medium">{task.title || task.description}</TableCell>
                        <TableCell>
                          <Badge variant={task.status === "Completed" ? "secondary" : "default"} className={task.status === "In Progress" ? "bg-amber-500 text-white" : ""}>
                            {task.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{workerName}</TableCell>
                        <TableCell>{new Date(task.dueDate).toLocaleDateString()}</TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
