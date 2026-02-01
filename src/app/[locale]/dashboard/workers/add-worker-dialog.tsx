
"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { collection, doc } from "firebase/firestore";
import {
  useFirestore,
  addDocumentNonBlocking,
  updateDocumentNonBlocking,
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
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import type { Worker } from "@/lib/types";

const workerSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  role: z.string().min(1, "Role is required"),
  contactNumber: z.string().min(1, "Contact number is required"),
});

interface AddWorkerDialogProps {
  children: React.ReactNode;
  worker?: WithId<Worker>;
}

export function AddWorkerDialog({ children, worker }: AddWorkerDialogProps) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const firestore = useFirestore();
  const t = useTranslations("WorkersPage.AddWorkerDialog");
  const isEditMode = !!worker;

  const form = useForm<z.infer<typeof workerSchema>>({
    resolver: zodResolver(workerSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      role: "",
      contactNumber: "",
    },
  });

  useEffect(() => {
    if (open) {
      if (worker) {
        form.reset(worker);
      } else {
        form.reset({
          firstName: "",
          lastName: "",
          role: "",
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
      addDocumentNonBlocking(workersRef, { ...values, taskIds: [] });
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
      <DialogTrigger asChild>{children}</DialogTrigger>
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
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("roleLabel")}</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Field Manager" {...field} />
                  </FormControl>
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
