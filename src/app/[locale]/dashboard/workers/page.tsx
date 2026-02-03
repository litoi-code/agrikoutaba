
"use client";
import { useMemo, useState } from 'react';
import { collection, doc } from 'firebase/firestore';
import { useFirestore, useCollection, useMemoFirebase, useUser, type WithId, deleteDocumentNonBlocking } from '@/firebase';
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MoreHorizontal, Edit, Trash, Search } from "lucide-react";
import { Skeleton } from '@/components/ui/skeleton';
import { AddWorkerDialog } from './add-worker-dialog';
import type { Worker } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { useCurrentUserRole } from '@/hooks/use-current-user-role';

export default function WorkersPage() {
  const firestore = useFirestore();
  const { user } = useUser();
  const t = useTranslations('WorkersPage');
  const tDialog = useTranslations('WorkersPage.AddWorkerDialog');
  const { toast } = useToast();
  const { role, isLoading: isRoleLoading } = useCurrentUserRole();

  const [deleteTarget, setDeleteTarget] = useState<WithId<Worker> | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const isAdmin = role === 'Admin';

  const workersQuery = useMemoFirebase(() => (firestore && user) ? collection(firestore, 'workers') : null, [firestore, user]);
  const { data: workers, isLoading: workersLoading } = useCollection<Worker>(workersQuery);
  
  const filteredWorkers = useMemo(() => {
    if (!workers) return [];
    return workers.filter(worker =>
        `${worker.firstName} ${worker.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        worker.role.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [workers, searchTerm]);

  const handleDelete = () => {
    if (!firestore || !deleteTarget) return;
    const docRef = doc(firestore, 'workers', deleteTarget.id);
    deleteDocumentNonBlocking(docRef);

    toast({
        title: tDialog("toastDeleteTitle"),
        description: tDialog("toastDescription", {
          firstName: deleteTarget.firstName,
          lastName: deleteTarget.lastName,
        }),
    });
    setDeleteTarget(null);
  };

  const isLoading = workersLoading || isRoleLoading;

  return (
    <>
      <div className="flex flex-col gap-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-headline font-bold">{t('title')}</h1>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t('searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
          </div>
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
                  <TableHead className="w-[100px] text-right">{t('actionsColumn')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell className="hidden sm:table-cell"><Skeleton className="h-4 w-28" /></TableCell>
                      <TableCell className="text-right"><Skeleton className="h-4 w-10 ml-auto" /></TableCell>
                      <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                    </TableRow>
                  ))
                ) : (
                  filteredWorkers?.map((worker) => (
                    <TableRow key={worker.id}>
                      <TableCell className="font-medium">{`${worker.firstName} ${worker.lastName}`}</TableCell>
                      <TableCell>{worker.role}</TableCell>
                      <TableCell className="hidden sm:table-cell">{worker.contactNumber}</TableCell>
                      <TableCell className="text-right">{worker.taskIds?.length ?? 0}</TableCell>
                      <TableCell className="text-right">
                        {!isLoading && isAdmin && (
                         <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <AddWorkerDialog worker={worker}>
                               <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                  <Edit className="mr-2 h-4 w-4" />
                                  <span>{t('editAction')}</span>
                              </DropdownMenuItem>
                            </AddWorkerDialog>
                            <DropdownMenuItem onClick={() => setDeleteTarget(worker)} className="text-destructive focus:text-destructive">
                               <Trash className="mr-2 h-4 w-4" />
                               <span>{t('deleteAction')}</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{tDialog('deleteTitle')}</AlertDialogTitle>
            <AlertDialogDescription>
              {tDialog('deleteDescription')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{tDialog('cancelButton')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">{tDialog('deleteButton')}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
