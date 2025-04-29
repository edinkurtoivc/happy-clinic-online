
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { 
  FolderOpen, 
  Check, 
  HardDrive, 
  Save,
  WifiOff,
  Cloud,
  CloudOff,
  RefreshCw
} from "lucide-react";
import { AutoSaveIndicator } from "@/components/ui/auto-save-indicator";
import dataStorageService from "@/services/DataStorageService";
import { initializeFileSystem, migrateData } from "@/utils/fileSystemUtils";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function DataFolderSelect() {
  const { toast } = useToast();
  const [dataPath, setDataPath] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);
  const [isOnlineMode, setIsOnlineMode] = useState(false);
  const [folderSizeInfo, setFolderSizeInfo] = useState({
    usedSpace: "0 MB",
    totalSpace: "500 GB",
    percentage: 0,
  });
  const [isMigrating, setIsMigrating] = useState(false);
  const [showMigrationDialog, setShowMigrationDialog] = useState(false);
  const [migrationNewPath, setMigrationNewPath] = useState("");
  
  const isElectron = typeof window !== 'undefined' && window.electron?.isElectron;
  
  const loadInitialData = async () => {
    const savedPath = localStorage.getItem('dataFolderPath') || "";
    console.log("[DataFolderSelect] Initial data path from storage:", savedPath);
    
    if (savedPath) {
      setDataPath(savedPath);
      if (isElectron) {
        updateFolderInfo(savedPath);
      }
    }
  };
  
  useEffect(() => {
    loadInitialData();
  }, []);

  const updateFolderInfo = async (path: string) => {
    if (!isElectron || !path) return;
    
    try {
      const info = await window.electron.getFolderInfo(path);
      setFolderSizeInfo(info);
    } catch (error) {
      console.error("Error getting folder info:", error);
    }
  };

  const handleSelectFolder = async () => {
    if (!isElectron) {
      toast({
        title: "Greška",
        description: "Ova funkcija je dostupna samo u desktop verziji aplikacije.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      const selectedPath = await window.electron.openDirectory();
      if (selectedPath) {
        // Check if we need to migrate data
        if (dataPath && dataPath !== selectedPath) {
          // Show migration dialog
          setMigrationNewPath(selectedPath);
          setShowMigrationDialog(true);
          return;
        }
        
        // Set the new path directly if no previous path
        await setFolderPath(selectedPath);
      }
    } catch (error) {
      console.error("Error selecting folder:", error);
      toast({
        title: "Greška",
        description: "Nije moguće odabrati folder.",
        variant: "destructive"
      });
    }
  };
  
  const setFolderPath = async (path: string) => {
    setDataPath(path);
    localStorage.setItem('dataFolderPath', path);
    
    // Initialize file structure
    const initialized = await initializeFileSystem(path);
    
    if (initialized) {
      dataStorageService.basePath = path;
      updateFolderInfo(path);
      
      toast({
        title: "Folder odabran",
        description: "Nova lokacija je postavljena za spremanje podataka."
      });
    } else {
      toast({
        title: "Greška",
        description: "Nije moguće inicijalizirati strukturu foldera.",
        variant: "destructive"
      });
    }
  };
  
  const handleMigrateData = async () => {
    if (!dataPath || !migrationNewPath || dataPath === migrationNewPath) {
      setShowMigrationDialog(false);
      return;
    }
    
    setIsMigrating(true);
    
    try {
      const migrated = await migrateData(dataPath, migrationNewPath);
      
      if (migrated) {
        await setFolderPath(migrationNewPath);
        
        toast({
          title: "Uspješno",
          description: "Podaci su uspješno premješteni na novu lokaciju."
        });
      } else {
        toast({
          title: "Greška",
          description: "Nije moguće premjestiti podatke na novu lokaciju.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error migrating data:", error);
      toast({
        title: "Greška",
        description: "Došlo je do greške pri premještanju podataka.",
        variant: "destructive"
      });
    } finally {
      setIsMigrating(false);
      setShowMigrationDialog(false);
    }
  };
  
  const handleSaveLocation = async () => {
    if (!dataPath) {
      toast({
        title: "Greška",
        description: "Morate odabrati folder za spremanje podataka.",
        variant: "destructive"
      });
      return;
    }
    
    setIsSaving(true);
    
    try {
      // Initialize file structure if needed
      if (isElectron) {
        const initialized = await initializeFileSystem(dataPath);
        
        if (initialized) {
          dataStorageService.basePath = dataPath;
        } else {
          throw new Error("Nije moguće inicijalizirati strukturu foldera.");
        }
      }
      
      // Save the path to localStorage
      localStorage.setItem('dataFolderPath', dataPath);
      
      toast({
        title: "Uspješno",
        description: "Lokacija za podatke je uspješno spremljena.",
      });
    } catch (error) {
      console.error("Greška pri spremanju lokacije:", error);
      toast({
        title: "Greška",
        description: "Dogodila se greška pri spremanju lokacije.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  const toggleMode = () => {
    setIsOnlineMode(!isOnlineMode);
    toast({
      title: isOnlineMode ? "Offline način rada" : "Online način rada",
      description: isOnlineMode 
        ? "Podatci će biti spremljeni lokalno" 
        : "Podatci će biti sinkronizirani s serverom",
    });
  };

  return (
    <>
      <Card className="p-6">
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Lokacija podataka</h2>
              <p className="text-muted-foreground">
                Odaberite gdje želite da se vaši podaci spremaju {isElectron ? "na računaru" : ""}
              </p>
            </div>
            <Button
              variant="outline" 
              size="sm" 
              onClick={toggleMode}
              className="flex items-center gap-2"
            >
              {isOnlineMode ? (
                <>
                  <Cloud className="h-4 w-4" />
                  Online način
                </>
              ) : (
                <>
                  <CloudOff className="h-4 w-4" />
                  Offline način
                </>
              )}
            </Button>
          </div>
        </div>

        <div className="space-y-6">
          <div className="space-y-4">
            <label className="text-sm font-medium block">Struktura podataka</label>
            <div className="bg-muted p-3 rounded-md text-sm">
              <p className="mb-2">Vaši podaci će biti organizovani u sljedećoj strukturi:</p>
              <pre className="text-xs overflow-x-auto">
{`📂 [Lokacija]
├── 📂 Pacijenti/
├── 📂 Korisnici/
├── 📂 Termini/
├── 📂 Nalazi/
├── 📂 VrstePregleda/
├── 📂 Postavke/
├── 📂 SigurnosneKopije/
└── log.txt`}
              </pre>
            </div>
            
            <label className="text-sm font-medium block mt-4">Trenutna lokacija podataka</label>
            
            <div className="flex gap-3">
              <Input 
                value={dataPath} 
                onChange={(e) => setDataPath(e.target.value)}
                placeholder={isElectron ? "Odaberite folder klikom na gumb" : "/putanja/do/vašeg/foldera"}
                className="flex-1"
              />
              <Button 
                variant="outline" 
                onClick={handleSelectFolder}
              >
                <FolderOpen className="mr-2 h-4 w-4" />
                Odaberi folder
              </Button>
            </div>
            
            <div className="flex justify-end">
              <Button 
                onClick={handleSaveLocation} 
                disabled={isSaving || !dataPath}
              >
                <Check className="mr-2 h-4 w-4" />
                {isSaving ? "Spremanje..." : "Spremi lokaciju"}
              </Button>
            </div>
          </div>
          
          {dataPath && (
            <div className="border-t pt-6">
              <div className="flex items-center gap-3 mb-4">
                <HardDrive className="h-5 w-5 text-muted-foreground" />
                <h3 className="font-medium">Informacije o prostoru</h3>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Iskorišteno:</span>
                  <span className="font-medium">{folderSizeInfo.usedSpace}</span>
                </div>
                
                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-clinic-600 rounded-full"
                    style={{ width: `${folderSizeInfo.percentage}%` }}
                  ></div>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    {folderSizeInfo.percentage.toFixed(2)}% iskorišteno
                  </span>
                  <span className="text-muted-foreground">
                    Ukupno: {folderSizeInfo.totalSpace}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>
      
      <Dialog open={showMigrationDialog} onOpenChange={setShowMigrationDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Premještanje podataka</DialogTitle>
            <DialogDescription>
              Želite li premjestiti postojeće podatke na novu lokaciju?
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <p className="text-sm mb-4">
              Trenutna lokacija: <span className="font-medium">{dataPath}</span>
            </p>
            <p className="text-sm mb-4">
              Nova lokacija: <span className="font-medium">{migrationNewPath}</span>
            </p>
            <p className="text-sm text-muted-foreground">
              Ova akcija će kopirati sve podatke sa trenutne lokacije na novu lokaciju.
            </p>
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowMigrationDialog(false)}
              disabled={isMigrating}
            >
              Odustani
            </Button>
            <Button 
              onClick={handleMigrateData} 
              disabled={isMigrating}
            >
              {isMigrating ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Premještanje...
                </>
              ) : (
                "Premjesti podatke"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
