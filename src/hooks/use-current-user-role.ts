
'use client';
import { useFirestore, useUser, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { Worker } from '@/lib/types';

export function useCurrentUserRole() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

  const workerDocRef = useMemoFirebase(() => 
    (firestore && user) ? doc(firestore, 'workers', user.uid) : null
  , [firestore, user]);

  const { data: currentWorker, isLoading: isRoleLoading } = useDoc<Worker>(workerDocRef);

  const role = currentWorker?.role;
  const isLoading = isUserLoading || isRoleLoading;

  return { role, isLoading, currentWorker };
}

    