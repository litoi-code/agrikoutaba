
'use client';

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import {
  AreaChart,
  ClipboardList,
  LayoutDashboard,
  Leaf,
  Landmark,
  UsersRound,
  Settings,
  Users,
  Boxes,
  LogOut
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
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { FirebaseClientProvider, useUser, useAuth } from "@/firebase";
import { LanguageSwitcher } from "@/components/language-switcher";
import { useCurrentUserRole } from "@/hooks/use-current-user-role";

function AuthWall({ children }: { children: React.ReactNode }) {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const locale = useLocale();

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.replace(`/${locale}/login`);
    }
  }, [isUserLoading, user, router, locale]);

  if (isUserLoading || !user) {
    // You can render a loading spinner here
    return (
        <div className="flex h-screen w-full items-center justify-center">
            <Leaf className="h-8 w-8 animate-spin text-primary" />
        </div>
    );
  }

  return <>{children}</>;
}


export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const t = useTranslations("Sidebar");
  const tGlobal = useTranslations("Global");
  const auth = useAuth();
  const router = useRouter();
  const locale = useLocale();
  const { currentWorker } = useCurrentUserRole();
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  const navItems = [
    { href: "/dashboard", icon: <LayoutDashboard />, label: t("dashboard") },
    { href: "/dashboard/inventory", icon: <Boxes />, label: t("inventory") },
    { href: "/dashboard/contacts", icon: <UsersRound />, label: t("contacts") },
    { href: "/dashboard/tasks", icon: <ClipboardList />, label: t("tasks") },
    { href: "/dashboard/workers", icon: <Users />, label: t("workers") },
    { href: "/dashboard/finances", icon: <Landmark />, label: t("finances") },
    { href: "/dashboard/investments", icon: <AreaChart />, label: t("investments") },
  ];
  
  const handleLogout = async () => {
    await signOut(auth);
    router.push(`/${locale}/login`);
  };

  const userInitial = currentWorker ? `${currentWorker.firstName.charAt(0)}${currentWorker.lastName.charAt(0)}` : '';

  return (
    <FirebaseClientProvider>
     <AuthWall>
      <SidebarProvider>
        <Sidebar>
          <SidebarHeader className="p-4">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="text-primary hover:bg-primary/10">
                <Leaf className="h-6 w-6" />
              </Button>
              <h2 className="text-lg font-headline font-semibold group-data-[collapsible=icon]:hidden">
                {tGlobal("appName")}
              </h2>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.label}>
                  <SidebarMenuButton asChild tooltip={item.label}>
                    <Link href={item.href}>
                      {item.icon}
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter>
            <div className="flex items-center gap-3 p-2">
              <Avatar className="h-9 w-9">
                {currentWorker?.avatarUrl && <AvatarImage src={currentWorker.avatarUrl} alt="User Avatar" />}
                <AvatarFallback>{userInitial}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col group-data-[collapsible=icon]:hidden">
                <span className="text-sm font-semibold">{currentWorker ? `${currentWorker.firstName} ${currentWorker.lastName}` : 'Loading...'}</span>
                <span className="text-xs text-muted-foreground">
                  {currentWorker?.email}
                </span>
              </div>
              <div className="ml-auto flex items-center group-data-[collapsible=icon]:hidden">
                 {hasMounted && <LanguageSwitcher />}
                 <Button variant="ghost" size="icon" title={t('logout')} onClick={handleLogout}>
                  <LogOut className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </SidebarFooter>
        </Sidebar>
        <SidebarInset>
          <header className="flex h-14 items-center gap-4 border-b bg-card px-6">
            <SidebarTrigger className="md:hidden" />
            <div className="flex-1">
              {/* Can add breadcrumbs or page title here */}
            </div>
          </header>
          <main className="flex-1 flex-col bg-background p-4 md:p-8">
            {children}
          </main>
        </SidebarInset>
      </SidebarProvider>
     </AuthWall>
    </FirebaseClientProvider>
  );
}

    