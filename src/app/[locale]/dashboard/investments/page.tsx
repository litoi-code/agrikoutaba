
"use client";
import { useMemo, useState, useEffect } from 'react';
import { collection } from 'firebase/firestore';
import { useFirestore, useCollection, useMemoFirebase, type WithId, useUser } from '@/firebase';
import { useTranslations } from 'next-intl';
import { format } from 'date-fns';
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
import { PlusCircle, Wallet, FileText } from "lucide-react";
import type { Investment } from "@/lib/types";
import { Skeleton } from '@/components/ui/skeleton';
import { AddInvestmentDialog } from './add-investment-dialog';

const InvestmentRow = ({ inv, tGlobal }: { inv: WithId<Investment>, tGlobal: any }) => {
  const [formattedDate, setFormattedDate] = useState('');
  useEffect(() => {
    setFormattedDate(format(new Date(inv.date), 'PPP'));
  }, [inv.date]);

  return (
    <TableRow>
      <TableCell className="font-medium">{inv.investorName}</TableCell>
      <TableCell>{inv.description}</TableCell>
      <TableCell>{formattedDate ? formattedDate : <Skeleton className="h-4 w-24" />}</TableCell>
      <TableCell>{inv.amount.toLocaleString()} {tGlobal('currency')}</TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-muted-foreground" />
          <span>{inv.equityDetails}</span>
        </div>
      </TableCell>
    </TableRow>
  );
};


export default function InvestmentsPage() {
  const firestore = useFirestore();
  const { user } = useUser();
  const t = useTranslations('InvestmentsPage');
  const tGlobal = useTranslations('Global');

  const investmentsQuery = useMemoFirebase(() => (firestore && user) ? collection(firestore, 'investments') : null, [firestore, user]);
  const { data: investments, isLoading: investmentsLoading } = useCollection<Investment>(investmentsQuery);

  const totalInvested = useMemo(() => investments?.reduce((sum, inv) => sum + inv.amount, 0) ?? 0, [investments]);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-headline font-bold">{t('title')}</h1>
        <AddInvestmentDialog>
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            {t('addNew')}
          </Button>
        </AddInvestmentDialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('totalInvested')}</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {investmentsLoading ? <Skeleton className="h-8 w-32" /> : <div className="text-2xl font-bold">{totalInvested.toLocaleString()} {tGlobal('currency')}</div>}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('investmentRecords')}</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('investorColumn')}</TableHead>
                <TableHead>{t('descriptionColumn')}</TableHead>
                <TableHead>{t('dateColumn')}</TableHead>
                <TableHead>{t('amountColumn')}</TableHead>
                <TableHead>{t('equityDetailsColumn')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {investmentsLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                  </TableRow>
                ))
              ) : (
                investments?.map((inv) => (
                  <InvestmentRow key={inv.id} inv={inv} tGlobal={tGlobal} />
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
