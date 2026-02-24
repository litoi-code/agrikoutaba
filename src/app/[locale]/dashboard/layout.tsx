
'use client';

import Link from "next/link";
import { useTranslations } from "next-intl";
import { useState, useEffect, use, useMemo } from "react";
import {
  AreaChart,
  ClipboardList,
  LayoutDashboard,
  Leaf,
  Landmark,
  UsersRound,
  Users,
  Boxes,
} from "lucide-react";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { FirebaseClientProvider, useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection } from "firebase/firestore";
import { LanguageSwitcher } from "@/components/language-switcher";
import { useCurrentUserRole } from "@/hooks/use-current-user-role";
import { isNew } from "@/lib/utils";
import type { Item, Customer, Supplier, Task, Worker, Income, Expense, Investment } from "@/lib/types";

function DashboardLayoutInner({
  children,
}: {
  children: React.ReactNode;
}) {
  const t = useTranslations("Sidebar");
  const tGlobal = useTranslations("Global");
  const { currentWorker } = useCurrentUserRole();
  const firestore = useFirestore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Data fetching for notification badges
  const itemsQuery = useMemoFirebase(() => firestore ? collection(firestore, 'items') : null, [firestore]);
  const { data: items } = useCollection<Item>(itemsQuery);

  const customersQuery = useMemoFirebase(() => firestore ? collection(firestore, 'customers') : null, [firestore]);
  const { data: customers } = useCollection<Customer>(customersQuery);

  const suppliersQuery = useMemoFirebase(() => firestore ? collection(firestore, 'suppliers') : null, [firestore]);
  const { data: suppliers } = useCollection<Supplier>(suppliersQuery);

  const tasksQuery = useMemoFirebase(() => firestore ? collection(firestore, 'tasks') : null, [firestore]);
  const { data: tasks } = useCollection<Task>(tasksQuery);

  const incomesQuery = useMemoFirebase(() => firestore ? collection(firestore, 'incomes') : null, [firestore]);
  const { data: incomes } = useCollection<Income>(incomesQuery);

  const expensesQuery = useMemoFirebase(() => firestore ? collection(firestore, 'expenses') : null, [firestore]);
  const { data: expenses } = useCollection<Expense>(expensesQuery);

  const investmentsQuery = useMemoFirebase(() => firestore ? collection(firestore, 'investments') : null, [firestore]);
  const { data: investments } = useCollection<Investment>(investmentsQuery);

  const workersQuery = useMemoFirebase(() => firestore ? collection(firestore, 'workers') : null, [firestore]);
  const { data: workers } = useCollection<Worker>(workersQuery);

  const newCounts = useMemo(() => {
    return {
      inventory: (items || []).filter(i => isNew(i.createdAt)).length,
      contacts: (customers || []).filter(c => isNew(c.createdAt)).length + (suppliers || []).filter(s => isNew(s.createdAt)).length,
      tasks: (tasks || []).filter(t => isNew(t.createdAt)).length,
      finances: (incomes || []).filter(i => isNew(i.createdAt)).length + (expenses || []).filter(e => isNew(e.createdAt)).length,
      investments: (investments || []).filter(i => isNew(i.createdAt)).length,
      workers: (workers || []).filter(w => isNew(w.createdAt)).length,
    };
  }, [items, customers, suppliers, tasks, incomes, expenses, investments, workers]);

  const navItems = [
    { href: "/dashboard", icon: <LayoutDashboard className="h-4 w-4" />, label: t("dashboard") },
    { href: "/dashboard/inventory", icon: <Boxes className="h-4 w-4" />, label: t("inventory"), count: newCounts.inventory },
    { href: "/dashboard/contacts", icon: <UsersRound className="h-4 w-4" />, label: t("contacts"), count: newCounts.contacts },
    { href: "/dashboard/tasks", icon: <ClipboardList className="h-4 w-4" />, label: t("tasks"), count: newCounts.tasks },
    { href: "/dashboard/workers", icon: <Users className="h-4 w-4" />, label: t("workers"), count: newCounts.workers },
    { href: "/dashboard/finances", icon: <Landmark className="h-4 w-4" />, label: t("finances"), count: newCounts.finances },
    { href: "/dashboard/investments", icon: <AreaChart className="h-4 w-4" />, label: t("investments"), count: newCounts.investments },
  ];
  
  const userInitial = currentWorker ? `${currentWorker.firstName.charAt(0)}${currentWorker.lastName.charAt(0)}` : '';

  // Render the structural shell consistently to prevent hydration mismatches.
  // We only defer the dynamic data-dependent parts like badges and user initials.
  return (
    <SidebarProvider defaultOpen={true}>
      <Sidebar collapsible="icon">
        <SidebarHeader className="p-4">
          <Link href="/dashboard" className="flex items-center gap-2 px-2">
            <Leaf className="h-6 w-6 text-primary" />
            <h2 className="text-lg font-headline font-bold truncate group-data-[collapsible=icon]:hidden">
              {tGlobal("appName")}
            </h2>
          </Link>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {navItems.map((item) => (
              <SidebarMenuItem key={item.label}>
                <SidebarMenuButton asChild tooltip={item.label} className="h-11">
                  <Link href={item.href} className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-2">
                        {item.icon}
                        <span>{item.label}</span>
                    </div>
                    {mounted && item.count !== undefined && item.count > 0 && (
                        <Badge variant="accent" className="h-5 min-w-5 flex items-center justify-center rounded-full p-0 text-[10px] group-data-[collapsible=icon]:hidden">
                            {item.count}
                        </Badge>
                    )}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
          <div className="flex items-center gap-3 p-3">
            <Avatar className="h-8 w-8 shrink-0">
              {mounted && currentWorker?.avatarUrl && <AvatarImage src={currentWorker.avatarUrl} alt="User Avatar" />}
              <AvatarFallback>{mounted ? userInitial : ''}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col group-data-[collapsible=icon]:hidden overflow-hidden">
              <span className="text-sm font-semibold truncate leading-none mb-1">
                {mounted ? `${currentWorker?.firstName} ${currentWorker?.lastName}` : '...'}
              </span>
              <span className="text-xs text-muted-foreground truncate leading-none">
                {mounted ? currentWorker?.role : '...'}
              </span>
            </div>
            <div className="ml-auto group-data-[collapsible=icon]:hidden">
               {mounted && <LanguageSwitcher />}
            </div>
          </div>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-card px-4 md:px-6 shadow-sm">
          <SidebarTrigger className="-ml-1" />
          <div className="flex-1">
             <h1 className="text-lg font-semibold md:hidden truncate">{tGlobal("appName")}</h1>
          </div>
          <div className="flex items-center gap-2 md:hidden">
             {mounted && <LanguageSwitcher />}
          </div>
        </header>
        <main className="flex-1 flex-col bg-background p-4 md:p-8 overflow-x-hidden">
          {!mounted ? (
             <div className="flex h-full w-full items-center justify-center py-20">
                <Leaf className="h-10 w-10 text-primary animate-pulse" />
             </div>
          ) : children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}

export default function DashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  use(params);

  return (
    <FirebaseClientProvider>
      <DashboardLayoutInner>
        {children}
      </DashboardLayoutInner>
    </FirebaseClientProvider>
  );
}
