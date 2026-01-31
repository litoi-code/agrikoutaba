"use client";
import { useMemo } from 'react';
import { collection } from 'firebase/firestore';
import { useFirestore, useCollection, useMemoFirebase, type WithId, useUser } from '@/firebase';
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import type { Customer, Supplier } from "@/lib/types";
import { Skeleton } from '@/components/ui/skeleton';
import { AddContactDialog } from './add-contact-dialog';

interface DisplayContact {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  transactionCount: number;
}

const ContactsTable = ({ data, isLoading, t }: { data: DisplayContact[], isLoading: boolean, t: (key: string) => string }) => (
  <Card>
    <CardContent className="p-0">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t('nameColumn')}</TableHead>
            <TableHead className="hidden md:table-cell">{t('companyColumn')}</TableHead>
            <TableHead className="hidden md:table-cell">{t('emailColumn')}</TableHead>
            <TableHead className="hidden sm:table-cell">{t('phoneColumn')}</TableHead>
            <TableHead className="text-right">{t('transactionsColumn')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i}>
                <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-32" /></TableCell>
                <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-40" /></TableCell>
                <TableCell className="hidden sm:table-cell"><Skeleton className="h-4 w-28" /></TableCell>
                <TableCell className="text-right"><Skeleton className="h-4 w-10 ml-auto" /></TableCell>
              </TableRow>
            ))
          ) : (
            data.map((contact) => (
              <TableRow key={contact.id}>
                <TableCell className="font-medium">{contact.name}</TableCell>
                <TableCell className="hidden md:table-cell">{contact.company}</TableCell>
                <TableCell className="hidden md:table-cell">{contact.email}</TableCell>
                <TableCell className="hidden sm:table-cell">{contact.phone}</TableCell>
                <TableCell className="text-right">{contact.transactionCount}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </CardContent>
  </Card>
);

export default function ContactsPage() {
  const firestore = useFirestore();
  const { user } = useUser();
  const t = useTranslations('ContactsPage');

  const customersQuery = useMemoFirebase(() => (firestore && user) ? collection(firestore, 'customers') : null, [firestore, user]);
  const { data: customers, isLoading: customersLoading } = useCollection<Customer>(customersQuery);

  const suppliersQuery = useMemoFirebase(() => (firestore && user) ? collection(firestore, 'suppliers') : null, [firestore, user]);
  const { data: suppliers, isLoading: suppliersLoading } = useCollection<Supplier>(suppliersQuery);

  const customerData: DisplayContact[] = useMemo(() => {
    if (!customers) return [];
    return customers.map(c => ({
      id: c.id,
      name: `${c.firstName} ${c.lastName}`,
      company: '-',
      email: c.email,
      phone: c.contactNumber,
      transactionCount: c.transactionIds?.length ?? 0
    }));
  }, [customers]);

  const supplierData: DisplayContact[] = useMemo(() => {
    if (!suppliers) return [];
    return suppliers.map(s => ({
      id: s.id,
      name: s.contactName,
      company: s.companyName,
      email: s.email,
      phone: s.contactNumber,
      transactionCount: 0 // Suppliers don't have transactions in this model
    }));
  }, [suppliers]);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-headline font-bold">{t('title')}</h1>
        <AddContactDialog>
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            {t('addNew')}
          </Button>
        </AddContactDialog>
      </div>
      
      <Tabs defaultValue="customers">
        <TabsList className="grid w-full grid-cols-2 md:w-[400px]">
          <TabsTrigger value="customers">{t('customersTab')}</TabsTrigger>
          <TabsTrigger value="suppliers">{t('suppliersTab')}</TabsTrigger>
        </TabsList>
        <TabsContent value="customers">
          <ContactsTable data={customerData} isLoading={customersLoading} t={t} />
        </TabsContent>
        <TabsContent value="suppliers">
          <ContactsTable data={supplierData} isLoading={suppliersLoading} t={t} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
