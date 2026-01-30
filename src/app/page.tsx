import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { CheckCircle, Users, Package, ClipboardList, BrainCircuit, Landmark, AreaChart } from 'lucide-react';

const features = [
  {
    icon: <Users className="h-8 w-8 text-primary" />,
    title: 'Customer & Supplier Management',
    description: 'Maintain profiles, contact details, and transaction history.',
  },
  {
    icon: <Package className="h-8 w-8 text-primary" />,
    title: 'Inventory Tracking',
    description: 'Manage stock levels for seeds, fertilizers, and equipment.',
  },
  {
    icon: <ClipboardList className="h-8 w-8 text-primary" />,
    title: 'Task Management',
    description: 'Assign and track tasks for your team from planting to harvest.',
  },
  {
    icon: <Landmark className="h-8 w-8 text-primary" />,
    title: 'Financial Oversight',
    description: 'Record income, expenses, and manage investments with ease.',
  },
  {
    icon: <BrainCircuit className="h-8 w-8 text-primary" />,
    title: 'AI-Powered Forecasting',
    description: 'Predict cash flow with our intelligent financial forecasting tool.',
  },
   {
    icon: <AreaChart className="h-8 w-8 text-primary" />,
    title: 'Investment Tracking',
    description: 'Monitor investments, profits, and equity details seamlessly.',
  },
];

export default function Home() {
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
              AgriCentral: The Future of Farm Management
            </h1>
            <p className="text-lg md:text-2xl max-w-3xl mb-8 drop-shadow-sm">
              Streamline your operations, track everything from inventory to investments, and make data-driven decisions.
            </p>
            <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold">
              <Link href="/dashboard">Get Started</Link>
            </Button>
          </div>
        </section>

        <section id="features" className="py-16 md:py-24 bg-background">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-headline font-bold text-center mb-12">
              All-in-One Farm Management
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
              <h2 className="text-3xl md:text-4xl font-headline font-bold mb-4">Ready to grow your business?</h2>
              <p className="text-lg text-muted-foreground mb-8">Join AgriCentral and take control of your farm's future.</p>
              <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold">
                <Link href="/dashboard">Go to Dashboard</Link>
              </Button>
           </div>
        </section>
      </main>

      <footer className="bg-card border-t">
        <div className="container mx-auto px-4 py-6 text-center text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} AgriCentral. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
