
"use client";
import { useMemo, useState, useEffect } from 'react';
import { collection, doc } from 'firebase/firestore';
import { useFirestore, useCollection, useMemoFirebase, type WithId, deleteDocumentNonBlocking } from '@/firebase';
import { useTranslations } from 'next-intl';
import { format } from 'date-fns';
import {
  Card,
  CardContent,
} from "@/components/ui/card";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { PlusCircle, MoreHorizontal, Edit, Trash, Search, Sparkles } from "lucide-react";
import type { Task, Worker } from "@/lib/types";
import { Skeleton } from '@/components/ui/skeleton';
import { TaskFormDialog } from './add-task-dialog';
import { useToast } from '@/hooks/use-toast';
import { useCurrentUserRole } from '@/hooks/use-current-user-role';
import { cn, isNew } from '@/lib/utils';

const TaskCard = ({ task, assignees, workers, t, canEdit }: { task: WithId<Task>, assignees: WithId<Worker>[], workers: WithId<Worker>[], t: any, canEdit: boolean }) => {
  const [formattedDate, setFormattedDate] = useState('');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const firestore = useFirestore();
  const { toast } = useToast();
  const tForm = useTranslations("TasksPage.TaskFormDialog");
  const isRecentlyAdded = isNew(task.createdAt);

  useEffect(() => {
    if (task.dueDate) {
      setFormattedDate(format(new Date(task.dueDate), 'PPP'));
    }
  }, [task.dueDate]);

  const handleDelete = () => {
    if (!firestore) return;
    const taskRef = doc(firestore, "tasks", task.id);
    deleteDocumentNonBlocking(taskRef);
    toast({
        title: tForm("toastDeleteTitle"),
        description: tForm("toastDeleteDescription", { title: task.title }),
    });
    setIsDeleteDialogOpen(false);
  };

  return (
    <>
      <Card className={cn("flex flex-col relative", isRecentlyAdded && "border-accent/50 bg-accent/10")}>
        {isRecentlyAdded && (
          <div className="absolute -top-2 -right-2">
            <Badge variant="accent" className="text-[8px] uppercase px-1">New</Badge>
          </div>
        )}
        <CardContent className="p-4 flex-col flex h-full">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-semibold pr-2 flex items-center gap-2">
              {isRecentlyAdded && <Sparkles className="h-3 w-3 text-accent shrink-0" />}
              {task.title}
            </h3>
            {canEdit && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <TaskFormDialog workers={workers} task={task}>
                     <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                        <Edit className="mr-2 h-4 w-4" />
                        <span>{t('editAction')}</span>
                    </DropdownMenuItem>
                  </TaskFormDialog>
                  <DropdownMenuItem onClick={() => setIsDeleteDialogOpen(true)} className="text-destructive focus:text-destructive">
                     <Trash className="mr-2 h-4 w-4" />
                     <span>{t('deleteAction')}</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
          <p className="text-sm text-muted-foreground mb-4 flex-grow">{task.description}</p>
          <div className="text-sm text-muted-foreground mb-4">{formattedDate ? t('due', {date: formattedDate}) : <Skeleton className="h-4 w-24" />}</div>
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-2">
                <div className="flex items-center">
                    {assignees && assignees.length > 0 ? (
                    <div className="flex -space-x-2 overflow-hidden">
                        {assignees.map((assignee) => {
                        if (!assignee) return null;
                        const assigneeName = `${assignee.firstName} ${assignee.lastName}`;
                        const assigneeInitial = (assignee.firstName?.charAt(0) ?? '') + (assignee.lastName?.charAt(0) ?? '');
                        return (
                            <Avatar key={assignee.id} className="h-6 w-6 border-2 border-card">
                            {assignee.avatarUrl && <AvatarImage src={assignee.avatarUrl} alt={assigneeName} />}
                            <AvatarFallback>{assigneeInitial}</AvatarFallback>
                            </Avatar>
                        );
                        })}
                    </div>
                    ) : null }
                </div>
                {assignees && assignees.length > 0 && (
                    <div className="text-xs text-muted-foreground">
                        {assignees.map(a => `${a.firstName} ${a.lastName}`).join(', ')}
                    </div>
                )}
            </div>
          </div>
        </CardContent>
      </Card>
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{tForm('deleteTitle')}</AlertDialogTitle>
            <AlertDialogDescription>
              {tForm('deleteDescription')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{tForm('cancelButton')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">{tForm('deleteButton')}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

const TaskColumn = ({ title, tasks, workersMap, workers, isLoading, t, canEdit }: { title: string; tasks: WithId<Task>[]; workersMap: Map<string, WithId<Worker>>, workers: WithId<Worker>[], isLoading: boolean, t: any, canEdit: boolean }) => (
  <div className="flex flex-col gap-4">
    <h2 className="text-xl font-semibold font-headline">{title}</h2>
    <div className="flex flex-col gap-4">
      {isLoading ? (
        Array.from({length: 3}).map((_, i) => (
          <Card key={i}><CardContent className="p-4 space-y-4"><Skeleton className="h-4 w-3/4" /><Skeleton className="h-4 w-1/2" /><Skeleton className="h-6 w-24" /></CardContent></Card>
        ))
      ) : (
        tasks.map((task) => {
          const assignees = (task.workerIds || []).map(id => workersMap.get(id)).filter(Boolean) as WithId<Worker>[];
          return (
            <TaskCard key={task.id} task={task} assignees={assignees} workers={workers} t={t} canEdit={canEdit} />
          )
        })
      )}
    </div>
  </div>
);

export default function TasksPage() {
  const firestore = useFirestore();
  const t = useTranslations('TasksPage');
  const [searchTerm, setSearchTerm] = useState('');
  const { role, isLoading: isRoleLoading } = useCurrentUserRole();

  const canEdit = role === 'Admin' || role === 'Manager';

  const tasksQuery = useMemoFirebase(() => (firestore) ? collection(firestore, 'tasks') : null, [firestore]);
  const { data: tasks, isLoading: tasksLoading } = useCollection<Task>(tasksQuery);

  const workersQuery = useMemoFirebase(() => (firestore) ? collection(firestore, 'workers') : null, [firestore]);
  const { data: workers, isLoading: workersLoading } = useCollection<Worker>(workersQuery);

  const filteredTasks = useMemo(() => {
    if (!tasks) return [];
    return tasks.filter(task =>
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [tasks, searchTerm]);

  const workersMap = useMemo(() => {
    if (!workers) return new Map<string, WithId<Worker>>();
    return new Map(workers.map(w => [w.id, w]));
  }, [workers]);

  const sortedTasks = useMemo(() => {
    if (!filteredTasks) return [];
    return [...filteredTasks].sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  }, [filteredTasks]);

  const todoTasks = useMemo(() => sortedTasks?.filter(t => t.status === 'To Do') ?? [], [sortedTasks]);
  const inProgressTasks = useMemo(() => sortedTasks?.filter(t => t.status === 'In Progress') ?? [], [sortedTasks]);
  const doneTasks = useMemo(() => sortedTasks?.filter(t => t.status === 'Completed') ?? [], [sortedTasks]);
  const allWorkers = useMemo(() => workers ?? [], [workers]);

  const isLoading = tasksLoading || workersLoading || isRoleLoading;

  return (
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
          {!isLoading && canEdit && (
            <TaskFormDialog workers={allWorkers}>
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                {t('addNew')}
              </Button>
            </TaskFormDialog>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-start">
        <TaskColumn title={t('columnToDo')} tasks={todoTasks} workersMap={workersMap} workers={allWorkers} isLoading={isLoading} t={t} canEdit={canEdit} />
        <TaskColumn title={t('columnInProgress')} tasks={inProgressTasks} workersMap={workersMap} workers={allWorkers} isLoading={isLoading} t={t} canEdit={canEdit} />
        <TaskColumn title={t('columnDone')} tasks={doneTasks} workersMap={workersMap} workers={allWorkers} isLoading={isLoading} t={t} canEdit={canEdit} />
      </div>
    </div>
  );
}
