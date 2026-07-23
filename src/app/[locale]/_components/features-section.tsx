'use client';

import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, ClipboardList, Landmark, AreaChart, Boxes } from 'lucide-react';

export function FeaturesSection() {
    const t = useTranslations('HomePage');

    const features = [
      {
        icon: <Boxes className="h-8 w-8 text-primary" />,
        title: t('featureInventoryTitle'),
        description: t('featureInventoryDescription'),
      },
      {
        icon: <Users className="h-8 w-8 text-primary" />,
        title: t('featureContactsTitle'),
        description: t('featureContactsDescription'),
      },
      {
        icon: <ClipboardList className="h-8 w-8 text-primary" />,
        title: t('featureTasksTitle'),
        description: t('featureTasksDescription'),
      },
      {
        icon: <Landmark className="h-8 w-8 text-primary" />,
        title: t('featureFinancesTitle'),
        description: t('featureFinancesDescription'),
      },
      {
        icon: <AreaChart className="h-8 w-8 text-primary" />,
        title: t('featureInvestmentsTitle'),
        description: t('featureInvestmentsDescription'),
      },
    ];
  
    return (
        <section id="features" className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-headline font-bold">
                {t('allInOne')}
              </h2>
              <p className="text-lg text-muted-foreground mt-4 max-w-3xl mx-auto">A central hub for your entire agricultural operation, from inventory to investments.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature) => (
                <Card key={feature.title} className="bg-card border-none shadow-md hover:shadow-xl transition-shadow duration-300 rounded-lg overflow-hidden">
                  <CardHeader className="flex flex-row items-center gap-4 p-6">
                    <div className="bg-primary/10 p-3 rounded-full">
                      {feature.icon}
                    </div>
                    <CardTitle className="font-headline text-xl">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 pt-0">
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
    );
}
