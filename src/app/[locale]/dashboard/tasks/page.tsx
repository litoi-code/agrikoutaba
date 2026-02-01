"use client";
import { useMemo, useState, useEffect } from 'react';
import { collection, doc } from 'firebase/firestore';
import { useFirestore, useCollection, useMemoFirebase, type WithId, useUser, deleteDocumentNonBlocking } from '@/firebase';
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
import { PlusCircle, MoreHorizontal, Edit, Trash } from "lucide-react";
import type { Task, Worker } from "@/lib/types";
import { Skeleton } from '@/components/ui/skeleton';
import { TaskFormDialog } from './add-task-dialog';
import { useToast } from '@/hooks/use-toast';

const TaskCard = ({ task, assignees, workers, t }: { task: WithId<Task>, assignees: WithId<Worker>[], workers: WithId<Worker>[], t: any }) => {
  const [formattedDate, setFormattedDate] = useState('');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const firestore = useFirestore();
  const { toast } = useToast();
  const tForm = useTranslations("TasksPage.TaskFormDialog");

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
      <Card className="flex flex-col">
        <CardContent className="p-4 flex-col flex h-full">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-semibold pr-2">{task.title}</h3>
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

const TaskColumn = ({ title, tasks, workersMap, workers, isLoading, t }: { title: string; tasks: WithId<Task>[]; workersMap: Map<string, WithId<Worker>>, workers: WithId<Worker>[], isLoading: boolean, t: any }) => (
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
            <TaskCard key={task.id} task={task} assignees={assignees} workers={workers} t={t} />
          )
        })
      )}
    </div>
  </div>
);

export default function TasksPage() {
  const firestore = useFirestore();
  const { user } = useUser();
  const t = useTranslations('TasksPage');

  const tasksQuery = useMemoFirebase(() => (firestore && user) ? collection(firestore, 'tasks') : null, [firestore, user]);
  const { data: tasks, isLoading: tasksLoading } = useCollection<Task>(tasksQuery);

  const workersQuery = useMemoFirebase(() => (firestore && user) ? collection(firestore, 'workers') : null, [firestore, user]);
  const { data: workers, isLoading: workersLoading } = useCollection<Worker>(workersQuery);

  const workersMap = useMemo(() => {
    if (!workers) return new Map<string, WithId<Worker>>();
    return new Map(workers.map(w => [w.id, w]));
  }, [workers]);

  const sortedTasks = useMemo(() => {
    if (!tasks) return [];
    return [...tasks].sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  }, [tasks]);

  const todoTasks = useMemo(() => sortedTasks?.filter(t => t.status === 'To Do') ?? [], [sortedTasks]);
  const inProgressTasks = useMemo(() => sortedTasks?.filter(t => t.status === 'In Progress') ?? [], [sortedTasks]);
  const doneTasks = useMemo(() => sortedTasks?.filter(t => t.status === 'Completed') ?? [], [sortedTasks]);
  const allWorkers = useMemo(() => workers ?? [], [workers]);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-headline font-bold">{t('title')}</h1>
        <TaskFormDialog workers={allWorkers}>
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            {t('addNew')}
          </Button>
        </TaskFormDialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-start">
        <TaskColumn title={t('columnToDo')} tasks={todoTasks} workersMap={workersMap} workers={allWorkers} isLoading={tasksLoading || workersLoading} t={t} />
        <TaskColumn title={t('columnInProgress')} tasks={inProgressTasks} workersMap={workersMap} workers={allWorkers} isLoading={tasksLoading || workersLoading} t={t} />
        <TaskColumn title={t('columnDone')} tasks={doneTasks} workersMap={workersMap} workers={allWorkers} isLoading={tasksLoading || workersLoading} t={t} />
      </div>
    </div>
  );
}
