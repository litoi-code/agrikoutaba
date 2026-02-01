
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
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
import type { Customer, Supplier } from "@/lib/types";

const customerSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  contactNumber: z.string().min(1, "Contact number is required"),
  address: z.string().min(1, "Address is required"),
});

const supplierSchema = z.object({
  companyName: z.string().min(1, "Company name is required"),
  contactName: z.string().min(1, "Contact name is required"),
  contactNumber: z.string().min(1, "Contact number is required"),
  address: z.string().min(1, "Address is required"),
});

interface AddContactDialogProps {
  children: React.ReactNode;
  customer?: WithId<Customer>;
  supplier?: WithId<Supplier>;
  defaultTab?: 'customer' | 'supplier';
}

export function AddContactDialog({
  children,
  customer,
  supplier,
  defaultTab = 'customer',
}: AddContactDialogProps) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const firestore = useFirestore();
  const t = useTranslations("ContactsPage.AddContactDialog");
  const isEditMode = !!(customer || supplier);

  const customerForm = useForm<z.infer<typeof customerSchema>>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      contactNumber: "",
      address: "",
    },
  });

  const supplierForm = useForm<z.infer<typeof supplierSchema>>({
    resolver: zodResolver(supplierSchema),
    defaultValues: {
      companyName: "",
      contactName: "",
      contactNumber: "",
      address: "",
    },
  });

  useEffect(() => {
    if (open) {
      if (customer) {
        customerForm.reset(customer);
      } else {
        customerForm.reset({ firstName: "", lastName: "", contactNumber: "", address: "" });
      }

      if (supplier) {
        supplierForm.reset(supplier);
      } else {
        supplierForm.reset({ companyName: "", contactName: "", contactNumber: "", address: "" });
      }
    }
  }, [open, customer, supplier, customerForm, supplierForm]);

  const onCustomerSubmit = (values: z.infer<typeof customerSchema>) => {
    if (!firestore) return;
    if (customer) {
      const customerRef = doc(firestore, "customers", customer.id);
      updateDocumentNonBlocking(customerRef, values);
      toast({
        title: t("toastCustomerUpdateTitle"),
        description: t("toastCustomerDescription", {
          firstName: values.firstName,
          lastName: values.lastName,
        }),
      });
    } else {
      const customersRef = collection(firestore, "customers");
      addDocumentNonBlocking(customersRef, values);
      toast({
        title: t("toastCustomerTitle"),
        description: t("toastCustomerDescription", {
          firstName: values.firstName,
          lastName: values.lastName,
        }),
      });
    }
    setOpen(false);
  };

  const onSupplierSubmit = (values: z.infer<typeof supplierSchema>) => {
    if (!firestore) return;
    if (supplier) {
      const supplierRef = doc(firestore, "suppliers", supplier.id);
      updateDocumentNonBlocking(supplierRef, values);
       toast({
        title: t("toastSupplierUpdateTitle"),
        description: t("toastSupplierDescription", {
          companyName: values.companyName,
        }),
      });
    } else {
      const suppliersRef = collection(firestore, "suppliers");
      addDocumentNonBlocking(suppliersRef, values);
      toast({
        title: t("toastSupplierTitle"),
        description: t("toastSupplierDescription", {
          companyName: values.companyName,
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
        <Tabs defaultValue={defaultTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="customer" disabled={isEditMode && !!supplier}>{t("customerTab")}</TabsTrigger>
            <TabsTrigger value="supplier" disabled={isEditMode && !!customer}>{t("supplierTab")}</TabsTrigger>
          </TabsList>
          <TabsContent value="customer">
            <Form {...customerForm}>
              <form
                onSubmit={customerForm.handleSubmit(onCustomerSubmit)}
                className="space-y-4 py-4"
              >
                <FormField
                  control={customerForm.control}
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
                  control={customerForm.control}
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
                <FormField
                  control={customerForm.control}
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
                <FormField
                  control={customerForm.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("addressLabel")}</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="123 Main St, Anytown, USA"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button type="submit">{isEditMode ? t('saveButton') : t("addCustomerButton")}</Button>
                </DialogFooter>
              </form>
            </Form>
          </TabsContent>
          <TabsContent value="supplier">
            <Form {...supplierForm}>
              <form
                onSubmit={supplierForm.handleSubmit(onSupplierSubmit)}
                className="space-y-4 py-4"
              >
                <FormField
                  control={supplierForm.control}
                  name="companyName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("companyNameLabel")}</FormLabel>
                      <FormControl>
                        <Input placeholder="Global Seeds Inc." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={supplierForm.control}
                  name="contactName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("contactNameLabel")}</FormLabel>
                      <FormControl>
                        <Input placeholder="Jane Smith" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={supplierForm.control}
                  name="contactNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("phoneLabel")}</FormLabel>
                      <FormControl>
                        <Input placeholder="(987) 654-3210" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={supplierForm.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("addressLabel")}</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="456 Supplier Ave, Industriville"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button type="submit">{isEditMode ? t('saveButton') : t("addSupplierButton")}</Button>
                </DialogFooter>
              </form>
            </Form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
