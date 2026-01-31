
"use client";
import { useMemo, useState, useEffect } from 'react';
import { collection } from 'firebase/firestore';
import { useFirestore, useCollection, useMemoFirebase, type WithId, useUser } from '@/firebase';
import { useTranslations } from 'next-intl';
import { format } from 'date-fns';
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PlusCircle } from "lucide-react";
import type { Task, Worker } from "@/lib/types";
import { Skeleton } from '@/components/ui/skeleton';
import { AddTaskDialog } from './add-task-dialog';

const TaskCard = ({ task, assignee, t }: { task: WithId<Task>, assignee?: WithId<Worker>, t: any }) => {
  const assigneeName = assignee ? `${assignee.firstName} ${assignee.lastName}` : 'Unassigned';
  const assigneeInitial = assignee ? (assignee.firstName?.charAt(0) ?? '') + (assignee.lastName?.charAt(0) ?? '') : 'U';
  const [formattedDate, setFormattedDate] = useState('');

  useEffect(() => {
    setFormattedDate(format(new Date(task.dueDate), 'PPP'));
  }, [task.dueDate]);

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <h3 className="font-semibold mb-2">{task.title || task.description}</h3>
        </div>
        <p className="text-sm text-muted-foreground mb-4">{formattedDate ? t('due', {date: formattedDate}) : <Skeleton className="h-4 w-24" />}</p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {assignee ? (
              <>
                <Avatar className="h-6 w-6">
                  {assignee.avatarUrl && <AvatarImage src={assignee.avatarUrl} alt={assigneeName} />}
                  <AvatarFallback>{assigneeInitial}</AvatarFallback>
                </Avatar>
                <span className="text-sm">{assigneeName}</span>
              </>
            ) : (
              <Skeleton className="h-6 w-24" />
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const TaskColumn = ({ title, tasks, workersMap, isLoading, t }: { title: string; tasks: WithId<Task>[]; workersMap: Map<string, WithId<Worker>>, isLoading: boolean, t: any }) => (
  <div className="flex flex-col gap-4">
    <h2 className="text-xl font-semibold font-headline">{title}</h2>
    <div className="flex flex-col gap-4">
      {isLoading ? (
        Array.from({length: 3}).map((_, i) => (
          <Card key={i}><CardContent className="p-4 space-y-4"><Skeleton className="h-4 w-3/4" /><Skeleton className="h-4 w-1/2" /><Skeleton className="h-6 w-24" /></CardContent></Card>
        ))
      ) : (
        tasks.map((task) => (
          <TaskCard key={task.id} task={task} assignee={workersMap.get(task.workerId)} t={t} />
        ))
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

  const todoTasks = useMemo(() => tasks?.filter(t => t.status === 'To Do') ?? [], [tasks]);
  const inProgressTasks = useMemo(() => tasks?.filter(t => t.status === 'In Progress') ?? [], [tasks]);
  const doneTasks = useMemo(() => tasks?.filter(t => t.status === 'Completed') ?? [], [tasks]);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-headline font-bold">{t('title')}</h1>
        <AddTaskDialog workers={workers ?? []}>
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            {t('addNew')}
          </Button>
        </AddTaskDialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <TaskColumn title={t('columnToDo')} tasks={todoTasks} workersMap={workersMap} isLoading={tasksLoading || workersLoading} t={t} />
        <TaskColumn title={t('columnInProgress')} tasks={inProgressTasks} workersMap={workersMap} isLoading={tasksLoading || workersLoading} t={t} />
        <TaskColumn title={t('columnDone')} tasks={doneTasks} workersMap={workersMap} isLoading={tasksLoading || workersLoading} t={t} />
      </div>
    </div>
  );
}
