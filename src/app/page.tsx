
import { redirect } from 'next/navigation';

export default function Home() {
  // Middleware handles the locale, so we just redirect to the default dashboard
  redirect('/en/dashboard');
}
