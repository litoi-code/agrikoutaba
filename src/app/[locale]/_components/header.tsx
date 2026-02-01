'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Leaf } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { LanguageSwitcher } from '@/components/language-switcher';

export function Header() {
  const t = useTranslations('HomePage');
  const tGlobal = useTranslations('Global');
  const [isScrolled, setIsScrolled] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        isScrolled ? 'bg-background/80 backdrop-blur-sm border-b' : 'bg-transparent'
      )}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          <Link href="/" className="flex items-center gap-2 text-xl font-bold">
            <Leaf className={cn('h-7 w-7', isScrolled ? 'text-primary' : 'text-primary-foreground')} />
            <span className={cn(isScrolled ? 'text-foreground' : 'text-primary-foreground')}>{tGlobal('appName')}</span>
          </Link>
          <nav className="flex items-center gap-4">
            {hasMounted && <LanguageSwitcher />}
            <Button asChild variant={isScrolled ? 'default' : 'secondary'} className="font-bold hidden sm:flex">
              <Link href="/dashboard">{t('goToDashboard')}</Link>
            </Button>
          </nav>
        </div>
      </div>
    </header>
  );
}
