import Image from 'next/image';
import { Link } from 'next-intl';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Users, ClipboardList, Landmark, AreaChart } from 'lucide-react';

export default function Home() {
  const t = useTranslations('HomePage');

  const features = [
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

  const heroImage = PlaceHolderImages.find(p => p.id === "hero-image");

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1">
        <section className="relative w-full h-[60vh] md:h-[80vh]">
          {heroImage && (
            <Image
              src={heroImage.imageUrl}
              alt={heroImage.description}
              fill
              className="object-cover"
              data-ai-hint={heroImage.imageHint}
              priority
            />
          )}
          <div className="absolute inset-0 bg-black/50" />
          <div className="relative h-full flex flex-col items-center justify-center text-center text-white p-4">
            <h1 className="text-4xl md:text-6xl font-headline font-bold mb-4 drop-shadow-md">
              {t('title')}
            </h1>
            <p className="text-lg md:text-2xl max-w-3xl mb-8 drop-shadow-sm">
              {t('subtitle')}
            </p>
            <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold">
              <Link href="/dashboard">{t('getStarted')}</Link>
            </Button>
          </div>
        </section>

        <section id="features" className="py-16 md:py-24 bg-background">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-headline font-bold text-center mb-12">
              {t('allInOne')}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
              {features.map((feature) => (
                <Card key={feature.title} className="bg-card hover:shadow-lg transition-shadow duration-300">
                  <CardHeader className="flex flex-row items-center gap-4">
                    {feature.icon}
                    <CardTitle className="font-headline">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 md:py-24 bg-secondary">
           <div className="container mx-auto px-4 text-center">
              <h2 className="text-3xl md:text-4xl font-headline font-bold mb-4">{t('ctaTitle')}</h2>
              <p className="text-lg text-muted-foreground mb-8">{t('ctaSubtitle')}</p>
              <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold">
                <Link href="/dashboard">{t('goToDashboard')}</Link>
              </Button>
           </div>
        </section>
      </main>

      <footer className="bg-card border-t">
        <div className="container mx-auto px-4 py-6 text-center text-muted-foreground">
          <p>{t('footer', {year: new Date().getFullYear()})}</p>
        </div>
      </footer>
    </div>
  );
}
