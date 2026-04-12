import {NextIntlClientProvider} from 'next-intl';
import {getMessages, getTranslations} from 'next-intl/server';
import { Toaster } from "@/components/ui/toaster";
import { FirebaseClientProvider } from "@/firebase";
import '../globals.css';

type Params = Promise<{ locale: string }>;

export async function generateMetadata({params}: {params: Params}): Promise<{title: string, description: string}> {
  const { locale } = await params;
  const t = await getTranslations({locale, namespace: 'HomePage'});

  return {
    title: 'AgriKoutaba',
    description: t('subtitle'),
  }
}

export default async function LocaleLayout({
  children,
  params
}: Readonly<{
  children: React.ReactNode;
  params: Params;
}>) {
  const { locale } = await params;
  const messages = await getMessages({locale});

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=PT+Sans:wght@400;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <NextIntlClientProvider locale={locale} messages={messages}>
          <FirebaseClientProvider>
            {children}
          </FirebaseClientProvider>
        </NextIntlClientProvider>
        <Toaster />
      </body>
    </html>
  );
}
