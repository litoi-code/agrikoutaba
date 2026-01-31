import type {Metadata} from 'next';
import { Toaster } from "@/components/ui/toaster";
import './globals.css';

// This is the root layout. It's intentionally minimal.
// The main layout with internationalization is in src/app/[locale]/layout.tsx.
// The middleware will redirect users to a localized path.

export const metadata: Metadata = {
  title: 'AgriKoutaba',
  description: 'A centralized platform for managing all aspects of a farming business in Cameroon.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-body antialiased">
          {children}
          <Toaster />
      </body>
    </html>
  );
}
