"use client";
import { useMemo } from 'react';
import { collection } from 'firebase/firestore';
import { useFirestore, useCollection, useMemoFirebase, useUser, type WithId } from '@/firebase';
import { useTranslations } from 'next-intl';
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { Skeleton } from '@/components/ui/skeleton';
import { AddWorkerDialog } from './add-worker-dialog';
import type { Worker } from '@/lib/types';

export default function WorkersPage() {
  const firestore = useFirestore();
  const { user } = useUser();
  const t = useTranslations('WorkersPage');

  const workersQuery = useMemoFirebase(() => (firestore && user) ? collection(firestore, 'workers') : null, [firestore, user]);
  const { data: workers, isLoading: workersLoading } = useCollection<Worker>(workersQuery);
  
  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-headline font-bold">{t('title')}</h1>
        <AddWorkerDialog>
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            {t('addNew')}
          </Button>
        </AddWorkerDialog>
      </div>
      
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('nameColumn')}</TableHead>
                <TableHead>{t('roleColumn')}</TableHead>
                <TableHead className="hidden sm:table-cell">{t('phoneColumn')}</TableHead>
                <TableHead className="text-right">{t('tasksColumn')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {workersLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell className="hidden sm:table-cell"><Skeleton className="h-4 w-28" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-4 w-10 ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : (
                workers?.map((worker) => (
                  <TableRow key={worker.id}>
                    <TableCell className="font-medium">{`${worker.firstName} ${worker.lastName}`}</TableCell>
                    <TableCell>{worker.role}</TableCell>
                    <TableCell className="hidden sm:table-cell">{worker.contactNumber}</TableCell>
                    <TableCell className="text-right">{worker.taskIds?.length ?? 0}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
