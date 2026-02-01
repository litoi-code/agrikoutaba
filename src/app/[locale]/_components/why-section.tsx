'use client';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { CheckCircle } from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export function WhySection() {
    const t = useTranslations('HomePage');
    const localFarmerImage = PlaceHolderImages.find(p => p.id === "local-farmer");

    const whyPoints = [
        t('whyAgriFuturePoint1'),
        t('whyAgriFuturePoint2'),
        t('whyAgriFuturePoint3'),
    ];

    return (
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
    );
}
