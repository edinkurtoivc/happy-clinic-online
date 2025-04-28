
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { FolderOpen, Check, HardDrive } from "lucide-react";

export default function DataFolderSelect() {
  const { toast } = useToast();
  const [dataPath, setDataPath] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);
  
  // U stvarnoj aplikaciji, ovo bismo dohvatili iz sistemske pohrane
  useEffect(() => {
    const savedPath = localStorage.getItem('dataFolderPath');
    if (savedPath) {
      setDataPath(savedPath);
    }
  }, []);

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

  return (
    <Card className="p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold">Lokacija podataka</h2>
        <p className="text-muted-foreground">
          Odaberite gdje želite da se vaši podaci spremaju na računaru
        </p>
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
          
          {dataPath && (
            <Button 
              onClick={handleSaveLocation} 
              disabled={isSaving}
            >
              <Check className="mr-2 h-4 w-4" />
              {isSaving ? "Spremanje..." : "Spremi lokaciju"}
            </Button>
          )}
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
