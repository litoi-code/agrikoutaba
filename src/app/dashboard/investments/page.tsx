"use client";
import { useMemo } from 'react';
import { collection } from 'firebase/firestore';
import { useFirestore, useCollection, useMemoFirebase, type WithId, useUser } from '@/firebase';
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
import { investments as mockInvestments } from "@/lib/data";
import type { Investment } from "@/lib/types";
import { Skeleton } from '@/components/ui/skeleton';

export default function InvestmentsPage() {
  const firestore = useFirestore();
  const { user } = useUser();

  const investmentsQuery = useMemoFirebase(() => (firestore && user) ? collection(firestore, 'investments') : null, [firestore, user]);
  const { data: investments, isLoading: investmentsLoading } = useCollection<Investment>(investmentsQuery);

  const totalInvested = useMemo(() => investments?.reduce((sum, inv) => sum + inv.amount, 0) ?? 0, [investments]);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-headline font-bold">Investments & Equity</h1>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Investment
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Invested</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {investmentsLoading ? <Skeleton className="h-8 w-32" /> : <div className="text-2xl font-bold">${totalInvested.toLocaleString()}</div>}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Investment Records</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Investment</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Equity Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {investmentsLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                  </TableRow>
                ))
              ) : (
                investments?.map((inv) => (
                  <TableRow key={inv.id}>
                    <TableCell className="font-medium">{inv.description}</TableCell>
                    <TableCell>{new Date(inv.date).toLocaleDateString()}</TableCell>
                    <TableCell>${inv.amount.toLocaleString()}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span>{inv.equityDetails}</span>
                      </div>
                    </TableCell>
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
