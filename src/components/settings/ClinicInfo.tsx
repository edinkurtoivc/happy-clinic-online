
import { useState, useRef, ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Upload } from "lucide-react";

export default function ClinicInfo() {
  const [isEditing, setIsEditing] = useState(false);
  const [logo, setLogo] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  
  const handleLogoUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    
    if (!file) return;
    
    // Provjera da li je PNG
    if (!file.type.includes('png')) {
      toast({
        title: "Greška",
        description: "Dozvoljen je samo PNG format za logotip.",
        variant: "destructive"
      });
      return;
    }
    
    // Pretvaranje slike u base64 string
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      setLogo(base64);
      
      // Spremanje u localStorage za perzistentnost
      localStorage.setItem('clinicLogo', base64);
      
      toast({
        title: "Uspješno",
        description: "Logotip prakse je uspješno učitan.",
      });
    };
    
    reader.readAsDataURL(file);
  };
  
  // Učitavanje logotipa iz lokalnog spremišta prilikom inicijalizacije komponente
  useState(() => {
    const savedLogo = localStorage.getItem('clinicLogo');
    if (savedLogo) {
      setLogo(savedLogo);
    }
  });
  
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-semibold">Informacije o privatnoj praksi</h2>
          <p className="text-muted-foreground">
            Ažurirajte podatke za vašu privatnu praksu
          </p>
        </div>
        <Button 
          variant="outline" 
          onClick={() => setIsEditing(!isEditing)}
        >
          {isEditing ? "Sačuvaj" : "Uredi"}
        </Button>
      </div>
      
      {/* Sekcija za logotip */}
      <div className="mb-6">
        <h3 className="font-medium mb-2">Logotip prakse</h3>
        <div className="flex items-center gap-4">
          <div className="w-24 h-24 border rounded-md flex items-center justify-center bg-gray-50">
            {logo ? (
              <img 
                src={logo} 
                alt="Logotip klinike" 
                className="max-w-full max-h-full object-contain"
              />
            ) : (
              <span className="text-muted-foreground text-sm text-center p-2">
                Nije učitan logotip
              </span>
            )}
          </div>
          <div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={triggerFileInput}
              className="mb-1"
            >
              <Upload className="h-4 w-4 mr-2" /> Učitaj logotip
            </Button>
            <p className="text-xs text-muted-foreground">Samo PNG format, maksimalno 2MB</p>
            
            <input 
              type="file" 
              ref={fileInputRef}
              className="hidden"
              accept="image/png"
              onChange={handleLogoUpload}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="font-medium mb-2 block">Naziv privatne prakse</label>
          <Input 
            value="Spark Studio"
            readOnly={!isEditing}
            className={!isEditing ? "bg-muted" : ""}
          />
        </div>
        
        <div>
          <label className="font-medium mb-2 block">Adresa privatne prakse</label>
          <Input 
            value="Ozimice 1"
            readOnly={!isEditing}
            className={!isEditing ? "bg-muted" : ""}
          />
        </div>
        
        <div>
          <label className="font-medium mb-2 block">Grad</label>
          <Input 
            value="Bihać"
            readOnly={!isEditing}
            className={!isEditing ? "bg-muted" : ""}
          />
        </div>
        
        <div>
          <label className="font-medium mb-2 block">Kanton</label>
          <Input 
            value="Unsko-sanski kanton"
            readOnly={!isEditing}
            className={!isEditing ? "bg-muted" : ""}
          />
        </div>
        
        <div>
          <label className="font-medium mb-2 block">Telefonski broj</label>
          <Input 
            value="387 61 123 456"
            readOnly={!isEditing}
            className={!isEditing ? "bg-muted" : ""}
          />
        </div>
        
        <div>
          <label className="font-medium mb-2 block">Email</label>
          <Input 
            value="spark.studio.dev@gmail.com"
            readOnly={!isEditing}
            className={!isEditing ? "bg-muted" : ""}
          />
        </div>
      </div>
    </Card>
  );
}
