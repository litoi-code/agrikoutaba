'use client';
import { useTranslations } from 'next-intl';
import { CheckCircle } from 'lucide-react';

export function WhySection() {
    const t = useTranslations('HomePage');

    const whyPoints = [
        t('whyAgriFuturePoint1'),
        t('whyAgriFuturePoint2'),
        t('whyAgriFuturePoint3'),
    ];

    return (
        <section className="py-16 md:py-24 bg-card">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-headline font-bold mb-6">{t('whyAgriFutureTitle')}</h2>
              <p className="text-lg text-muted-foreground mb-8">{t('whyAgriFutureDescription')}</p>
              <ul className="space-y-4 inline-block text-left">
                {whyPoints.map((point) => (
                  <li key={point} className="flex items-center gap-3">
                    <CheckCircle className="h-6 w-6 text-primary" />
                    <span className="text-lg">{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
    );
}
