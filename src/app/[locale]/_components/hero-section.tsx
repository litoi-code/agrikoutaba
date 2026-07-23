'use client';

import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';
import { Button } from '@/components/ui/button';

export function HeroSection() {
  const t = useTranslations('HomePage');
  const locale = useLocale();

  return (
    <section className="relative w-full h-screen overflow-hidden bg-primary">
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
                    <Link href={`/${locale}/dashboard`}>{t('getStarted')}</Link>
                </Button>
            </div>
        </div>
      </div>
    </section>
  );
}
