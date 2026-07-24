"use client";

import { useMemo, useState } from 'react';
import { collection, deleteDoc, doc } from 'firebase/firestore';
import { useFirestore, useCollection, useMemoFirebase, type WithId } from '@/firebase';
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
import { 
  PlusCircle, 
  LandPlot, 
  Sprout, 
  Users, 
  MoreHorizontal,
  Pencil,
  Trash2
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { Plot, CropCycle, Harvest, Expense, Income, Worker, CycleWorker, Task } from "@/lib/types";
import { Skeleton } from '@/components/ui/skeleton';
import { AddPlotDialog } from './add-plot-dialog';
import { AddCycleDialog } from './add-cycle-dialog';
import { HarvestFormDialog } from './add-harvest-dialog';
import { EditCycleDialog } from './edit-cycle-dialog';
import { EditPlotDialog } from './edit-plot-dialog';
import { EditHarvestDialog } from './edit-harvest-dialog';
import { AssignWorkerDialog } from './assign-worker-dialog';
import { cn } from '@/lib/utils';
import { useCurrentUserRole } from '@/hooks/use-current-user-role';

export default function ProductionPage() {
  const firestore = useFirestore();
  const t = useTranslations('ProductionPage');
  const tGlobal = useTranslations('Global');
  const { role } = useCurrentUserRole();
  const canEdit = role === 'Admin' || role === 'Manager';

  const [assignCycle, setAssignCycle] = useState<WithId<CropCycle> | null>(null);
  const [editCycle, setEditCycle] = useState<WithId<CropCycle> | null>(null);
  const [editPlot, setEditPlot] = useState<WithId<Plot> | null>(null);
  const [editHarvest, setEditHarvest] = useState<WithId<Harvest> | null>(null);

  const handleDeleteCycle = async (cycleId: string) => {
    if (!firestore) return;
    await deleteDoc(doc(firestore, "cropCycles", cycleId));
  };

  const handleDeletePlot = async (plotId: string) => {
    if (!firestore) return;
    await deleteDoc(doc(firestore, "plots", plotId));
  };

  const handleDeleteHarvest = async (harvestId: string) => {
    if (!firestore) return;
    await deleteDoc(doc(firestore, "harvests", harvestId));
  };

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

  const workersQuery = useMemoFirebase(() => firestore ? collection(firestore, 'workers') : null, [firestore]);
  const { data: workers } = useCollection<Worker>(workersQuery);

  const cycleWorkersQuery = useMemoFirebase(() => firestore ? collection(firestore, 'cycleWorkers') : null, [firestore]);
  const { data: cycleWorkers } = useCollection<CycleWorker>(cycleWorkersQuery);

  const tasksQuery = useMemoFirebase(() => firestore ? collection(firestore, 'tasks') : null, [firestore]);
  const { data: tasks } = useCollection<Task>(tasksQuery);

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

  const cycleAssignedWorkers = useMemo(() => {
    if (!cycleWorkers || !workers) return {};
    const mapping: Record<string, string[]> = {};
    
    cycleWorkers.forEach(cw => {
      if (!mapping[cw.cycleId]) mapping[cw.cycleId] = [];
      const w = workers.find(worker => worker.id === cw.workerId);
      if (w) mapping[cw.cycleId].push(`${w.firstName} ${w.lastName}`);
    });
    
    return mapping;
  }, [cycleWorkers, workers]);

  const cycleTasks = useMemo(() => {
    if (!tasks) return {};
    const mapping: Record<string, WithId<Task>[]> = {};
    tasks.forEach(task => {
      if (task.cropCycleId) {
        if (!mapping[task.cropCycleId]) mapping[task.cropCycleId] = [];
        mapping[task.cropCycleId].push(task);
      }
    });
    return mapping;
  }, [tasks]);

  const isLoading = plotsLoading || cyclesLoading || harvestsLoading;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-headline font-bold">{t('title')}</h1>
        <div className="flex gap-2">
          {canEdit && (
            <>
              <AddPlotDialog><Button variant="outline" size="sm"><LandPlot className="mr-2 h-4 w-4" />{t('addNewPlot')}</Button></AddPlotDialog>
              <AddCycleDialog plots={plots || []}><Button size="sm"><Sprout className="mr-2 h-4 w-4" />{t('addNewCycle')}</Button></AddCycleDialog>
              <HarvestFormDialog cycles={cycles || []}><Button variant="secondary" size="sm"><PlusCircle className="mr-2 h-4 w-4" />{t('addNewHarvest')}</Button></HarvestFormDialog>
            </>
          )}
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
                    <TableHead className="hidden md:table-cell">{t('startDate')}</TableHead>
                    <TableHead>{t('status')}</TableHead>
                    <TableHead className="hidden lg:table-cell">{t('labor')}</TableHead>
                    <TableHead className="text-center">{t('tasks')}</TableHead>
                    <TableHead className="text-right">{t('cost')}</TableHead>
                    <TableHead className="text-right">{t('revenue')}</TableHead>
                    <TableHead className="text-right">{t('profit')}</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? Array.from({length: 3}).map((_, i) => (
                    <TableRow key={i}><TableCell colSpan={10}><Skeleton className="h-10 w-full" /></TableCell></TableRow>
                  )) : cycles?.map(cycle => {
                    const financials = cycleFinancials[cycle.id] || { costs: 0, sales: 0 };
                    const profit = financials.sales - financials.costs;
                    const assignedNames = cycleAssignedWorkers[cycle.id] || [];
                    
                    return (
                      <TableRow key={cycle.id}>
                        <TableCell className="font-bold">{cycle.cropType}</TableCell>
                        <TableCell>{plots?.find(p => p.id === cycle.plotId)?.name || tGlobal('unknown')}</TableCell>
                        <TableCell className="hidden md:table-cell">{format(new Date(cycle.startDate), 'PP')}</TableCell>
                        <TableCell>
                          <Badge variant={cycle.status === 'Harvested' ? 'secondary' : 'default'}>{cycle.status}</Badge>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                           {assignedNames.length > 0 ? (
                             <div className="flex flex-col text-[10px] text-muted-foreground">
                               {assignedNames.map(name => <span key={name}>{name}</span>)}
                             </div>
) : (
                              <span className="text-[10px] italic text-muted-foreground">{tGlobal('none')}</span>
                           )}
                        </TableCell>
                        <TableCell className="text-center">
                          {(() => {
                            const linkedTasks = cycleTasks[cycle.id] || [];
                            if (linkedTasks.length === 0) {
                              return <span className="text-[10px] italic text-muted-foreground">{tGlobal('none')}</span>;
                            }
                            return (
                              <Popover>
                                <PopoverTrigger asChild>
                                  <Button variant="ghost" size="sm" className="h-6 px-2 text-xs font-mono">
                                    {linkedTasks.length}
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-64 p-2" align="center">
                                  <div className="text-xs space-y-1">
                                    {linkedTasks.map(task => (
                                      <div key={task.id} className="flex items-center justify-between gap-2">
                                        <span className="truncate">{task.title}</span>
                                        <Badge variant={task.status === 'Completed' ? 'secondary' : 'default'} className="text-[9px] px-1 h-4 shrink-0">
                                          {task.status === 'To Do' ? 'TODO' : task.status === 'In Progress' ? 'WIP' : 'DONE'}
                                        </Badge>
                                      </div>
                                    ))}
                                  </div>
                                </PopoverContent>
                              </Popover>
                            );
                          })()}
                        </TableCell>
                        <TableCell className="text-right font-mono text-xs">{financials.costs.toLocaleString()} {tGlobal('currency')}</TableCell>
                        <TableCell className="text-right font-mono text-xs">{financials.sales.toLocaleString()} {tGlobal('currency')}</TableCell>
                        <TableCell className={cn("text-right font-bold text-xs", profit >= 0 ? "text-green-600" : "text-red-600")}>
                          {profit.toLocaleString()} {tGlobal('currency')}
                        </TableCell>
                        <TableCell>
                          {canEdit && cycle.status !== 'Harvested' && (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onSelect={() => setAssignCycle(cycle)}>
                                  <Users className="mr-2 h-4 w-4" />
                                  <span>{t('assignWorkerAction')}</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem onSelect={() => setEditCycle(cycle)}>
                                  <Pencil className="mr-2 h-4 w-4" />
                                  <span>{t('editAction')}</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem onSelect={() => handleDeleteCycle(cycle.id)} className="text-destructive">
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  <span>{t('deleteAction')}</span>
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
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
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? Array.from({length: 2}).map((_, i) => (
                    <TableRow key={i}><TableCell colSpan={5}><Skeleton className="h-10 w-full" /></TableCell></TableRow>
                  )) : plots?.map(plot => (
                    <TableRow key={plot.id}>
                      <TableCell className="font-bold">{plot.name}</TableCell>
                      <TableCell>{plot.area} Ha</TableCell>
                      <TableCell>{plot.location}</TableCell>
                      <TableCell>{plot.soilType}</TableCell>
                      <TableCell>
                        {canEdit && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onSelect={() => setEditPlot(plot)}>
                                <Pencil className="mr-2 h-4 w-4" />
                                <span>{t('editAction')}</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem onSelect={() => handleDeletePlot(plot.id)} className="text-destructive">
                                <Trash2 className="mr-2 h-4 w-4" />
                                <span>{t('deleteAction')}</span>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </TableCell>
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
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? Array.from({length: 3}).map((_, i) => (
                    <TableRow key={i}><TableCell colSpan={5}><Skeleton className="h-10 w-full" /></TableCell></TableRow>
                  )) : harvests?.map(h => (
                    <TableRow key={h.id}>
                      <TableCell>{format(new Date(h.date), 'PP')}</TableCell>
                      <TableCell className="font-bold">{cycles?.find(c => c.id === h.cycleId)?.cropType || tGlobal('unknown')}</TableCell>
                      <TableCell className="text-right">{h.quantity} {h.unit}</TableCell>
                      <TableCell className="text-right font-mono text-xs">{h.salesValue.toLocaleString()} {tGlobal('currency')}</TableCell>
                      <TableCell>
                        {canEdit && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onSelect={() => setEditHarvest(h)}>
                                <Pencil className="mr-2 h-4 w-4" />
                                <span>{t('editAction')}</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem onSelect={() => handleDeleteHarvest(h.id)} className="text-destructive">
                                <Trash2 className="mr-2 h-4 w-4" />
                                <span>{t('deleteAction')}</span>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <AssignWorkerDialog 
        cycle={assignCycle} 
        workers={workers || []} 
        open={!!assignCycle}
        onOpenChange={(open) => !open && setAssignCycle(null)}
      />
      <EditCycleDialog 
        cycle={editCycle} 
        plots={plots || []} 
        open={!!editCycle}
        onOpenChange={(open) => !open && setEditCycle(null)}
      />
      <EditPlotDialog 
        plot={editPlot} 
        open={!!editPlot}
        onOpenChange={(open) => !open && setEditPlot(null)}
      />
      <EditHarvestDialog 
        harvest={editHarvest} 
        open={!!editHarvest}
        onOpenChange={(open) => !open && setEditHarvest(null)}
      />
    </div>
  );
}
