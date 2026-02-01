
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import type { Supplier, Item } from "@/lib/types";

const itemSchema = z.object({
  name: z.string().min(1, "Item name is required"),
  description: z.string().min(1, "Description is required"),
  unitPrice: z.coerce.number().positive("Price must be a positive number"),
  stockLevel: z.coerce.number().min(0, "Stock can't be negative"),
  reorderLevel: z.coerce.number().min(0, "Reorder level can't be negative"),
  supplierId: z
    .string({ required_error: "Please select a supplier." })
    .min(1, "Please select a supplier."),
});

interface AddItemDialogProps {
  children: React.ReactNode;
  suppliers: WithId<Supplier>[];
  item?: WithId<Item>;
}

export function AddItemDialog({
  children,
  suppliers,
  item,
}: AddItemDialogProps) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const firestore = useFirestore();
  const t = useTranslations("InventoryPage.AddInventoryItemDialog");
  const isEditMode = !!item;

  const form = useForm<z.infer<typeof itemSchema>>({
    resolver: zodResolver(itemSchema),
    defaultValues: {
      name: "",
      description: "",
      unitPrice: "" as any,
      stockLevel: "" as any,
      reorderLevel: "" as any,
      supplierId: "",
    },
  });

  useEffect(() => {
    if (open) {
      if (item) {
        form.reset(item);
      } else {
        form.reset({
          name: "",
          description: "",
          unitPrice: "" as any,
          stockLevel: "" as any,
          reorderLevel: "" as any,
          supplierId: "",
        });
      }
    }
  }, [open, item, form]);

  const onSubmit = (values: z.infer<typeof itemSchema>) => {
    if (!firestore) return;

    if (isEditMode && item) {
      const itemRef = doc(firestore, "items", item.id);
      updateDocumentNonBlocking(itemRef, values);
      toast({
        title: t("toastUpdateTitle"),
        description: t("toastDescription", { name: values.name }),
      });
    } else {
      const itemsRef = collection(firestore, "items");
      addDocumentNonBlocking(itemsRef, values);
      toast({
        title: t("toastTitle"),
        description: t("toastDescription", { name: values.name }),
      });
    }

    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
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
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("nameLabel")}</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Corn Seeds" {...field} />
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
                      placeholder="e.g. High-yield hybrid corn seeds"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="unitPrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("priceLabel")}</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="5000" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="stockLevel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("stockLabel")}</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="100" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="reorderLevel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("reorderLabel")}</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="20" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="supplierId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("supplierLabel")}</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue
                          placeholder={t("selectSupplierPlaceholder")}
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {suppliers.map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.companyName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit">{isEditMode ? t('saveButton') : t("addButton")}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
