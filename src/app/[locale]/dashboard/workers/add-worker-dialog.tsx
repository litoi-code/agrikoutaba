"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { doc, collection } from "firebase/firestore";
import {
  useFirestore,
  updateDocumentNonBlocking,
  addDocumentNonBlocking,
  type WithId,
} from "@/firebase";
import { useTranslations } from "next-intl";

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
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import type { Worker } from "@/lib/types";

const workerSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address").optional().or(z.literal('')),
  role: z.enum(["Admin", "Manager", "Worker"]),
  contactNumber: z.string().min(1, "Contact number is required"),
});

interface AddWorkerDialogProps {
  children?: React.ReactNode;
  worker: WithId<Worker> | null;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function AddWorkerDialog({ children, worker, open: controlledOpen, onOpenChange: setControlledOpen }: AddWorkerDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = setControlledOpen !== undefined ? setControlledOpen : setInternalOpen;

  const { toast } = useToast();
  const firestore = useFirestore();
  const t = useTranslations("WorkersPage.AddWorkerDialog");
  const isEditMode = !!worker;

  const form = useForm<z.infer<typeof workerSchema>>({
    resolver: zodResolver(workerSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      role: "Worker",
      contactNumber: "",
    },
  });

  useEffect(() => {
    if (open) {
      if (worker) {
        form.reset({
          firstName: worker.firstName || "",
          lastName: worker.lastName || "",
          email: worker.email || "",
          role: worker.role || "Worker",
          contactNumber: worker.contactNumber || "",
        });
      } else {
        form.reset({
          firstName: "",
          lastName: "",
          email: "",
          role: "Worker",
          contactNumber: "",
        });
      }
    }
  }, [open, worker, form]);

  const onSubmit = (values: z.infer<typeof workerSchema>) => {
    if (!firestore) return;

    if (isEditMode && worker) {
      const workerRef = doc(firestore, "workers", worker.id);
      updateDocumentNonBlocking(workerRef, values);
      toast({
        title: t("toastUpdateTitle"),
        description: t("toastDescription", {
          firstName: values.firstName,
          lastName: values.lastName,
        }),
      });
    } else {
      const workersRef = collection(firestore, "workers");
      addDocumentNonBlocking(workersRef, {
        ...values,
        createdAt: new Date().toISOString(),
        taskIds: [],
      });
      toast({
        title: t("toastTitle"),
        description: t("toastDescription", {
          firstName: values.firstName,
          lastName: values.lastName,
        }),
      });
    }
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {children && <DialogTrigger asChild>{children}</DialogTrigger>}
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEditMode ? t("editTitle") : t("title")}</DialogTitle>
          <DialogDescription>
            {isEditMode ? t("editDescription") : t("description")}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 py-4"
          >
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("firstNameLabel")}</FormLabel>
                    <FormControl>
                      <Input placeholder="John" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("lastNameLabel")}</FormLabel>
                    <FormControl>
                      <Input placeholder="Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("emailLabel")}</FormLabel>
                  <FormControl>
                    <Input placeholder="john.doe@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("roleLabel")}</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Worker">{t('roleWorker')}</SelectItem>
                      <SelectItem value="Manager">{t('roleManager')}</SelectItem>
                      <SelectItem value="Admin">{t('roleAdmin')}</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="contactNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("phoneLabel")}</FormLabel>
                  <FormControl>
                    <Input placeholder="(123) 456-7890" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit">{isEditMode ? t("saveButton") : t("addButton")}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
