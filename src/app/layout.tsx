// This file is required by Next.js and is the root layout.
// However, with next-intl, we delegate the actual HTML structure
// to the localized layout in `src/app/[locale]/layout.tsx`.
// This component simply passes its children through.

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
