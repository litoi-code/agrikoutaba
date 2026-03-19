'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useFirestore } from '@/firebase';
import { collection, getDocs, doc, setDoc } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Download, Upload, ShieldCheck, Loader2, AlertTriangle, Cloud, Laptop, Info } from 'lucide-react';
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
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importData, setImportData] = useState<any>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [exportTarget, setExportTarget] = useState<'local' | 'drive'>('local');

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
        const querySnapshot = await getDocs(collection(firestore, collectionName));
        backup[collectionName] = querySnapshot.docs.map(doc => ({
          ...doc.data(),
          id: doc.id
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
            await setDoc(doc(firestore, collectionName, id), data, { merge: true });
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

  return (
    <div className="flex flex-col gap-8 max-w-4xl">
      <h1 className="text-3xl font-headline font-bold">{t('title')}</h1>

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
