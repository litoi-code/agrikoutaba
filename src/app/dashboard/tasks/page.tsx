"use client";
import { useMemo } from 'react';
import { collection } from 'firebase/firestore';
import { useFirestore, useCollection, useMemoFirebase, type WithId, useUser } from '@/firebase';
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

const TaskCard = ({ task, assignee }: { task: WithId<Task>, assignee?: WithId<Worker> }) => (
  <Card>
    <CardContent className="p-4">
      <div className="flex justify-between items-start">
        <h3 className="font-semibold mb-2">{task.title || task.description}</h3>
      </div>
      <p className="text-sm text-muted-foreground mb-4">Due: {new Date(task.dueDate).toLocaleDateString()}</p>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {assignee ? (
            <>
              <Avatar className="h-6 w-6">
                <AvatarImage src={assignee.avatarUrl} alt={assignee.name} />
                <AvatarFallback>{assignee.name?.charAt(0)}</AvatarFallback>
              </Avatar>
              <span className="text-sm">{assignee.name}</span>
            </>
          ) : (
            <Skeleton className="h-6 w-24" />
          )}
        </div>
      </div>
    </CardContent>
  </Card>
);

const TaskColumn = ({ title, tasks, workersMap, isLoading }: { title: string; tasks: WithId<Task>[]; workersMap: Map<string, WithId<Worker>>, isLoading: boolean }) => (
  <div className="flex flex-col gap-4">
    <h2 className="text-xl font-semibold font-headline">{title}</h2>
    <div className="flex flex-col gap-4">
      {isLoading ? (
        Array.from({length: 3}).map((_, i) => (
          <Card key={i}><CardContent className="p-4 space-y-4"><Skeleton className="h-4 w-3/4" /><Skeleton className="h-4 w-1/2" /><Skeleton className="h-6 w-24" /></CardContent></Card>
        ))
      ) : (
        tasks.map((task) => (
          <TaskCard key={task.id} task={task} assignee={workersMap.get(task.workerId)} />
        ))
      )}
    </div>
  </div>
);

export default function TasksPage() {
  const firestore = useFirestore();
  const { user } = useUser();

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
        <h1 className="text-3xl font-headline font-bold">Tasks</h1>
        <AddTaskDialog workers={workers ?? []}>
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add New Task
          </Button>
        </AddTaskDialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <TaskColumn title="To Do" tasks={todoTasks} workersMap={workersMap} isLoading={tasksLoading || workersLoading} />
        <TaskColumn title="In Progress" tasks={inProgressTasks} workersMap={workersMap} isLoading={tasksLoading || workersLoading} />
        <TaskColumn title="Done" tasks={doneTasks} workersMap={workersMap} isLoading={tasksLoading || workersLoading} />
      </div>
    </div>
  );
}
