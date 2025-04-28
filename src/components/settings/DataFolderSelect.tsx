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
import { useSaveData } from "@/hooks/useSaveData";
import { AutoSaveIndicator } from "@/components/ui/auto-save-indicator";

export default function DataFolderSelect() {
  const { toast } = useToast();
  const [dataPath, setDataPath] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);
  const [isOnlineMode, setIsOnlineMode] = useState(true);
  
  // U stvarnoj aplikaciji, ovo bismo dohvatili iz sistemske pohrane
  useEffect(() => {
    const savedPath = localStorage.getItem('dataFolderPath');
    console.log("[DataFolderSelect] Initial data path from storage:", savedPath);
    if (savedPath) {
      setDataPath(savedPath);
    }
  }, []);

  const { isSaving: autoSaving, isOffline, saveStatus, initialDataLoaded } = useSaveData({
    data: { path: dataPath },
    key: "data-folder-config",
    onSave: async (data) => {
      console.log("[DataFolderSelect] Saving data folder config:", data);
      // U stvarnoj aplikaciji, ovdje bi bio API poziv
      await new Promise(resolve => setTimeout(resolve, 1000));
      localStorage.setItem('dataFolderPath', data.path);
    },
    condition: !!dataPath,
    onDataLoaded: (loadedData) => {
      if (loadedData.path) {
        console.log("[DataFolderSelect] Loaded data path from auto-save:", loadedData.path);
        setDataPath(loadedData.path);
      }
    }
  });

  const handleSelectFolder = () => {
    // U stvarnoj desktop aplikaciji, ovo bi otvorilo dialog za izbor foldera
    // Za potrebe simulacije, postavit ćemo samo primjer puta
    const newPath = `/Users/korisnik/Documents/MedicalData_${Date.now()}`;
    setDataPath(newPath);
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
    
    // Simulacija spremanja lokacije
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // U stvarnoj desktop aplikaciji, ovdje bismo spremili konfiguraciju u sistemsku pohranu
    localStorage.setItem('dataFolderPath', dataPath);
    
    toast({
      title: "Uspješno",
      description: "Lokacija za podatke je uspješno spremljena.",
    });
    
    setIsSaving(false);
  };
  
  const getFolderSizeInfo = () => {
    // U stvarnoj aplikaciji, ovo bi dohvatilo stvarnu veličinu podataka
    return {
      usedSpace: "245 MB",
      totalSpace: "500 GB",
      percentage: 0.5,  // 0.5%
    };
  };
  
  const sizeInfo = getFolderSizeInfo();

  const toggleMode = () => {
    setIsOnlineMode(!isOnlineMode);
    toast({
      title: isOnlineMode ? "Offline način rada" : "Online način rada",
      description: isOnlineMode 
        ? "Podatci će biti spremljeni lokalno" 
        : "Podatci će biti sinkronizirani s serverom",
    });
  };

  const getSaveStatusIndicator = () => {
    if (isOffline || !isOnlineMode) {
      return <WifiOff className="h-4 w-4 text-amber-500" />;
    }
    
    switch (saveStatus) {
      case "saving":
        return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />;
      case "saved":
        return <Check className="h-4 w-4 text-green-500" />;
      default:
        return <Save className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <Card className="p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">Lokacija podataka</h2>
            <p className="text-muted-foreground">
              Odaberite gdje želite da se vaši podaci spremaju na računaru
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
        
        {isOffline && (
          <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded-md flex items-center gap-2 text-sm text-amber-800">
            <WifiOff className="h-4 w-4" />
            Internet konekcija nije dostupna. Podaci će biti spremljeni lokalno.
          </div>
        )}
      </div>

      <div className="space-y-6">
        <div className="space-y-4">
          <label className="text-sm font-medium">Trenutna lokacija podataka</label>
          
          <div className="flex gap-3">
            <Input 
              value={dataPath} 
              onChange={(e) => setDataPath(e.target.value)}
              placeholder="/putanja/do/vašeg/foldera"
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
          
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2 text-sm">
              Status: 
              {getSaveStatusIndicator()}
              <span className="text-muted-foreground">
                {autoSaving ? "Spremanje..." : 
                  isOffline || !isOnlineMode ? "Lokalno spremljeno" : 
                  saveStatus === "saved" ? "Automatski spremljeno" : 
                  ""}
              </span>
            </div>
            
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
                <span className="font-medium">{sizeInfo.usedSpace}</span>
              </div>
              
              <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-clinic-600 rounded-full"
                  style={{ width: `${sizeInfo.percentage}%` }}
                ></div>
              </div>
              
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  {sizeInfo.percentage.toFixed(2)}% iskorišteno
                </span>
                <span className="text-muted-foreground">
                  Ukupno: {sizeInfo.totalSpace}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
