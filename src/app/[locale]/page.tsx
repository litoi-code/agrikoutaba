'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Users, ClipboardList, Landmark, AreaChart, Boxes, CheckCircle } from 'lucide-react';

export default function Home() {
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

  const whyPoints = [
    t('whyAgriFuturePoint1'),
    t('whyAgriFuturePoint2'),
    t('whyAgriFuturePoint3'),
  ];

  const cocoaImage = PlaceHolderImages.find(p => p.id === "hero-image-cocoa");
  const bananaImage = PlaceHolderImages.find(p => p.id === "hero-image-bananas");
  const localFarmerImage = PlaceHolderImages.find(p => p.id === "local-farmer");

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative w-full h-[70vh] md:h-[90vh] overflow-hidden">
          <div className="absolute inset-0 grid grid-cols-1 md:grid-cols-5">
            <div className="relative md:col-span-3 h-full w-full">
              {cocoaImage && (
                <Image
                  src={cocoaImage.imageUrl}
                  alt={cocoaImage.description}
                  fill
                  className="object-cover"
                  data-ai-hint={cocoaImage.imageHint}
                  priority
                />
              )}
            </div>
            <div className="hidden md:block md:col-span-2 relative h-full w-full">
              {bananaImage && (
                <Image
                  src={bananaImage.imageUrl}
                  alt={bananaImage.description}
                  fill
                  className="object-cover"
                  data-ai-hint={bananaImage.imageHint}
                />
              )}
            </div>
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
          <div className="absolute inset-0 flex flex-col items-center md:items-start justify-center text-center md:text-left text-white p-8 md:p-16">
            <h1 className="text-4xl lg:text-6xl font-headline font-bold mb-4 text-shadow-lg max-w-lg">
              {t('title')}
            </h1>
            <p className="text-lg md:text-xl max-w-md mb-8 text-shadow">
              {t('subtitle')}
            </p>
            <Button asChild size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground font-bold text-lg px-8 py-6 rounded-full shadow-lg transition-transform hover:scale-105">
              <Link href="/dashboard">{t('getStarted')}</Link>
            </Button>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-headline font-bold text-center mb-12">
              {t('allInOne')}
            </h2>
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

        {/* Why AgriFuture Section */}
        <section className="py-16 md:py-24 bg-card">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="relative w-full h-80 md:h-full rounded-lg overflow-hidden shadow-lg">
                {localFarmerImage && (
                  <Image
                    src={localFarmerImage.imageUrl}
                    alt={localFarmerImage.description}
                    fill
                    className="object-cover"
                    data-ai-hint={localFarmerImage.imageHint}
                  />
                )}
              </div>
              <div>
                <h2 className="text-3xl md:text-4xl font-headline font-bold mb-6">{t('whyAgriFutureTitle')}</h2>
                <p className="text-lg text-muted-foreground mb-8">{t('whyAgriFutureDescription')}</p>
                <ul className="space-y-4">
                  {whyPoints.map((point) => (
                    <li key={point} className="flex items-center gap-3">
                      <CheckCircle className="h-6 w-6 text-primary" />
                      <span className="text-lg">{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>
        
        {/* CTA Section */}
        <section className="py-20 md:py-32 bg-secondary/50">
           <div className="container mx-auto px-4 text-center">
              <h2 className="text-3xl md:text-4xl font-headline font-bold mb-4">{t('ctaTitle')}</h2>
              <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">{t('ctaSubtitle')}</p>
              <Button asChild size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground font-bold text-lg px-8 py-6 rounded-full shadow-lg transition-transform hover:scale-105">
                <Link href="/dashboard">{t('goToDashboard')}</Link>
              </Button>
           </div>
        </section>
      </main>

      <footer className="bg-background border-t">
        <div className="container mx-auto px-4 py-6 text-center text-muted-foreground">
          <p className="text-sm">{t('footer', {year: new Date().getFullYear()})}</p>
        </div>
      </footer>
    </div>
  );
}
