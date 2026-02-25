'use client';

import Link from "next/link";
import { useTranslations } from "next-intl";
import { useState, useEffect, use } from "react";
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
import { FirebaseClientProvider } from "@/firebase";
import { LanguageSwitcher } from "@/components/language-switcher";
import { useCurrentUserRole } from "@/hooks/use-current-user-role";

function DashboardLayoutInner({
  children,
}: {
  children: React.ReactNode;
}) {
  const t = useTranslations("Sidebar");
  const tGlobal = useTranslations("Global");
  const { currentWorker } = useCurrentUserRole();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const navItems = [
    { href: "/dashboard", icon: <LayoutDashboard className="h-4 w-4" />, label: t("dashboard") },
    { href: "/dashboard/inventory", icon: <Boxes className="h-4 w-4" />, label: t("inventory") },
    { href: "/dashboard/contacts", icon: <UsersRound className="h-4 w-4" />, label: t("contacts") },
    { href: "/dashboard/tasks", icon: <ClipboardList className="h-4 w-4" />, label: t("tasks") },
    { href: "/dashboard/workers", icon: <Users className="h-4 w-4" />, label: t("workers") },
    { href: "/dashboard/finances", icon: <Landmark className="h-4 w-4" />, label: t("finances") },
    { href: "/dashboard/investments", icon: <AreaChart className="h-4 w-4" />, label: t("investments") },
  ];
  
  const userInitial = currentWorker ? `${currentWorker.firstName.charAt(0)}${currentWorker.lastName.charAt(0)}` : '';

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
                  <Link href={item.href} className="flex items-center gap-2 w-full">
                    {item.icon}
                    <span>{item.label}</span>
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
  const { locale } = use(params);

  return (
    <FirebaseClientProvider>
      <DashboardLayoutInner>
        {children}
      </DashboardLayoutInner>
    </FirebaseClientProvider>
  );
}
