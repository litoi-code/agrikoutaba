
"use client"
import { useMemo, useState, useEffect } from 'react';
import { collection } from 'firebase/firestore';
import { useFirestore, useCollection, useMemoFirebase, type WithId } from '@/firebase';
import { useTranslations } from 'next-intl';
import { format, startOfDay, endOfDay, startOfYear, endOfYear } from 'date-fns';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
    if (task.dueDate) {
      setFormattedDate(format(new Date(task.dueDate), 'MMM d, yyyy'));
    }
  }, [task.dueDate]);

  return (
    <TableRow>
      <TableCell className="font-medium max-w-[150px] md:max-w-none truncate">{task.title || task.description}</TableCell>
      <TableCell>
        <Badge variant={task.status === "Completed" ? "secondary" : "default"} className={task.status === "In Progress" ? "bg-amber-500 text-white text-[10px] px-1.5" : "text-[10px] px-1.5"}>
          {task.status}
        </Badge>
      </TableCell>
      <TableCell className="hidden sm:table-cell">{workerName}</TableCell>
      <TableCell className="hidden md:table-cell">{formattedDate ? formattedDate : <Skeleton className="h-4 w-24" />}</TableCell>
    </TableRow>
  );
};

export default function DashboardPage() {
  const firestore = useFirestore();
  const t = useTranslations('DashboardPage');
  const tGlobal = useTranslations('Global');

  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [selectedYear, setSelectedYear] = useState<string>("current");
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  // Fetching data
  const customersQuery = useMemoFirebase(() => (firestore) ? collection(firestore, 'customers') : null, [firestore]);
  const { data: customers, isLoading: customersLoading } = useCollection<Customer>(customersQuery);

  const suppliersQuery = useMemoFirebase(() => (firestore) ? collection(firestore, 'suppliers') : null, [firestore]);
  const { data: suppliers, isLoading: suppliersLoading } = useCollection<Supplier>(suppliersQuery);

  const tasksQuery = useMemoFirebase(() => (firestore) ? collection(firestore, 'tasks') : null, [firestore]);
  const { data: tasks, isLoading: tasksLoading } = useCollection<Task>(tasksQuery);
  
  const workersQuery = useMemoFirebase(() => (firestore) ? collection(firestore, 'workers') : null, [firestore]);
  const { data: workers, isLoading: workersLoading } = useCollection<Worker>(workersQuery);

  const incomeQuery = useMemoFirebase(() => (firestore) ? collection(firestore, 'incomes') : null, [firestore]);
  const { data: income, isLoading: incomeLoading } = useCollection<Income>(incomeQuery);

  const expensesQuery = useMemoFirebase(() => (firestore) ? collection(firestore, 'expenses') : null, [firestore]);
  const { data: expenses, isLoading: expensesLoading } = useCollection<Expense>(expensesQuery);

  // Available years for the dropdown
  const availableYears = useMemo(() => {
    if (!hasMounted) return [];
    const years = new Set<number>();
    income?.forEach(i => years.add(new Date(i.date).getFullYear()));
    expenses?.forEach(e => years.add(new Date(e.date).getFullYear()));
    const currentYear = new Date().getFullYear();
    years.add(currentYear);
    return Array.from(years).sort((a, b) => b - a);
  }, [income, expenses, hasMounted]);

  // Memoized calculations
  const totalContacts = useMemo(() => (customers?.length ?? 0) + (suppliers?.length ?? 0), [customers, suppliers]);
  const pendingTasks = useMemo(() => tasks?.filter(task => task.status !== "Completed").length ?? 0, [tasks]);
  
  const netIncome = useMemo(() => {
    const totalIncomeValue = income?.reduce((acc, item) => acc + item.amount, 0) ?? 0;
    const totalExpensesValue = expenses?.reduce((acc, item) => acc + item.amount, 0) ?? 0;
    return totalIncomeValue - totalExpensesValue;
  }, [income, expenses]);

  const financialChartData = useMemo<FinancialData[]>(() => {
    const monthsLabels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const data: FinancialData[] = monthsLabels.map(m => ({ month: m, Income: 0, Expenses: 0 }));

    if (!hasMounted || !income || !expenses) return data.slice(0, 7);

    // Determine the effective date filter
    let start: Date | undefined;
    let end: Date | undefined;

    if (selectedYear !== "all" && selectedYear !== "current") {
      const year = parseInt(selectedYear);
      start = startOfYear(new Date(year, 0, 1));
      end = endOfYear(new Date(year, 0, 1));
    } else if (selectedYear === "current") {
      const now = new Date();
      start = startOfYear(now);
      end = endOfYear(now);
    } else if (dateRange?.from) {
      start = startOfDay(dateRange.from);
      end = dateRange.to ? endOfDay(dateRange.to) : endOfDay(dateRange.from);
    }

    const filteredIncomeItems = income.filter(i => {
      if (!start || !end) return true;
      const d = new Date(i.date);
      return d >= start && d <= end;
    });

    const filteredExpensesItems = expenses.filter(e => {
      if (!start || !end) return true;
      const d = new Date(e.date);
      return d >= start && d <= end;
    });

    filteredIncomeItems.forEach(i => {
      const monthIndex = new Date(i.date).getMonth();
      data[monthIndex].Income += i.amount;
    });
    filteredExpensesItems.forEach(e => {
      const monthIndex = new Date(e.date).getMonth();
      data[monthIndex].Expenses += e.amount;
    });

    if (selectedYear === "all" && !dateRange?.from) {
        return data.filter(d => d.Income > 0 || d.Expenses > 0);
    }
    
    if (selectedYear !== "all" || (start && end && start.getFullYear() === end.getFullYear())) {
      return data;
    }

    return data.filter((d, index) => {
        const hasData = d.Income > 0 || d.Expenses > 0;
        const startMonth = start?.getMonth();
        const endMonth = end?.getMonth();
        
        if (startMonth !== undefined && endMonth !== undefined) {
             return index >= startMonth && index <= endMonth;
        }
        
        return hasData;
    });
  }, [income, expenses, dateRange, selectedYear, hasMounted]);

  const workersMap = useMemo(() => {
    if (!workers) return new Map<string, WithId<Worker>>();
    return new Map(workers.map(w => [w.id, w]));
  }, [workers]);

  const isLoading = !hasMounted || customersLoading || suppliersLoading || tasksLoading || incomeLoading || expensesLoading || workersLoading;

  chartConfig.Income.label = t('income');
  chartConfig.Expenses.label = t('expenses');

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-headline font-bold">{t('title')}</h1>
      
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('totalContacts')}</CardTitle>
            <UsersRound className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="h-8 w-16" /> : <div className="text-2xl font-bold">{totalContacts}</div>}
            <p className="text-xs text-muted-foreground mt-1">{t('totalContactsDescription')}</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('pendingTasks')}</CardTitle>
            <ClipboardCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="h-8 w-16" /> : <div className="text-2xl font-bold">{pendingTasks}</div>}
            <p className="text-xs text-muted-foreground mt-1">{t('pendingTasksDescription')}</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('netIncome')}</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="h-8 w-24" /> : <div className="text-2xl font-bold">{netIncome.toLocaleString()} {tGlobal('currency')}</div>}
            <p className="text-xs text-muted-foreground mt-1">{t('netIncomeDescription')}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="col-span-1 lg:col-span-2">
          <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="space-y-1">
                <CardTitle className="text-xl">{t('financialOverview')}</CardTitle>
                <CardDescription className="text-sm">{t('financialOverviewDescription')}</CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger className="w-full sm:w-[130px]">
                  <SelectValue placeholder={t('selectYear')} />
                </SelectTrigger>
                <SelectContent>
                  {hasMounted && (
                    <>
                      <SelectItem value="current">{new Date().getFullYear()}</SelectItem>
                      {availableYears.filter(y => y !== new Date().getFullYear()).map(year => (
                        <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                      ))}
                    </>
                  )}
                  <SelectItem value="all">{t('allTime')}</SelectItem>
                </SelectContent>
              </Select>
              <DatePickerWithRange date={dateRange} setDate={(range) => {
                setDateRange(range);
                if (range?.from) setSelectedYear("all");
              }} className="w-full sm:w-auto" />
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="h-[250px] w-full" /> : (
            <ChartContainer config={chartConfig} className="h-[250px] md:h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                 <BarChart data={financialChartData} margin={{ top: 20, right: 10, bottom: 0, left: -10 }}>
                    <CartesianGrid vertical={false} strokeDasharray="3 3" />
                    <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
                    <YAxis tickFormatter={(value) => `${value/1000}k`} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="Income" fill="var(--color-Income)" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Expenses" fill="var(--color-Expenses)" radius={[4, 4, 0, 0]} />
                  </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
            )}
          </CardContent>
        </Card>
        
        <Card className="col-span-1 lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-xl">{t('recentTasks')}</CardTitle>
          </CardHeader>
          <CardContent className="p-0 sm:p-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-4 sm:pl-0">{t('taskColumn')}</TableHead>
                  <TableHead>{t('statusColumn')}</TableHead>
                  <TableHead className="hidden sm:table-cell">{t('assigneeColumn')}</TableHead>
                  <TableHead className="hidden md:table-cell">{t('dueDateColumn')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-4 w-1/2" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                      <TableCell className="hidden sm:table-cell"><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-24" /></TableCell>
                    </TableRow>
                  ))
                ) : (
                  tasks?.slice(0, 5).map((task) => {
                    const assignedWorkers = (task.workerIds || []).map(id => workersMap.get(id)).filter(Boolean) as WithId<Worker>[];
                    const workerNameDisplay = assignedWorkers.length > 0 ? assignedWorkers.map(w => `${w.firstName} ${w.lastName}`).join(', ') : 'Unassigned';
                    return (
                      <RecentTaskRow key={task.id} task={task} workerName={workerNameDisplay} />
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
