
"use client";
import { useMemo } from 'react';
import { collection } from 'firebase/firestore';
import { useFirestore, useCollection, useMemoFirebase, type WithId, useUser } from '@/firebase';
import { useTranslations } from 'next-intl';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PlusCircle } from "lucide-react";
import { Skeleton } from '@/components/ui/skeleton';
import { AddItemDialog } from './add-item-dialog';
import type { Item, Supplier } from '@/lib/types';

export default function InventoryPage() {
  const firestore = useFirestore();
  const { user } = useUser();
  const t = useTranslations('InventoryPage');
  const tGlobal = useTranslations('Global');

  const itemsQuery = useMemoFirebase(() => (firestore && user) ? collection(firestore, 'items') : null, [firestore, user]);
  const { data: items, isLoading: itemsLoading } = useCollection<Item>(itemsQuery);

  const suppliersQuery = useMemoFirebase(() => (firestore && user) ? collection(firestore, 'suppliers') : null, [firestore, user]);
  const { data: suppliers, isLoading: suppliersLoading } = useCollection<Supplier>(suppliersQuery);

  const suppliersMap = useMemo(() => {
    if (!suppliers) return new Map<string, string>();
    return new Map(suppliers.map(s => [s.id, s.companyName]));
  }, [suppliers]);

  const isLoading = itemsLoading || suppliersLoading;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-headline font-bold">{t('title')}</h1>
        <AddItemDialog suppliers={suppliers ?? []}>
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            {t('addNew')}
          </Button>
        </AddItemDialog>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>{t('title')}</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('nameColumn')}</TableHead>
                <TableHead className="hidden sm:table-cell">{t('supplierColumn')}</TableHead>
                <TableHead className="text-right">{t('stockColumn')}</TableHead>
                <TableHead className="text-right">{t('statusColumn')}</TableHead>
                <TableHead className="text-right">{t('priceColumn')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell className="hidden sm:table-cell"><Skeleton className="h-4 w-28" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-4 w-12 ml-auto" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-6 w-20 ml-auto" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-4 w-20 ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : (
                items?.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell className="hidden sm:table-cell text-muted-foreground">{suppliersMap.get(item.supplierId) ?? 'Unknown'}</TableCell>
                    <TableCell className="text-right font-mono">{item.stockLevel}</TableCell>
                    <TableCell className="text-right">
                      {item.stockLevel <= item.reorderLevel ? (
                        <Badge variant="destructive">{t('statusLowStock')}</Badge>
                      ) : (
                        <Badge variant="secondary">{t('statusInStock')}</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right font-mono">{item.unitPrice.toLocaleString()} {tGlobal('currency')}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
