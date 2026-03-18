'use client';
import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';
import { Button } from '@/components/ui/button';

export function CtaSection() {
    const t = useTranslations('HomePage');
    const locale = useLocale();

    return (
        <section className="py-20 md:py-32 bg-secondary/50">
           <div className="container mx-auto px-4 text-center">
              <h2 className="text-3xl md:text-4xl font-headline font-bold mb-4">{t('ctaTitle')}</h2>
              <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">{t('ctaSubtitle')}</p>
              <Button asChild size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground font-bold text-lg px-8 py-6 rounded-full shadow-lg transition-transform hover:scale-105">
                <Link href={`/${locale}/dashboard`}>{t('goToDashboard')}</Link>
              </Button>
           </div>
        </section>
    );
}
