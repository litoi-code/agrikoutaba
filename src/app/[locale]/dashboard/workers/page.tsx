"use client";
import { useMemo, useState } from 'react';
import { collection, doc } from 'firebase/firestore';
import { useFirestore, useCollection, useMemoFirebase, type WithId, deleteDocumentNonBlocking } from '@/firebase';
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
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { MoreHorizontal, Edit, Trash, Search, Sparkles, PlusCircle } from "lucide-react";
import { Skeleton } from '@/components/ui/skeleton';
import { AddWorkerDialog } from './add-worker-dialog';
import type { Worker, Task } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { useCurrentUserRole } from '@/hooks/use-current-user-role';
import { cn, isNew } from '@/lib/utils';

export default function WorkersPage() {
  const firestore = useFirestore();
  const t = useTranslations('WorkersPage');
  const tDialog = useTranslations('WorkersPage.AddWorkerDialog');
  const tGlobal = useTranslations('Global');
  const { toast } = useToast();
  const { role, isLoading: isRoleLoading } = useCurrentUserRole();

  const [deleteTarget, setDeleteTarget] = useState<WithId<Worker> | null>(null);
  const [editWorker, setEditWorker] = useState<WithId<Worker> | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const isAdmin = role === 'Admin';

  const workersQuery = useMemoFirebase(() => (firestore) ? collection(firestore, 'workers') : null, [firestore]);
  const { data: workers, isLoading: workersLoading } = useCollection<Worker>(workersQuery);
  
  const tasksQuery = useMemoFirebase(() => (firestore) ? collection(firestore, 'tasks') : null, [firestore]);
  const { data: tasks, isLoading: tasksLoading } = useCollection<Task>(tasksQuery);

  const workerTaskCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    tasks?.forEach(task => {
      task.workerIds?.forEach(workerId => {
        counts[workerId] = (counts[workerId] || 0) + 1;
      });
    });
    return counts;
  }, [tasks]);

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

  const isLoading = workersLoading || tasksLoading || isRoleLoading;

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
            {!isLoading && isAdmin && (
              <AddWorkerDialog worker={null}>
                <Button>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  {t('addNew')}
                </Button>
              </AddWorkerDialog>
            )}
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
                  filteredWorkers?.map((worker) => {
                    const entryIsNew = isNew(worker.createdAt);
                    const taskCount = workerTaskCounts[worker.id] || 0;
                    return (
                      <TableRow key={worker.id} className={cn(entryIsNew && "bg-primary/5")}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                             {entryIsNew && <Sparkles className="h-3 w-3 text-primary shrink-0" />}
                             <span className="truncate">{`${worker.firstName} ${worker.lastName}`}</span>
                             {entryIsNew && <Badge variant="default" className="text-[9px] px-1 h-3.5 bg-primary text-primary-foreground">{tGlobal('new')}</Badge>}
                          </div>
                        </TableCell>
                        <TableCell>{worker.role}</TableCell>
                        <TableCell className="hidden sm:table-cell">{worker.contactNumber}</TableCell>
                        <TableCell className="text-right font-mono text-xs">{taskCount}</TableCell>
                        <TableCell className="text-right">
                          {!isLoading && isAdmin && (
                           <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => setEditWorker(worker)}>
                                 <Edit className="mr-2 h-4 w-4" />
                                 <span>{t('editAction')}</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => setDeleteTarget(worker)} className="text-destructive focus:text-destructive">
                                 <Trash className="mr-2 h-4 w-4" />
                                 <span>{t('deleteAction')}</span>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
      <AddWorkerDialog 
        worker={editWorker} 
        open={!!editWorker} 
        onOpenChange={(open) => !open && setEditWorker(null)} 
      />
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
