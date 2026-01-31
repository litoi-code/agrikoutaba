
import Link from "next/link";
import { getTranslations } from "next-intl/server";
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
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { FirebaseClientProvider } from "@/firebase";
import { LanguageSwitcher } from "@/components/language-switcher";

export default async function DashboardLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const t = await getTranslations({ locale, namespace: "Sidebar" });
  const tGlobal = await getTranslations({ locale, namespace: "Global" });

  const navItems = [
    { href: "/dashboard", icon: <LayoutDashboard />, label: t("dashboard") },
    { href: "/dashboard/inventory", icon: <Boxes />, label: t("inventory") },
    { href: "/dashboard/contacts", icon: <UsersRound />, label: t("contacts") },
    { href: "/dashboard/tasks", icon: <ClipboardList />, label: t("tasks") },
    { href: "/dashboard/workers", icon: <Users />, label: t("workers") },
    { href: "/dashboard/finances", icon: <Landmark />, label: t("finances") },
    { href: "/dashboard/investments", icon: <AreaChart />, label: t("investments") },
  ];

  const userAvatar = PlaceHolderImages.find((p) => p.id === "avatar-1");

  return (
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
              {userAvatar && <AvatarImage src={userAvatar.imageUrl} alt="User Avatar" />}
              <AvatarFallback>U</AvatarFallback>
            </Avatar>
            <div className="flex flex-col group-data-[collapsible=icon]:hidden">
              <span className="text-sm font-semibold">{t("farmOwner")}</span>
              <span className="text-xs text-muted-foreground">
                owner@agrikoutaba.com
              </span>
            </div>
            <div className="ml-auto flex items-center group-data-[collapsible=icon]:hidden">
               <LanguageSwitcher />
               <Button variant="ghost" size="icon" title={t('settings')}>
                <Settings className="h-5 w-5" />
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
          <FirebaseClientProvider>{children}</FirebaseClientProvider>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
