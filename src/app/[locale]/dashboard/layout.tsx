'use client';

import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { usePathname } from "next/navigation";
import { useState, useEffect, use, useMemo } from "react";
import { collection } from "firebase/firestore";
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase";
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
import { FirebaseClientProvider } from "@/firebase";
import { LanguageSwitcher } from "@/components/language-switcher";
import { useCurrentUserRole } from "@/hooks/use-current-user-role";
import { cn, isNew } from "@/lib/utils";
import type { Item, Customer, Supplier, Task, Worker, Income, Expense, Investment } from "@/lib/types";

function DashboardLayoutInner({
  children,
}: {
  children: React.ReactNode;
}) {
  const t = useTranslations("Sidebar");
  const tGlobal = useTranslations("Global");
  const locale = useLocale();
  const pathname = usePathname();
  const { currentWorker } = useCurrentUserRole();
  const [mounted, setMounted] = useState(false);
  const firestore = useFirestore();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch all collections to count "New" entries for sidebar badges
  const itemsQuery = useMemoFirebase(() => firestore ? collection(firestore, 'items') : null, [firestore]);
  const { data: items } = useCollection<Item>(itemsQuery);

  const customersQuery = useMemoFirebase(() => firestore ? collection(firestore, 'customers') : null, [firestore]);
  const { data: customers } = useCollection<Customer>(customersQuery);

  const suppliersQuery = useMemoFirebase(() => firestore ? collection(firestore, 'suppliers') : null, [firestore]);
  const { data: suppliers } = useCollection<Supplier>(suppliersQuery);

  const tasksQuery = useMemoFirebase(() => firestore ? collection(firestore, 'tasks') : null, [firestore]);
  const { data: tasks } = useCollection<Task>(tasksQuery);

  const workersQuery = useMemoFirebase(() => firestore ? collection(firestore, 'workers') : null, [firestore]);
  const { data: workers } = useCollection<Worker>(workersQuery);

  const incomesQuery = useMemoFirebase(() => firestore ? collection(firestore, 'incomes') : null, [firestore]);
  const { data: incomes } = useCollection<Income>(incomesQuery);

  const expensesQuery = useMemoFirebase(() => firestore ? collection(firestore, 'expenses') : null, [firestore]);
  const { data: expenses } = useCollection<Expense>(expensesQuery);

  const investmentsQuery = useMemoFirebase(() => firestore ? collection(firestore, 'investments') : null, [firestore]);
  const { data: investments } = useCollection<Investment>(investmentsQuery);

  const counts = useMemo(() => {
    return {
      inventory: (items || []).filter(i => isNew(i.createdAt)).length,
      contacts: ((customers || []).filter(i => isNew(i.createdAt)).length + (suppliers || []).filter(i => isNew(i.createdAt)).length),
      tasks: (tasks || []).filter(i => isNew(i.createdAt)).length,
      workers: (workers || []).filter(i => isNew(i.createdAt)).length,
      finances: ((incomes || []).filter(i => isNew(i.createdAt)).length + (expenses || []).filter(i => isNew(i.createdAt)).length),
      investments: (investments || []).filter(i => isNew(i.createdAt)).length,
    };
  }, [items, customers, suppliers, tasks, workers, incomes, expenses, investments]);

  const navItems = [
    { href: "/dashboard", icon: <LayoutDashboard className="h-4 w-4" />, label: t("dashboard") },
    { href: "/dashboard/inventory", icon: <Boxes className="h-4 w-4" />, label: t("inventory"), count: counts.inventory },
    { href: "/dashboard/contacts", icon: <UsersRound className="h-4 w-4" />, label: t("contacts"), count: counts.contacts },
    { href: "/dashboard/tasks", icon: <ClipboardList className="h-4 w-4" />, label: t("tasks"), count: counts.tasks },
    { href: "/dashboard/workers", icon: <Users className="h-4 w-4" />, label: t("workers"), count: counts.workers },
    { href: "/dashboard/finances", icon: <Landmark className="h-4 w-4" />, label: t("finances"), count: counts.finances },
    { href: "/dashboard/investments", icon: <AreaChart className="h-4 w-4" />, label: t("investments"), count: counts.investments },
  ];
  
  const userInitial = currentWorker ? `${currentWorker.firstName.charAt(0)}${currentWorker.lastName.charAt(0)}` : '';

  return (
    <SidebarProvider defaultOpen={true}>
      <Sidebar collapsible="icon">
        <SidebarHeader className="p-4">
          <Link href="/dashboard" className="flex items-center gap-2 px-2 group">
            <Leaf className="h-7 w-7 text-primary transition-transform group-hover:rotate-12" />
            <h2 className="text-xl font-headline font-bold truncate group-data-[collapsible=icon]:hidden">
              {tGlobal("appName")}
            </h2>
          </Link>
        </SidebarHeader>
        <SidebarContent className="px-3 gap-1">
          <SidebarMenu>
            {navItems.map((item) => {
              const fullHref = `/${locale}${item.href}`;
              // Handle exact match for dashboard home, startsWith for others
              const isActive = item.href === "/dashboard" 
                ? pathname === fullHref 
                : pathname.startsWith(fullHref);

              return (
                <SidebarMenuItem key={item.label}>
                  <SidebarMenuButton 
                    asChild 
                    tooltip={item.label} 
                    className={cn(
                      "h-12 transition-all duration-300 px-3 relative group/btn",
                      isActive 
                        ? "bg-primary text-primary-foreground font-bold shadow-lg scale-[1.02] border-l-4 border-accent ring-1 ring-primary/20" 
                        : "hover:bg-sidebar-accent text-muted-foreground hover:text-foreground"
                    )}
                    isActive={isActive}
                  >
                    <Link href={item.href} className="flex items-center gap-3 w-full">
                      <span className={cn(
                        "transition-colors duration-300",
                        isActive ? "text-primary-foreground" : "group-hover/btn:text-primary"
                      )}>
                        {item.icon}
                      </span>
                      <span className="flex-1 truncate">{item.label}</span>
                      {mounted && item.count !== undefined && item.count > 0 && (
                        <Badge className={cn(
                          "text-[10px] px-1.5 h-4.5 min-w-4.5 flex items-center justify-center rounded-full transition-all duration-300 shadow-sm",
                          isActive 
                            ? "bg-accent text-accent-foreground font-bold ring-2 ring-primary-foreground/20" 
                            : "bg-primary text-primary-foreground"
                        )}>
                          {item.count}
                        </Badge>
                      )}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter className="mt-auto border-t bg-sidebar-accent/30">
          <div className="flex items-center gap-3 p-4">
            <Avatar className="h-10 w-10 shrink-0 ring-2 ring-primary/10">
              {mounted && currentWorker?.avatarUrl && <AvatarImage src={currentWorker.avatarUrl} alt="User Avatar" />}
              <AvatarFallback className="bg-primary/10 text-primary font-bold">{mounted ? userInitial : ''}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col group-data-[collapsible=icon]:hidden overflow-hidden flex-1">
              <span className="text-sm font-bold truncate leading-none mb-1">
                {mounted ? `${currentWorker?.firstName} ${currentWorker?.lastName}` : '...'}
              </span>
              <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider truncate leading-none">
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
          <SidebarTrigger className="-ml-1 hover:bg-primary/5 text-primary" />
          <div className="flex-1">
             <h1 className="text-lg font-bold md:hidden text-primary truncate">{tGlobal("appName")}</h1>
          </div>
          <div className="flex items-center gap-2 md:hidden">
             {mounted && <LanguageSwitcher />}
          </div>
        </header>
        <main className="flex-1 flex-col bg-background p-4 md:p-8 overflow-x-hidden">
          {!mounted ? (
             <div className="flex h-full w-full items-center justify-center py-20">
                <Leaf className="h-12 w-12 text-primary animate-bounce" />
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
  const { locale } = use(params);

  return (
    <FirebaseClientProvider>
      <DashboardLayoutInner>
        {children}
      </DashboardLayoutInner>
    </FirebaseClientProvider>
  );
}