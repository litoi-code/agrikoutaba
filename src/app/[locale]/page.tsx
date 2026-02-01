'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Users, ClipboardList, Landmark, AreaChart, Boxes, CheckCircle } from 'lucide-react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import React from 'react';

export default function Home() {
  const t = useTranslations('HomePage');
  const plugin = React.useRef(
    Autoplay({ delay: 4000, stopOnInteraction: true })
  );

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

  const heroImages = PlaceHolderImages.filter(p => p.id.startsWith("hero-image"));
  const localFarmerImage = PlaceHolderImages.find(p => p.id === "local-farmer");

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative w-full h-[70vh] md:h-[90vh]">
          <Carousel 
            plugins={[plugin.current]} 
            className="w-full h-full"
            onMouseEnter={plugin.current.stop}
            onMouseLeave={plugin.current.reset}
          >
            <CarouselContent className="-ml-0">
              {heroImages.map((image, index) => (
                <CarouselItem key={image.id} className="pl-0">
                  <div className="relative h-full w-full">
                    <Image
                      src={image.imageUrl}
                      alt={image.description}
                      fill
                      className="object-cover"
                      data-ai-hint={image.imageHint}
                      priority={index === 0}
                    />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="absolute left-4 top-1/2 -translate-y-1/2 text-white bg-black/30 hover:bg-black/50 border-none" />
            <CarouselNext className="absolute right-4 top-1/2 -translate-y-1/2 text-white bg-black/30 hover:bg-black/50 border-none" />
          </Carousel>
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute inset-0 flex flex-col items-center justify-end text-center text-white p-4 sm:p-8 pb-16 md:pb-24">
            <h1 className="text-4xl md:text-6xl font-headline font-bold mb-4 text-shadow-lg">
              {t('title')}
            </h1>
            <p className="text-lg md:text-xl max-w-3xl mb-8 text-shadow">
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
