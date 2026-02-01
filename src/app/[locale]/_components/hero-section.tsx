'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export function HeroSection() {
  const t = useTranslations('HomePage');
  const cocoaImage = PlaceHolderImages.find(p => p.id === "hero-image-cocoa");
  const bananaImage = PlaceHolderImages.find(p => p.id === "hero-image-bananas");

  return (
    <section className="relative w-full h-screen overflow-hidden">
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

      <div className="absolute inset-0 bg-gradient-to-r from-primary/70 via-primary/30 to-transparent" />
      
      <div className="absolute inset-0 flex items-center">
        <div className="container mx-auto px-4">
            <div className="max-w-2xl text-center md:text-left">
                <h1 className="text-5xl lg:text-7xl font-headline font-bold mb-6 text-primary-foreground">
                    {t('title')}
                </h1>
                <p className="text-xl md:text-2xl max-w-xl mb-10 text-primary-foreground/90">
                    {t('subtitle')}
                </p>
                <Button asChild size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground font-bold text-lg px-8 py-6 rounded-full shadow-lg transition-transform hover:scale-105">
                    <Link href="/dashboard">{t('getStarted')}</Link>
                </Button>
            </div>
        </div>
      </div>
    </section>
  );
}
