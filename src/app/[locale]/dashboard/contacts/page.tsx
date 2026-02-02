
"use client";
import { useMemo, useState } from 'react';
import { collection, doc } from 'firebase/firestore';
import { useFirestore, useCollection, useMemoFirebase, type WithId, useUser, deleteDocumentNonBlocking } from '@/firebase';
import { useTranslations } from 'next-intl';
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlusCircle, MoreHorizontal, Edit, Trash, Search } from "lucide-react";
import type { Customer, Supplier } from "@/lib/types";
import { Skeleton } from '@/components/ui/skeleton';
import { AddContactDialog } from './add-contact-dialog';
import { useToast } from '@/hooks/use-toast';

interface DisplayContact {
  id: string;
  name: string;
  company: string;
  phone: string;
  transactionCount: number;
}

const ContactsTable = ({ data, isLoading, type, t, tDialog }: { data: (WithId<Customer> | WithId<Supplier>)[], isLoading: boolean, type: 'customer' | 'supplier', t: any, tDialog: any }) => {
  const [deleteTarget, setDeleteTarget] = useState<WithId<Customer> | WithId<Supplier> | null>(null);
  const { toast } = useToast();
  const firestore = useFirestore();

  const handleDelete = () => {
    if (!firestore || !deleteTarget) return;
    const collectionName = type === 'customer' ? 'customers' : 'suppliers';
    const docRef = doc(firestore, collectionName, deleteTarget.id);
    deleteDocumentNonBlocking(docRef);

    if (type === 'customer') {
        const c = deleteTarget as WithId<Customer>;
        toast({
            title: tDialog("toastCustomerDeleteTitle"),
            description: tDialog("toastCustomerDescription", {
                firstName: c.firstName,
                lastName: c.lastName,
            }),
        });
    } else {
        const s = deleteTarget as WithId<Supplier>;
        toast({
            title: tDialog("toastSupplierDeleteTitle"),
            description: tDialog("toastSupplierDescription", {
                companyName: s.companyName,
            }),
        });
    }
    setDeleteTarget(null);
  };
  
  return (
    <>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('nameColumn')}</TableHead>
                <TableHead className="hidden md:table-cell">{t('companyColumn')}</TableHead>
                <TableHead className="hidden sm:table-cell">{t('phoneColumn')}</TableHead>
                <TableHead className="text-right">{t('transactionsColumn')}</TableHead>
                <TableHead className="w-[100px] text-right">{t('actionsColumn')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell className="hidden sm:table-cell"><Skeleton className="h-4 w-28" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-4 w-10 ml-auto" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : (
                data.map((contact) => {
                  const isCustomer = 'firstName' in contact;
                  const displayData: DisplayContact = {
                      id: contact.id,
                      name: isCustomer ? `${contact.firstName} ${contact.lastName}` : contact.contactName,
                      company: isCustomer ? '-' : contact.companyName,
                      phone: contact.contactNumber,
                      transactionCount: isCustomer ? (contact.transactionIds?.length ?? 0) : 0
                  };
                  return (
                    <TableRow key={contact.id}>
                      <TableCell className="font-medium">{displayData.name}</TableCell>
                      <TableCell className="hidden md:table-cell">{displayData.company}</TableCell>
                      <TableCell className="hidden sm:table-cell">{displayData.phone}</TableCell>
                      <TableCell className="text-right">{displayData.transactionCount}</TableCell>
                      <TableCell className="text-right">
                         <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <AddContactDialog customer={type === 'customer' ? (contact as WithId<Customer>) : undefined} supplier={type === 'supplier' ? (contact as WithId<Supplier>) : undefined} defaultTab={type}>
                               <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                  <Edit className="mr-2 h-4 w-4" />
                                  <span>{t('editAction')}</span>
                              </DropdownMenuItem>
                            </AddContactDialog>
                            <DropdownMenuItem onClick={() => setDeleteTarget(contact)} className="text-destructive focus:text-destructive">
                               <Trash className="mr-2 h-4 w-4" />
                               <span>{t('deleteAction')}</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{tDialog('deleteTitle')}</AlertDialogTitle>
            <AlertDialogDescription>
              {tDialog('deleteDescription')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{tDialog('cancelButton')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">{tDialog('deleteButton')}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default function ContactsPage() {
  const firestore = useFirestore();
  const { user } = useUser();
  const t = useTranslations('ContactsPage');
  const tDialog = useTranslations('ContactsPage.AddContactDialog');
  const [searchTerm, setSearchTerm] = useState('');

  const customersQuery = useMemoFirebase(() => (firestore && user) ? collection(firestore, 'customers') : null, [firestore, user]);
  const { data: customers, isLoading: customersLoading } = useCollection<Customer>(customersQuery);

  const suppliersQuery = useMemoFirebase(() => (firestore && user) ? collection(firestore, 'suppliers') : null, [firestore, user]);
  const { data: suppliers, isLoading: suppliersLoading } = useCollection<Supplier>(suppliersQuery);

  const filteredCustomers = useMemo(() => {
    if (!customers) return [];
    return customers.filter(c =>
      `${c.firstName} ${c.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [customers, searchTerm]);

  const filteredSuppliers = useMemo(() => {
    if (!suppliers) return [];
    return suppliers.filter(s =>
      s.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.contactName && s.contactName.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [suppliers, searchTerm]);
  
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
          <AddContactDialog>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              {t('addNew')}
            </Button>
          </AddContactDialog>
        </div>
      </div>
      
      <Tabs defaultValue="customers">
        <TabsList className="grid w-full grid-cols-2 md:w-[400px]">
          <TabsTrigger value="customers">{t('customersTab')}</TabsTrigger>
          <TabsTrigger value="suppliers">{t('suppliersTab')}</TabsTrigger>
        </TabsList>
        <TabsContent value="customers">
          <ContactsTable data={filteredCustomers ?? []} isLoading={customersLoading} type="customer" t={t} tDialog={tDialog} />
        </TabsContent>
        <TabsContent value="suppliers">
          <ContactsTable data={filteredSuppliers ?? []} isLoading={suppliersLoading} type="supplier" t={t} tDialog={tDialog} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
