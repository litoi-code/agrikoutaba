
"use client";
import { useMemo, useState } from 'react';
import { collection, doc } from 'firebase/firestore';
import { useFirestore, useCollection, useMemoFirebase, type WithId, deleteDocumentNonBlocking } from '@/firebase';
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
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { PlusCircle, MoreHorizontal, Edit, Trash, Search, Sparkles } from "lucide-react";
import { Skeleton } from '@/components/ui/skeleton';
import { AddItemDialog } from './add-item-dialog';
import type { Item, Supplier } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { useCurrentUserRole } from '@/hooks/use-current-user-role';
import { cn, isNew } from '@/lib/utils';

export default function InventoryPage() {
  const firestore = useFirestore();
  const t = useTranslations('InventoryPage');
  const tDialog = useTranslations('InventoryPage.AddInventoryItemDialog');
  const tGlobal = useTranslations('Global');
  const { toast } = useToast();
  const { role, isLoading: isRoleLoading } = useCurrentUserRole();

  const [deleteTarget, setDeleteTarget] = useState<WithId<Item> | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const canEdit = role === 'Admin' || role === 'Manager';

  const itemsQuery = useMemoFirebase(() => (firestore) ? collection(firestore, 'items') : null, [firestore]);
  const { data: items, isLoading: itemsLoading } = useCollection<Item>(itemsQuery);

  const suppliersQuery = useMemoFirebase(() => (firestore) ? collection(firestore, 'suppliers') : null, [firestore]);
  const { data: suppliers, isLoading: suppliersLoading } = useCollection<Supplier>(suppliersQuery);

  const filteredItems = useMemo(() => {
    if (!items) return [];
    return items.filter(item =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [items, searchTerm]);

  const isLoading = itemsLoading || suppliersLoading || isRoleLoading;

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

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'Input': return t('categoryInput');
      case 'Produce': return t('categoryProduce');
      case 'Equipment': return t('categoryEquipment');
      default: return category;
    }
  };

  const allSuppliers = suppliers ?? [];

  return (
    <>
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-headline font-bold">{t('title')}</h1>
        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t('searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full"
            />
          </div>
          {!isLoading && canEdit && (
            <AddItemDialog suppliers={allSuppliers}>
              <Button size="sm">
                <PlusCircle className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">{t('addNew')}</span>
                <span className="sm:hidden">{t('addNew').split(' ')[0]}</span>
              </Button>
            </AddItemDialog>
          )}
        </div>
      </div>
      
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('nameColumn')}</TableHead>
                <TableHead className="hidden lg:table-cell">{t('categoryColumn')}</TableHead>
                <TableHead className="hidden md:table-cell">{t('descriptionLabel')}</TableHead>
                <TableHead className="text-right">{t('stockColumn')}</TableHead>
                <TableHead className="text-right">{t('statusColumn')}</TableHead>
                <TableHead className="hidden sm:table-cell text-right">{t('priceColumn')}</TableHead>
                <TableHead className="w-[80px] text-right">{t('actionsColumn')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell className="hidden lg:table-cell"><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-48" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-4 w-12 ml-auto" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-6 w-20 ml-auto" /></TableCell>
                    <TableCell className="hidden sm:table-cell text-right"><Skeleton className="h-4 w-20 ml-auto" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : (
                filteredItems?.map((item) => {
                  const isRecentlyAdded = isNew(item.createdAt);
                  return (
                    <TableRow key={item.id} className={cn(isRecentlyAdded && "bg-primary/10")}>
                      <TableCell className="font-medium max-w-[120px] truncate">
                        <div className="flex items-center gap-2">
                          {isRecentlyAdded && <Sparkles className="h-3 w-3 text-primary shrink-0" />}
                          {item.name}
                        </div>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <Badge variant="outline" className="font-normal">
                          {getCategoryLabel(item.category)}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell max-w-[200px] truncate text-muted-foreground text-xs">
                        {item.description}
                      </TableCell>
                      <TableCell className="text-right font-mono">{item.stockLevel}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex flex-col items-end gap-1">
                          {item.stockLevel <= item.reorderLevel ? (
                            <Badge variant="destructive" className="text-[10px] px-1">{t('statusLowStock')}</Badge>
                          ) : (
                            <Badge variant="secondary" className="text-[10px] px-1">{t('statusInStock')}</Badge>
                          )}
                          {isRecentlyAdded && (
                            <Badge variant="default" className="text-[8px] px-1 py-0 uppercase">{tGlobal('new')}</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell text-right font-mono text-xs">{item.unitPrice.toLocaleString()} {tGlobal('currency')}</TableCell>
                      <TableCell className="text-right">
                        {!isLoading && canEdit && (
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
                  );
                })
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
