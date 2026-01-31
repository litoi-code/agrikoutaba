
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { collection } from "firebase/firestore";
import { useFirestore, addDocumentNonBlocking, type WithId } from "@/firebase";
import { useTranslations } from "next-intl";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import type { Worker } from "@/lib/types";

const taskSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  workerIds: z
    .array(z.string())
    .min(1, "At least one worker must be assigned."),
  status: z.enum(["To Do", "In Progress", "Completed"]),
  dueDate: z.date({ required_error: "Please select a due date." }),
});

interface AddTaskDialogProps {
  children: React.ReactNode;
  workers: WithId<Worker>[];
}

export function AddTaskDialog({ children, workers }: AddTaskDialogProps) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const firestore = useFirestore();
  const t = useTranslations("TasksPage.AddTaskDialog");

  const form = useForm<z.infer<typeof taskSchema>>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: "",
      description: "",
      workerIds: [],
      status: "To Do",
      dueDate: new Date(),
    },
  });

  const onSubmit = (values: z.infer<typeof taskSchema>) => {
    if (!firestore) return;
    const tasksRef = collection(firestore, "tasks");
    addDocumentNonBlocking(tasksRef, {
      ...values,
      dueDate: values.dueDate.toISOString(),
    });
    toast({
      title: t("toastTitle"),
      description: t("toastDescription", { title: values.title }),
    });
    form.reset();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen} modal={false}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription>{t("description")}</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 py-4"
          >
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("titleLabel")}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g. Prepare soil for planting"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("descriptionLabel")}</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Detailed description of the task."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="workerIds"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("assigneesLabel")}</FormLabel>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal"
                        >
                          {field.value?.length > 0
                            ? `${field.value.length} worker(s) selected`
                            : t("selectWorkersPlaceholder")}
                        </Button>
                      </FormControl>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-[--radix-dropdown-menu-trigger-width]">
                      {workers.map((worker) => (
                        <DropdownMenuCheckboxItem
                          key={worker.id}
                          checked={field.value?.includes(worker.id)}
                          onCheckedChange={(checked) => {
                            const currentIds = field.value || [];
                            if (checked) {
                              field.onChange([...currentIds, worker.id]);
                            } else {
                              field.onChange(
                                currentIds.filter((id) => id !== worker.id)
                              );
                            }
                          }}
                        >
                          {`${worker.firstName} ${worker.lastName}`}
                        </DropdownMenuCheckboxItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("statusLabel")}</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue
                            placeholder={t("selectStatusPlaceholder")}
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="To Do">{t("statusToDo")}</SelectItem>
                        <SelectItem value="In Progress">
                          {t("statusInProgress")}
                        </SelectItem>
                        <SelectItem value="Completed">
                          {t("statusCompleted")}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>{t("dueDateLabel")}</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter>
              <Button type="submit">{t("addButton")}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
