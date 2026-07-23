'use client';

import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { Worker } from '@/lib/types';

/**
 * Hook to provide real role-based access control by fetching the current 
 * worker's profile from Firestore.
 * 
 * SPECIAL OVERRIDE: mbongmebiang@gmail.com is always an Admin.
 */
export function useCurrentUserRole() {
  const { user, isUserLoading: isAuthLoading } = useUser();
  const firestore = useFirestore();

  // Create a memoized reference to the worker document
  const workerDocRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, 'workers', user.uid);
  }, [firestore, user]);

  // Subscribe to the worker document in real-time
  const { data: currentWorker, isLoading: isDocLoading } = useDoc<Worker>(workerDocRef);

  // Default role logic
  let role = currentWorker?.role || 'Worker';

  // Administrative override for the owner email
  if (user?.email === 'mbongmebiang@gmail.com') {
    role = 'Admin';
  }

  const isLoading = isAuthLoading || isDocLoading;

  return { 
    role: role as 'Admin' | 'Manager' | 'Worker', 
    isLoading,
    user: user || null,
    isAuthLoading,
    currentWorker: currentWorker || null 
  };
}
