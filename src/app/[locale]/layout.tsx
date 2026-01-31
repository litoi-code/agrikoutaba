import {NextIntlClientProvider} from 'next-intl';
import {getMessages, getTranslations} from 'next-intl/server';

export async function generateMetadata({params: {locale}}: {params: {locale: string}}): Promise<{title: string, description: string}> {
  const t = await getTranslations({locale, namespace: 'HomePage'});

  return {
    title: 'AgriKoutaba',
    description: t('subtitle'),
  }
}

export default async function RootLayout({
  children,
  params: {locale}
}: Readonly<{
  children: React.ReactNode;
  params: {locale: string};
}>) {
  const messages = await getMessages({locale});

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      {children}
    </NextIntlClientProvider>
  );
}
