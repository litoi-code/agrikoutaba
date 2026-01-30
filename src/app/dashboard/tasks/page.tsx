import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { PlusCircle } from "lucide-react";
import { tasks } from "@/lib/data";
import type { Task } from "@/lib/types";

const TaskCard = ({ task }: { task: Task }) => (
  <Card>
    <CardContent className="p-4">
      <div className="flex justify-between items-start">
        <h3 className="font-semibold mb-2">{task.title}</h3>
        <Badge variant="outline">{task.type}</Badge>
      </div>
      <p className="text-sm text-muted-foreground mb-4">Due: {task.dueDate}</p>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Avatar className="h-6 w-6">
            <AvatarImage src={task.assignee.avatarUrl} alt={task.assignee.name} />
            <AvatarFallback>{task.assignee.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <span className="text-sm">{task.assignee.name}</span>
        </div>
      </div>
    </CardContent>
  </Card>
);

const TaskColumn = ({ title, tasks }: { title: string; tasks: Task[] }) => (
  <div className="flex flex-col gap-4">
    <h2 className="text-xl font-semibold font-headline">{title}</h2>
    <div className="flex flex-col gap-4">
      {tasks.map((task) => (
        <TaskCard key={task.id} task={task} />
      ))}
    </div>
  </div>
);

export default function TasksPage() {
  const todoTasks = tasks.filter(t => t.status === 'To Do');
  const inProgressTasks = tasks.filter(t => t.status === 'In Progress');
  const doneTasks = tasks.filter(t => t.status === 'Done');

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-headline font-bold">Tasks</h1>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add New Task
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <TaskColumn title="To Do" tasks={todoTasks} />
        <TaskColumn title="In Progress" tasks={inProgressTasks} />
        <TaskColumn title="Done" tasks={doneTasks} />
      </div>
    </div>
  );
}
