'use client';
import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';

export function Footer() {
    const t = useTranslations('HomePage');
    const [year, setYear] = useState<number | null>(null);

    useEffect(() => {
        setYear(new Date().getFullYear());
    }, []);

    return (
      <footer className="bg-background border-t">
        <div className="container mx-auto px-4 py-6 text-center text-muted-foreground">
          <p className="text-sm">
            {year ? t('footer', { year }) : t('footer', { year: '...' })}
          </p>
        </div>
      </footer>
    );
}
