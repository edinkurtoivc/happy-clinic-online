
import { useState, useEffect } from "react";
import Header from "@/components/layout/Header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ClinicInfo from "@/components/settings/ClinicInfo";
import ExaminationTypes from "@/components/settings/ExaminationTypes";
import UsersManagement from "@/components/users/UsersManagement";
import DataFolderSelect from "@/components/settings/DataFolderSelect";
import BackupRestore from "@/components/settings/BackupRestore";
import AppearanceSettings from "@/components/settings/AppearanceSettings";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Check, AlertCircle } from "lucide-react";
import dataStorageService from "@/services/DataStorageService";

export default function Settings() {
  const [dataFolderStatus, setDataFolderStatus] = useState<'initializing' | 'ready' | 'error'>('initializing');
  const basePath = dataStorageService.basePath;
  const isElectron = typeof window !== 'undefined' && window.electron?.isElectron;
  
  useEffect(() => {
    checkDataFolder();
  }, []);
  
  const checkDataFolder = async () => {
    try {
      if (!basePath || !isElectron) {
        setDataFolderStatus('error');
        return;
      }
      
      const initialized = await dataStorageService.initialize();
      setDataFolderStatus(initialized ? 'ready' : 'error');
    } catch (error) {
      console.error("[Settings] Error checking data folder:", error);
      setDataFolderStatus('error');
    }
  };
  
  return (
    <div className="flex h-full flex-col">
      <Header title="Postavke" />
      <div className="page-container">
        {/* Data folder status alert */}
        {isElectron && (
          <div className="mb-6">
            {dataFolderStatus === 'ready' && basePath && (
              <Alert variant="default" className="bg-green-50 border-green-200">
                <Check className="h-4 w-4 text-green-600" />
                <AlertTitle>Lokacija podataka je aktivna</AlertTitle>
                <AlertDescription className="text-green-700">
                  Svi podaci se pohranjuju u: {basePath}
                </AlertDescription>
              </Alert>
            )}
            
            {(dataFolderStatus === 'error' || !basePath) && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Lokacija podataka nije definirana</AlertTitle>
                <AlertDescription>
                  Molimo odaberite folder za pohranu podataka u sekciji "Lokacija podataka" ispod.
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ClinicInfo />
          <ExaminationTypes />
          <UsersManagement />
          <DataFolderSelect />
          <BackupRestore />
          <AppearanceSettings />
        </div>
      </div>
    </div>
  );
}
