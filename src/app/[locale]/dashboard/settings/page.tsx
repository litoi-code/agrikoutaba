
'use client';

import { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import {useFirestore, useCollection, useMemoFirebase, updateDocumentNonBlocking, getDocs, setDoc, collection, doc} from '@/firebase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { 
  Download, 
  Upload, 
  ShieldCheck, 
  Loader2, 
  AlertTriangle, 
  Cloud, 
  Laptop, 
  Info, 
  User, 
  Users, 
  Database,
  CheckCircle2
} from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { useCurrentUserRole } from '@/hooks/use-current-user-role';
import type { Worker } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { 
    Table, 
    TableBody, 
    TableCell, 
    TableHead, 
    TableHeader, 
    TableRow 
} from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';

const COLLECTIONS = [
  'items',
  'customers',
  'suppliers',
  'tasks',
  'workers',
  'incomes',
  'expenses',
  'investments'
];

export default function SettingsPage() {
  const t = useTranslations('SettingsPage');
  const tWorkers = useTranslations('WorkersPage');
  const firestore = useFirestore();
  const { toast } = useToast();
  const { role, currentWorker, isLoading: isUserLoading } = useCurrentUserRole();
  
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importData, setImportData] = useState<any>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [exportTarget, setExportTarget] = useState<'local' | 'drive'>('local');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  // Fetch all workers for Team management
  const workersQuery = useMemoFirebase(() => (firestore) ? collection(firestore, 'workers') : null, [firestore]);
  const { data: workers, isLoading: workersLoading } = useCollection<Worker>(workersQuery);

  const isAdmin = role === 'Admin';

  const handleExport = async () => {
    if (!firestore) return;

    if (exportTarget === 'drive') {
      toast({
        title: t('driveSetupTitle'),
        description: t('driveSetupDescription'),
        variant: "default",
      });
      return;
    }

    setIsExporting(true);

    try {
      const backup: Record<string, any[]> = {};

      for (const collectionName of COLLECTIONS) {
        const { data: querySnapshot } = await getDocs(collection(firestore, collectionName));
        backup[collectionName] = querySnapshot.map(item => ({
          ...item,
          id: item.id
        }));
      }

      const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `agrikoutaba-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: t('toastExportTitle'),
        description: t('toastExportDescription'),
      });
    } catch (error) {
      console.error('Export failed:', error);
      toast({
        variant: "destructive",
        title: "Export Error",
        description: t('toastImportError'),
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target?.result as string);
        setImportData(json);
        setIsConfirmOpen(true);
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Invalid File",
          description: t('toastImportError'),
        });
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  const handleImport = async () => {
    if (!firestore || !importData) return;
    setIsImporting(true);
    setIsConfirmOpen(false);

    try {
      for (const collectionName of Object.keys(importData)) {
        if (!COLLECTIONS.includes(collectionName)) continue;
        
        const dataList = importData[collectionName];
        if (!Array.isArray(dataList)) continue;

        for (const entry of dataList) {
          const { id, ...data } = entry;
          if (id) {
            await setDoc(doc(firestore, collectionName, id), data);
          }
        }
      }

      toast({
        title: t('toastImportTitle'),
        description: t('toastImportDescription'),
      });
    } catch (error) {
      console.error('Import failed:', error);
      toast({
        variant: "destructive",
        title: "Import Error",
        description: t('toastImportError'),
      });
    } finally {
      setIsImporting(false);
      setImportData(null);
    }
  };

  const handleUpdateProfile = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!firestore || !currentWorker) return;

    setIsUpdatingProfile(true);
    const formData = new FormData(e.currentTarget);
    const data = {
      firstName: formData.get('firstName') as string,
      lastName: formData.get('lastName') as string,
      contactNumber: formData.get('contactNumber') as string,
    };

    const workerRef = doc(firestore, 'workers', currentWorker.id);
    updateDocumentNonBlocking(workerRef, data);
    
    setTimeout(() => {
        setIsUpdatingProfile(false);
        toast({
            title: t('toastProfileUpdate'),
            icon: <CheckCircle2 className="h-4 w-4 text-green-500" />
        });
    }, 500);
  };

  const handleUpdateRole = (workerId: string, newRole: string) => {
    if (!firestore) return;
    const workerRef = doc(firestore, 'workers', workerId);
    updateDocumentNonBlocking(workerRef, { role: newRole });
    
    const workerName = workers?.find(w => w.id === workerId)?.firstName || 'User';
    toast({
        title: t('toastRoleUpdate', { name: workerName }),
    });
  };

  return (
    <div className="flex flex-col gap-8 max-w-5xl mx-auto">
      <h1 className="text-3xl font-headline font-bold">{t('title')}</h1>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-8">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span>{t('tabProfile')}</span>
          </TabsTrigger>
          <TabsTrigger value="team" className="flex items-center gap-2" disabled={!isAdmin}>
            <Users className="h-4 w-4" />
            <span>{t('tabTeam')}</span>
          </TabsTrigger>
          <TabsTrigger value="backup" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            <span>{t('tabBackup')}</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>{t('profileTitle')}</CardTitle>
              <CardDescription>{t('profileDescription')}</CardDescription>
            </CardHeader>
            <CardContent>
              {isUserLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ) : (
                <form onSubmit={handleUpdateProfile} className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">{tWorkers('AddWorkerDialog.firstNameLabel')}</Label>
                      <Input id="firstName" name="firstName" defaultValue={currentWorker?.firstName} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">{tWorkers('AddWorkerDialog.lastNameLabel')}</Label>
                      <Input id="lastName" name="lastName" defaultValue={currentWorker?.lastName} required />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">{tWorkers('AddWorkerDialog.emailLabel')}</Label>
                    <Input id="email" type="email" defaultValue={currentWorker?.email} disabled className="bg-muted" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contactNumber">{tWorkers('AddWorkerDialog.phoneLabel')}</Label>
                    <Input id="contactNumber" name="contactNumber" defaultValue={currentWorker?.contactNumber} />
                  </div>
                  <Button type="submit" disabled={isUpdatingProfile}>
                    {isUpdatingProfile ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    {t('saveProfile')}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="team">
          <Card>
            <CardHeader>
              <CardTitle>{t('teamTitle')}</CardTitle>
              <CardDescription>{t('teamDescription')}</CardDescription>
            </CardHeader>
            <CardContent>
               <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>{tWorkers('nameColumn')}</TableHead>
                            <TableHead className="hidden md:table-cell">{tWorkers('AddWorkerDialog.emailLabel')}</TableHead>
                            <TableHead>{tWorkers('roleColumn')}</TableHead>
                            <TableHead className="text-right">{tWorkers('actionsColumn')}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {workersLoading ? (
                            Array.from({length: 3}).map((_, i) => (
                                <TableRow key={i}>
                                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                                    <TableCell className="text-right"><Skeleton className="h-8 w-24 ml-auto" /></TableCell>
                                </TableRow>
                            ))
                        ) : (
                            workers?.map((worker) => (
                                <TableRow key={worker.id}>
                                    <TableCell className="font-medium">
                                        {worker.firstName} {worker.lastName}
                                        {worker.id === currentWorker?.id && (
                                            <Badge variant="outline" className="ml-2 text-[10px] py-0">You</Badge>
                                        )}
                                    </TableCell>
                                    <TableCell className="hidden md:table-cell text-muted-foreground text-xs">{worker.email}</TableCell>
                                    <TableCell>
                                        <Badge variant={worker.role === 'Admin' ? 'default' : 'secondary'} className="text-[10px]">
                                            {worker.role}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Select 
                                            defaultValue={worker.role} 
                                            onValueChange={(v) => handleUpdateRole(worker.id, v)}
                                            disabled={worker.id === currentWorker?.id}
                                        >
                                            <SelectTrigger className="w-[120px] ml-auto h-8 text-xs">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Admin">{tWorkers('AddWorkerDialog.roleAdmin')}</SelectItem>
                                                <SelectItem value="Manager">{tWorkers('AddWorkerDialog.roleManager')}</SelectItem>
                                                <SelectItem value="Worker">{tWorkers('AddWorkerDialog.roleWorker')}</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
               </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="backup">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2 text-primary">
                <ShieldCheck className="h-6 w-6" />
                <CardTitle>{t('backupTitle')}</CardTitle>
              </div>
              <CardDescription>
                {t('backupDescription')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>{t('exportTargetLabel')}</Label>
                    <Select value={exportTarget} onValueChange={(v: any) => setExportTarget(v)}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder={t('selectExportTarget')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="local">
                          <div className="flex items-center gap-2">
                            <Laptop className="h-4 w-4" />
                            <span>{t('targetLocal')}</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="drive">
                          <div className="flex items-center gap-2">
                            <Cloud className="h-4 w-4" />
                            <span>{t('targetDrive')}</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button 
                    onClick={handleExport} 
                    disabled={isExporting}
                    className="w-full"
                  >
                    {isExporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
                    {t('exportButton')}
                  </Button>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>{t('restoreTitle')}</Label>
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="import-file" className="sr-only">
                        {t('importButton')}
                      </Label>
                      <Input
                        id="import-file"
                        type="file"
                        accept=".json"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                      <Button 
                        asChild
                        disabled={isImporting}
                        variant="secondary"
                        className="w-full"
                      >
                        <label htmlFor="import-file" className="cursor-pointer">
                          {isImporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                          {t('importButton')}
                        </label>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {exportTarget === 'drive' && (
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg flex items-start gap-3 border border-blue-200 dark:border-blue-800">
                  <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                  <div className="text-xs text-blue-800 dark:text-blue-300 leading-relaxed">
                    <strong>{t('driveSetupTitle')}:</strong> {t('driveSetupInstructions')}
                  </div>
                </div>
              )}

              <div className="bg-muted/50 p-4 rounded-lg flex items-start gap-3 border border-yellow-200/50">
                <AlertTriangle className="h-5 w-5 text-yellow-600 shrink-0 mt-0.5" />
                <div className="text-xs text-muted-foreground leading-relaxed">
                  <strong>{t('importantNote')}:</strong> {t('backupWarning')}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('confirmImportTitle')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('confirmImportDescription')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('cancelButton')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleImport} className="bg-accent text-accent-foreground hover:bg-accent/90">
              {t('importButton')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
