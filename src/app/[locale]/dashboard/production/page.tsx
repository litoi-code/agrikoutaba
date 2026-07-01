
"use client";

import { useMemo } from 'react';
import { collection } from 'firebase/firestore';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, LandPlot, Sprout, TrendingUp, TrendingDown, DollarSign } from "lucide-react";
import type { Plot, CropCycle, Harvest, Expense, Income } from "@/lib/types";
import { Skeleton } from '@/components/ui/skeleton';
import { AddPlotDialog } from './add-plot-dialog';
import { AddCycleDialog } from './add-cycle-dialog';
import { AddHarvestDialog } from './add-harvest-dialog';

export default function ProductionPage() {
  const firestore = useFirestore();
  const t = useTranslations('ProductionPage');
  const tGlobal = useTranslations('Global');

  const plotsQuery = useMemoFirebase(() => firestore ? collection(firestore, 'plots') : null, [firestore]);
  const { data: plots, isLoading: plotsLoading } = useCollection<Plot>(plotsQuery);

  const cyclesQuery = useMemoFirebase(() => firestore ? collection(firestore, 'cropCycles') : null, [firestore]);
  const { data: cycles, isLoading: cyclesLoading } = useCollection<CropCycle>(cyclesQuery);

  const harvestsQuery = useMemoFirebase(() => firestore ? collection(firestore, 'harvests') : null, [firestore]);
  const { data: harvests, isLoading: harvestsLoading } = useCollection<Harvest>(harvestsQuery);

  const expensesQuery = useMemoFirebase(() => firestore ? collection(firestore, 'expenses') : null, [firestore]);
  const { data: expenses } = useCollection<Expense>(expensesQuery);

  const incomesQuery = useMemoFirebase(() => firestore ? collection(firestore, 'incomes') : null, [firestore]);
  const { data: incomes } = useCollection<Income>(incomesQuery);

  const cycleFinancials = useMemo(() => {
    if (!cycles || !expenses || !incomes) return {};
    const stats: Record<string, { costs: number, sales: number }> = {};
    
    cycles.forEach(c => stats[c.id] = { costs: 0, sales: 0 });
    
    expenses.forEach(e => {
      if (e.cropCycleId && stats[e.cropCycleId]) {
        stats[e.cropCycleId].costs += e.amount;
      }
    });
    
    incomes.forEach(i => {
      if (i.cropCycleId && stats[i.cropCycleId]) {
        stats[i.cropCycleId].sales += i.amount;
      }
    });
    
    return stats;
  }, [cycles, expenses, incomes]);

  const plotsMap = useMemo(() => {
    if (!plots) return new Map<string, Plot>();
    return new Map(plots.map(p => [plot.id, p]));
  }, [plots]);

  const isLoading = plotsLoading || cyclesLoading || harvestsLoading;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-headline font-bold">{t('title')}</h1>
        <div className="flex gap-2">
          <AddPlotDialog><Button variant="outline" size="sm"><LandPlot className="mr-2 h-4 w-4" />{t('addNewPlot')}</Button></AddPlotDialog>
          <AddCycleDialog plots={plots || []}><Button size="sm"><Sprout className="mr-2 h-4 w-4" />{t('addNewCycle')}</Button></AddCycleDialog>
          <AddHarvestDialog cycles={cycles || []}><Button variant="secondary" size="sm"><PlusCircle className="mr-2 h-4 w-4" />{t('addNewHarvest')}</Button></AddHarvestDialog>
        </div>
      </div>

      <Tabs defaultValue="cycles">
        <TabsList>
          <TabsTrigger value="cycles">{t('cyclesTab')}</TabsTrigger>
          <TabsTrigger value="plots">{t('plotsTab')}</TabsTrigger>
          <TabsTrigger value="harvests">{t('harvestsTab')}</TabsTrigger>
        </TabsList>

        <TabsContent value="cycles">
          <Card>
            <CardHeader><CardTitle className="text-lg">{t('cyclesTab')}</CardTitle></CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('cropType')}</TableHead>
                    <TableHead>{t('plotName')}</TableHead>
                    <TableHead>{t('startDate')}</TableHead>
                    <TableHead>{t('status')}</TableHead>
                    <TableHead className="text-right">{t('cost')}</TableHead>
                    <TableHead className="text-right">{t('revenue')}</TableHead>
                    <TableHead className="text-right">{t('profit')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? Array.from({length: 3}).map((_, i) => (
                    <TableRow key={i}><TableCell colSpan={7}><Skeleton className="h-10 w-full" /></TableCell></TableRow>
                  )) : cycles?.map(cycle => {
                    const financials = cycleFinancials[cycle.id] || { costs: 0, sales: 0 };
                    const profit = financials.sales - financials.costs;
                    return (
                      <TableRow key={cycle.id}>
                        <TableCell className="font-bold">{cycle.cropType}</TableCell>
                        <TableCell>{plots?.find(p => p.id === cycle.plotId)?.name || 'Unknown'}</TableCell>
                        <TableCell>{format(new Date(cycle.startDate), 'PP')}</TableCell>
                        <TableCell>
                          <Badge variant={cycle.status === 'Harvested' ? 'secondary' : 'default'}>{cycle.status}</Badge>
                        </TableCell>
                        <TableCell className="text-right font-mono text-xs">{financials.costs.toLocaleString()} {tGlobal('currency')}</TableCell>
                        <TableCell className="text-right font-mono text-xs">{financials.sales.toLocaleString()} {tGlobal('currency')}</TableCell>
                        <TableCell className={cn("text-right font-bold text-xs", profit >= 0 ? "text-green-600" : "text-red-600")}>
                          {profit.toLocaleString()} {tGlobal('currency')}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="plots">
          <Card>
            <CardHeader><CardTitle className="text-lg">{t('plotsTab')}</CardTitle></CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('plotName')}</TableHead>
                    <TableHead>{t('area')}</TableHead>
                    <TableHead>{t('AddPlot.locationLabel')}</TableHead>
                    <TableHead>{t('AddPlot.soilLabel')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? Array.from({length: 2}).map((_, i) => (
                    <TableRow key={i}><TableCell colSpan={4}><Skeleton className="h-10 w-full" /></TableCell></TableRow>
                  )) : plots?.map(plot => (
                    <TableRow key={plot.id}>
                      <TableCell className="font-bold">{plot.name}</TableCell>
                      <TableCell>{plot.area} Ha</TableCell>
                      <TableCell>{plot.location}</TableCell>
                      <TableCell>{plot.soilType}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="harvests">
          <Card>
            <CardHeader><CardTitle className="text-lg">{t('harvestsTab')}</CardTitle></CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('AddHarvest.dateLabel')}</TableHead>
                    <TableHead>{t('cropType')}</TableHead>
                    <TableHead className="text-right">{t('quantity')}</TableHead>
                    <TableHead className="text-right">{t('revenue')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? Array.from({length: 3}).map((_, i) => (
                    <TableRow key={i}><TableCell colSpan={4}><Skeleton className="h-10 w-full" /></TableCell></TableRow>
                  )) : harvests?.map(h => (
                    <TableRow key={h.id}>
                      <TableCell>{format(new Date(h.date), 'PP')}</TableCell>
                      <TableCell className="font-bold">{cycles?.find(c => c.id === h.cycleId)?.cropType || 'Unknown'}</TableCell>
                      <TableCell className="text-right">{h.quantity} {h.unit}</TableCell>
                      <TableCell className="text-right font-mono text-xs">{h.salesValue.toLocaleString()} {tGlobal('currency')}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
