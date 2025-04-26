
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useState } from "react";

export default function ClinicInfo() {
  const [isEditing, setIsEditing] = useState(false);
  
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
