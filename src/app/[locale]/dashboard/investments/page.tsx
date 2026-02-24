
"use client";
import { useMemo, useState, useEffect } from 'react';
import { collection, doc } from 'firebase/firestore';
import { useFirestore, useCollection, useMemoFirebase, type WithId, deleteDocumentNonBlocking } from '@/firebase';
import { useTranslations } from 'next-intl';
import { format, startOfDay, endOfDay } from 'date-fns';
import { DateRange } from 'react-day-picker';
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
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, Wallet, FileText, MoreHorizontal, Edit, Trash, Search, Sparkles } from "lucide-react";
import type { Investment } from "@/lib/types";
import { Skeleton } from '@/components/ui/skeleton';
import { InvestmentFormDialog } from './add-investment-dialog';
import { useToast } from '@/hooks/use-toast';
import { useCurrentUserRole } from '@/hooks/use-current-user-role';
import { DatePickerWithRange } from '@/components/date-range-picker';
import { cn, isNew } from '@/lib/utils';

const InvestmentRow = ({ inv, tGlobal, t, tDialog, canEdit }: { inv: WithId<Investment>, tGlobal: any, t: any, tDialog: any, canEdit: boolean }) => {
  const [formattedDate, setFormattedDate] = useState('');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { toast } = useToast();
  const firestore = useFirestore();
  const isRecentlyAdded = isNew(inv.createdAt);

  useEffect(() => {
    setFormattedDate(format(new Date(inv.date), 'PPP'));
  }, [inv.date]);

  const handleDelete = () => {
    if (!firestore) return;
    const docRef = doc(firestore, 'investments', inv.id);
    deleteDocumentNonBlocking(docRef);

    toast({
        title: tDialog("toastDeleteTitle"),
        description: tDialog("toastDescription", { investorName: inv.investorName }),
    });
    setIsDeleteDialogOpen(false);
  };

  return (
    <>
      <TableRow className={cn(isRecentlyAdded && "bg-accent/10")}>
        <TableCell className="font-medium">
           <div className="flex items-center gap-2">
             {isRecentlyAdded && <Sparkles className="h-3 w-3 text-accent shrink-0" />}
             {inv.investorName}
             {isRecentlyAdded && <Badge variant="accent" className="text-[8px] px-1 py-0 uppercase">New</Badge>}
           </div>
        </TableCell>
        <TableCell className="hidden sm:table-cell">{inv.description}</TableCell>
        <TableCell className="hidden md:table-cell">{formattedDate ? formattedDate : <Skeleton className="h-4 w-24" />}</TableCell>
        <TableCell>{inv.amount.toLocaleString()} {tGlobal('currency')}</TableCell>
        <TableCell>
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <span className="truncate max-w-[100px] md:max-w-none">{inv.equityDetails}</span>
          </div>
        </TableCell>
        <TableCell className="text-right">
          {canEdit && (
            <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <InvestmentFormDialog investment={inv}>
                    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                        <Edit className="mr-2 h-4 w-4" />
                        <span>{t('editAction')}</span>
                    </DropdownMenuItem>
                </InvestmentFormDialog>
                <DropdownMenuItem onClick={() => setIsDeleteDialogOpen(true)} className="text-destructive focus:text-destructive">
                    <Trash className="mr-2 h-4 w-4" />
                    <span>{t('deleteAction')}</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
            </DropdownMenu>
          )}
        </TableCell>
      </TableRow>
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
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


export default function InvestmentsPage() {
  const firestore = useFirestore();
  const t = useTranslations('InvestmentsPage');
  const tDialog = useTranslations('InvestmentsPage.AddInvestmentDialog');
  const tGlobal = useTranslations('Global');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const { role, isLoading: isRoleLoading } = useCurrentUserRole();

  const canEdit = role === 'Admin' || role === 'Manager';

  const investmentsQuery = useMemoFirebase(() => (firestore) ? collection(firestore, 'investments') : null, [firestore]);
  const { data: investments, isLoading: investmentsLoading } = useCollection<Investment>(investmentsQuery);

  const filteredInvestments = useMemo(() => {
    if (!investments) return [];
    return investments.filter(inv => {
        const matchesSearch = inv.investorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            inv.description.toLowerCase().includes(searchTerm.toLowerCase());
        
        if (!dateRange?.from) return matchesSearch;

        const itemDate = new Date(inv.date);
        const from = startOfDay(dateRange.from);
        const to = dateRange.to ? endOfDay(dateRange.to) : endOfDay(dateRange.from);

        return matchesSearch && itemDate >= from && itemDate <= to;
    });
  }, [investments, searchTerm, dateRange]);

  const totalInvested = useMemo(() => filteredInvestments?.reduce((sum, inv) => sum + inv.amount, 0) ?? 0, [filteredInvestments]);

  const isLoading = investmentsLoading || isRoleLoading;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-3xl font-headline font-bold">{t('title')}</h1>
        <div className="flex flex-col sm:flex-row items-center gap-2">
          <div className="relative w-full sm:w-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t('searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full sm:w-48"
            />
          </div>
          <DatePickerWithRange date={dateRange} setDate={setDateRange} className="w-full sm:w-auto" />
          {!isLoading && canEdit && (
            <InvestmentFormDialog>
              <Button className="w-full sm:w-auto">
                <PlusCircle className="mr-2 h-4 w-4" />
                {t('addNew')}
              </Button>
            </InvestmentFormDialog>
          )}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('totalInvested')}</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="h-8 w-32" /> : <div className="text-2xl font-bold">{totalInvested.toLocaleString()} {tGlobal('currency')}</div>}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('investmentRecords')}</CardTitle>
        </CardHeader>
        <CardContent className="p-0 sm:p-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('investorColumn')}</TableHead>
                <TableHead className="hidden sm:table-cell">{t('descriptionColumn')}</TableHead>
                <TableHead className="hidden md:table-cell">{t('dateColumn')}</TableHead>
                <TableHead>{t('amountColumn')}</TableHead>
                <TableHead>{t('equityDetailsColumn')}</TableHead>
                <TableHead className="w-[80px] text-right">{t('actionsColumn')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell className="hidden sm:table-cell"><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : (
                filteredInvestments?.map((inv) => (
                  <InvestmentRow key={inv.id} inv={inv} tGlobal={tGlobal} t={t} tDialog={tDialog} canEdit={canEdit} />
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
