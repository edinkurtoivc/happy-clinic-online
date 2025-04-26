
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Printer, Save } from "lucide-react";

export default function MedicalReportPreview() {
  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between mb-4">
        <h2 className="text-xl font-semibold">Pregled uživo</h2>
        <div className="space-x-2">
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <Printer className="h-4 w-4" /> Print i PDF
          </Button>
          <Button size="sm" className="bg-emerald-500 hover:bg-emerald-600 flex items-center gap-2">
            <Save className="h-4 w-4" /> Spremi
          </Button>
        </div>
      </div>
      
      <Card className="p-6 font-[Inter] text-sm flex-1">
        {/* Header with clinic info */}
        <div className="text-right mb-8">
          <img 
            src="/placeholder.svg" 
            alt="Clinic Logo" 
            className="inline-block h-12 mb-2"
          />
          <h2 className="font-semibold text-lg text-emerald-600">Spark Studio</h2>
          <p className="text-muted-foreground">
            Ozimice 1, Bihać<br />
            spark.studio.dev@gmail.com<br />
            387 61 123 456
          </p>
        </div>

        {/* Patient info */}
        <div className="mb-8">
          <p className="font-bold">Ime i Prezime:</p>
          <p>Datum rođenja:</p>
          <p>Spol:</p>
          <p>JMBG:</p>
          <p className="mt-4">Datum ispisa nalaza: 20 mar 2025.</p>
        </div>

        {/* Report content */}
        <div className="space-y-6">
          <div>
            <h3 className="font-semibold mb-2">Nalaz</h3>
            <p className="whitespace-pre-wrap min-h-[100px]">
              Ovdje će biti prikazan tekst nalaza koji korisnik unosi...
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Terapija i preporuke</h3>
            <p className="whitespace-pre-wrap min-h-[100px]">
              Ovdje će biti prikazana terapija i preporuke...
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
