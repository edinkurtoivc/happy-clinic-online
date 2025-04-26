
import { useState } from "react";
import { Settings2 } from "lucide-react";
import Header from "@/components/layout/Header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import MedicalReportForm from "@/components/medical-reports/MedicalReportForm";
import type { MedicalReport } from "@/types/medical-report";

export default function MedicalReports() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const handleCreateReport = async (data: Partial<MedicalReport>) => {
    // Will implement with Supabase
    console.log('Kreiranje medicinskog izvještaja:', data);
  };

  return (
    <div className="flex h-full flex-col">
      <Header 
        title="Medicinski Izvještaji"
        action={{
          label: "Novi Izvještaj",
          onClick: () => setIsFormOpen(true),
        }}
      />
      <div className="page-container p-6">
        <Card className="mb-6">
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">Informacije o privatnoj praksi</h2>
            <p className="text-muted-foreground mb-6">
              Ažurirajte podatke za vašu privatnu praksu. Ove informacije su nužne i koriste se prilikom kreiranja nalaza i mišljenja.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium mb-2">Naziv privatne prakse</h3>
                <p className="text-muted-foreground">Spark Studio</p>
              </div>
              
              <div>
                <h3 className="font-medium mb-2">Adresa privatne prakse</h3>
                <p className="text-muted-foreground">Ozimice 1</p>
              </div>
              
              <div>
                <h3 className="font-medium mb-2">Grad</h3>
                <p className="text-muted-foreground">Bihać</p>
              </div>
              
              <div>
                <h3 className="font-medium mb-2">Kanton</h3>
                <p className="text-muted-foreground">Unsko-sanski kanton</p>
              </div>
              
              <div>
                <h3 className="font-medium mb-2">Telefonski broj 1</h3>
                <p className="text-muted-foreground">387 61 123 456</p>
              </div>
              
              <div>
                <h3 className="font-medium mb-2">Email 1</h3>
                <p className="text-muted-foreground">spark.studio.dev@gmail.com</p>
              </div>
            </div>
          </div>
        </Card>

        <div className="flex justify-end mt-4">
          <Button 
            variant="outline"
            className="flex items-center gap-2"
            onClick={() => setShowSettings(true)}
          >
            <Settings2 className="h-4 w-4" />
            Postavke
          </Button>
        </div>
      </div>

      <MedicalReportForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSubmit={handleCreateReport}
      />
    </div>
  );
}
