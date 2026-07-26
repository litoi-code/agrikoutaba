'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Leaf } from 'lucide-react';

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex h-full w-full items-center justify-center py-20">
      <div className="flex flex-col items-center gap-4 text-center max-w-md">
        <Leaf className="h-12 w-12 text-primary" />
        <h2 className="text-xl font-bold">Something went wrong</h2>
        <p className="text-muted-foreground text-sm">
          An unexpected error occurred. Please try again.
        </p>
        <Button onClick={reset}>Try Again</Button>
      </div>
    </div>
  );
}