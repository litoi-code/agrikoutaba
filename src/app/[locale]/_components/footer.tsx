'use client';
import { useTranslations } from 'next-intl';

export function Footer() {
    const t = useTranslations('HomePage');
    return (
      <footer className="bg-background border-t">
        <div className="container mx-auto px-4 py-6 text-center text-muted-foreground">
          <p className="text-sm">{t('footer', {year: new Date().getFullYear()})}</p>
        </div>
      </footer>
    );
}
