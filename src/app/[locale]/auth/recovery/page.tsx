'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '@/lib/supabase';
import { useRouter, useParams } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { Leaf, Eye, EyeOff, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const resetSchema = z
  .object({
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string().min(6, 'Password must be at least 6 characters'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export default function RecoveryPage() {
  const router = useRouter();
  const params = useParams();
  const locale = (params.locale as string) || 'en';
  const t = useTranslations('RecoveryPage');
  const tGlobal = useTranslations('Global');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [checking, setChecking] = useState(true);
  const [sessionReady, setSessionReady] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<z.infer<typeof resetSchema>>({
    resolver: zodResolver(resetSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  useEffect(() => {
    let mounted = true;

    supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;
      if (event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN') {
        if (session) {
          setSessionReady(true);
          setChecking(false);
        }
      }
    });

    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (!mounted) return;
        if (data.session) {
          setSessionReady(true);
        } else {
          setSessionReady(false);
        }
        setChecking(false);
      })
      .catch(() => {
        if (!mounted) return;
        setError(t('invalidLink'));
        setChecking(false);
      });

    return () => {
      mounted = false;
    };
  }, [t]);

  async function onSubmit(values: z.infer<typeof resetSchema>) {
    setError(null);
    setSuccess(null);
    try {
      const { error } = await supabase.auth.updateUser({ password: values.password });
      if (error) throw error;
      setSuccess(t('successMessage'));
      await supabase.auth.signOut();
      setTimeout(() => {
        router.push(`/${locale}/login`);
      }, 2000);
    } catch (err: any) {
      setError(err.message ?? t('errorMessage'));
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm space-y-8">
        <div className="flex flex-col items-center justify-center gap-2 text-center">
          <Leaf className="h-8 w-8 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">{tGlobal('appName')}</h1>
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">{t('title')}</CardTitle>
            <CardDescription>{t('description')}</CardDescription>
          </CardHeader>
          <CardContent>
            {checking ? (
              <div className="flex flex-col items-center gap-2 py-8 text-center">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">{t('checking')}</p>
              </div>
            ) : !sessionReady ? (
              <Alert variant="destructive">
                <AlertTitle>{t('invalidLinkTitle')}</AlertTitle>
                <AlertDescription>{t('invalidLink')}</AlertDescription>
              </Alert>
            ) : (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  {error && (
                    <Alert variant="destructive">
                      <AlertTitle>{t('errorTitle')}</AlertTitle>
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}
                  {success && (
                    <Alert>
                      <AlertTitle>{t('successTitle')}</AlertTitle>
                      <AlertDescription>{success}</AlertDescription>
                    </Alert>
                  )}
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('newPasswordLabel')}</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input type={showPassword ? "text" : "password"} {...field} />
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="absolute right-0 top-0 h-full px-3"
                              onClick={() => setShowPassword(!showPassword)}
                            >
                              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('confirmPasswordLabel')}</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input type={showPassword ? "text" : "password"} {...field} />
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="absolute right-0 top-0 h-full px-3"
                              onClick={() => setShowPassword(!showPassword)}
                            >
                              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={form.formState.isSubmitting}
                  >
                    {form.formState.isSubmitting ? t('submitting') : t('submitButton')}
                  </Button>
                </form>
              </Form>
            )}
            <div className="mt-4 text-center text-sm">
              <Link href={`/${locale}/login`} className="underline">
                {t('backToLogin')}
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
