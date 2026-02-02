
"use client";
import { useMemo, useState } from 'react';
import { collection, doc } from 'firebase/firestore';
import { useFirestore, useCollection, useMemoFirebase, type WithId, useUser, deleteDocumentNonBlocking } from '@/firebase';
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
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { PlusCircle, MoreHorizontal, Edit, Trash, Search } from "lucide-react";
import { Skeleton } from '@/components/ui/skeleton';
import { AddItemDialog } from './add-item-dialog';
import type { Item, Supplier } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { useCurrentUserRole } from '@/hooks/use-current-user-role';

export default function InventoryPage() {
  const firestore = useFirestore();
  const { user } = useUser();
  const t = useTranslations('InventoryPage');
  const tDialog = useTranslations('InventoryPage.AddInventoryItemDialog');
  const tGlobal = useTranslations('Global');
  const { toast } = useToast();
  const { role } = useCurrentUserRole();

  const [deleteTarget, setDeleteTarget] = useState<WithId<Item> | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const canEdit = role === 'Admin' || role === 'Manager';

  const itemsQuery = useMemoFirebase(() => (firestore && user) ? collection(firestore, 'items') : null, [firestore, user]);
  const { data: items, isLoading: itemsLoading } = useCollection<Item>(itemsQuery);

  const suppliersQuery = useMemoFirebase(() => (firestore && user) ? collection(firestore, 'suppliers') : null, [firestore, user]);
  const { data: suppliers, isLoading: suppliersLoading } = useCollection<Supplier>(suppliersQuery);

  const suppliersMap = useMemo(() => {
    if (!suppliers) return new Map<string, string>();
    return new Map(suppliers.map(s => [s.id, s.companyName]));
  }, [suppliers]);

  const filteredItems = useMemo(() => {
    if (!items) return [];
    return items.filter(item =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [items, searchTerm]);

  const isLoading = itemsLoading || suppliersLoading;

  const handleDelete = () => {
    if (!firestore || !deleteTarget) return;
    const docRef = doc(firestore, 'items', deleteTarget.id);
    deleteDocumentNonBlocking(docRef);

    toast({
        title: tDialog("toastDeleteTitle"),
        description: tDialog("toastDescription", { name: deleteTarget.name }),
    });
    setDeleteTarget(null);
  };

  const allSuppliers = suppliers ?? [];

  return (
    <>
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
          {canEdit && (
            <AddItemDialog suppliers={allSuppliers}>
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                {t('addNew')}
              </Button>
            </AddItemDialog>
          )}
        </div>
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
                <TableHead className="w-[100px] text-right">{t('actionsColumn')}</TableHead>
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
                    <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : (
                filteredItems?.map((item) => (
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
                    <TableCell className="text-right">
                      {canEdit && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <AddItemDialog suppliers={allSuppliers} item={item}>
                               <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                  <Edit className="mr-2 h-4 w-4" />
                                  <span>{t('editAction')}</span>
                              </DropdownMenuItem>
                            </AddItemDialog>
                            <DropdownMenuItem onClick={() => setDeleteTarget(item)} className="text-destructive focus:text-destructive">
                               <Trash className="mr-2 h-4 w-4" />
                               <span>{t('deleteAction')}</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
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
}

    