
import { redirect } from 'next/navigation';

export default function Home({ params: { locale } }: { params: { locale: string } }) {
  // Directly redirect the landing page to the dashboard.
  redirect(`/${locale}/dashboard`);
}
