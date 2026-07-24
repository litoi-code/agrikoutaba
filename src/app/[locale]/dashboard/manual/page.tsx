
'use client';

import { useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from '@/components/ui/accordion';
import { 
  BookOpen, 
  Sprout, 
  Users, 
  Landmark, 
  ShieldAlert,
  HelpCircle,
  Leaf,
  ListChecks
} from 'lucide-react';
import { useCurrentUserRole } from '@/hooks/use-current-user-role';

export default function ManualPage() {
  const t = useTranslations('ManualPage');
  const { role, isLoading } = useCurrentUserRole();
  const router = useRouter();
  const locale = useLocale();

  useEffect(() => {
    if (!isLoading && role !== 'Admin') {
      router.push(`/${locale}/dashboard`);
    }
  }, [role, isLoading, router, locale]);

  if (isLoading || role !== 'Admin') {
    return (
      <div className="flex h-full w-full items-center justify-center py-20">
        <Leaf className="h-12 w-12 text-primary animate-bounce" />
      </div>
    );
  }

  const manualSections = [
    {
      id: 'item-1',
      icon: <HelpCircle className="h-5 w-5 text-primary" />,
      title: t('introTitle'),
      content: t('introContent'),
    },
    {
      id: 'item-2',
      icon: <Sprout className="h-5 w-5 text-primary" />,
      title: t('productionTitle'),
      content: t('productionContent'),
    },
    {
      id: 'item-3',
      icon: <Users className="h-5 w-5 text-primary" />,
      title: t('laborTitle'),
      content: t('laborContent'),
    },
    {
      id: 'item-4',
      icon: <ListChecks className="h-5 w-5 text-primary" />,
      title: t('tasksTitle'),
      content: t('tasksContent'),
    },
    {
      id: 'item-5',
      icon: <Landmark className="h-5 w-5 text-primary" />,
      title: t('financeTitle'),
      content: t('financeContent'),
    },
    {
      id: 'item-6',
      icon: <ShieldAlert className="h-5 w-5 text-primary" />,
      title: t('rolesTitle'),
      content: t('rolesContent'),
    },
  ];

  return (
    <div className="flex flex-col gap-8 max-w-4xl mx-auto">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-headline font-bold flex items-center gap-3">
          <BookOpen className="h-8 w-8 text-primary" />
          {t('title')}
        </h1>
        <p className="text-muted-foreground text-lg">
          {t('subtitle')}
        </p>
      </div>

      <Card className="border-none shadow-md">
        <CardHeader>
          <CardTitle className="text-xl">Common Workflows</CardTitle>
          <CardDescription>Click on a topic below to learn more.</CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            {manualSections.map((section) => (
              <AccordionItem key={section.id} value={section.id} className="border-b last:border-none py-2">
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-3 text-left">
                    <div className="bg-primary/10 p-2 rounded-full">
                      {section.icon}
                    </div>
                    <span className="font-bold text-base">{section.title}</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-2 pb-4 text-muted-foreground leading-relaxed pl-12">
                  {section.content}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>

      <div className="bg-muted/50 p-6 rounded-lg border border-primary/10 flex items-start gap-4">
        <div className="bg-primary text-primary-foreground p-3 rounded-full shrink-0">
          <BookOpen className="h-6 w-6" />
        </div>
        <div>
          <h3 className="font-bold text-lg mb-1">Need more help?</h3>
          <p className="text-muted-foreground">
            If you encounter issues not covered in this manual, please reach out to the project administrator or your farm manager for assistance.
          </p>
        </div>
      </div>
    </div>
  );
}
