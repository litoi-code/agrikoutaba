
"use client"
import { useMemo, useState, useEffect } from 'react';
import { collection } from 'firebase/firestore';
import { useFirestore, useCollection, useMemoFirebase, type WithId, useUser } from '@/firebase';
import { useTranslations } from 'next-intl';
import { format, startOfDay, endOfDay } from 'date-fns';
import { DateRange } from 'react-day-picker';
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
import { DatePickerWithRange } from '@/components/date-range-picker';

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

const RecentTaskRow = ({ task, workerName }: { task: WithId<Task>, workerName: string }) => {
  const [formattedDate, setFormattedDate] = useState('');
  useEffect(() => {
    // Defensively check if dueDate exists before formatting
    if (task.dueDate) {
      setFormattedDate(format(new Date(task.dueDate), 'PPP'));
    }
  }, [task.dueDate]);

  return (
    <TableRow>
      <TableCell className="font-medium">{task.title || task.description}</TableCell>
      <TableCell>
        <Badge variant={task.status === "Completed" ? "secondary" : "default"} className={task.status === "In Progress" ? "bg-amber-500 text-white" : ""}>
          {task.status}
        </Badge>
      </TableCell>
      <TableCell>{workerName}</TableCell>
      <TableCell>{formattedDate ? formattedDate : <Skeleton className="h-4 w-24" />}</TableCell>
    </TableRow>
  );
};


export default function DashboardPage() {
  const firestore = useFirestore();
  const { user } = useUser();
  const t = useTranslations('DashboardPage');
  const tGlobal = useTranslations('Global');

  const [dateRange, setDateRange] = useState<DateRange | undefined>();

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
    const monthsLabels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const data: FinancialData[] = monthsLabels.map(m => ({ month: m, Income: 0, Expenses: 0 }));

    if (!income || !expenses) return data.slice(0, 7);

    const filteredIncome = income.filter(i => {
      if (!dateRange?.from) return true;
      const d = new Date(i.date);
      const to = dateRange.to ? endOfDay(dateRange.to) : endOfDay(dateRange.from);
      return d >= startOfDay(dateRange.from) && d <= to;
    });

    const filteredExpenses = expenses.filter(e => {
      if (!dateRange?.from) return true;
      const d = new Date(e.date);
      const to = dateRange.to ? endOfDay(dateRange.to) : endOfDay(dateRange.from);
      return d >= startOfDay(dateRange.from) && d <= to;
    });

    filteredIncome.forEach(i => {
      const monthIndex = new Date(i.date).getMonth();
      data[monthIndex].Income += i.amount;
    });
    filteredExpenses.forEach(e => {
      const monthIndex = new Date(e.date).getMonth();
      data[monthIndex].Expenses += e.amount;
    });

    if (!dateRange?.from) return data.slice(0, 7);
    
    // Show only months that fall within the range or have data
    return data.filter((d, index) => {
        const hasData = d.Income > 0 || d.Expenses > 0;
        const startMonth = dateRange.from?.getMonth();
        const endMonth = dateRange.to ? dateRange.to.getMonth() : startMonth;
        
        // If same year, filter by index
        if (startMonth !== undefined && endMonth !== undefined && dateRange.from?.getFullYear() === (dateRange.to || dateRange.from)?.getFullYear()) {
             return index >= startMonth && index <= endMonth;
        }
        
        return hasData;
    });
  }, [income, expenses, dateRange]);

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
          <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
                <CardTitle>{t('financialOverview')}</CardTitle>
                <CardDescription>{t('financialOverviewDescription')}</CardDescription>
            </div>
            <DatePickerWithRange date={dateRange} setDate={setDateRange} className="w-full sm:w-auto" />
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
                    const assignedWorkers = (task.workerIds || []).map(id => workersMap.get(id)).filter(Boolean) as WithId<Worker>[];
                    const workerName = assignedWorkers.length > 0 ? assignedWorkers.map(w => `${w.firstName} ${w.lastName}`).join(', ') : 'Unassigned';
                    return (
                      <RecentTaskRow key={task.id} task={task} workerName={workerName} />
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
