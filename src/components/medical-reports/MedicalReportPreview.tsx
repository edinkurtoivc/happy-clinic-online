
import { forwardRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Printer, Save } from "lucide-react";

interface MedicalReportPreviewProps {
  patient?: any;
  reportText: string;
  therapyText: string;
  showSignature: boolean;
  showStamp: boolean;
  onPrint: () => void;
  onSave: () => void;
}

const MedicalReportPreview = forwardRef<HTMLDivElement, MedicalReportPreviewProps>(
  ({ patient, reportText, therapyText, showSignature, showStamp, onPrint, onSave }, ref) => {
    // Format date in Bosnian locale
    const formatDate = (dateString?: string) => {
      if (!dateString) return "";
      
      const options: Intl.DateTimeFormatOptions = { 
        day: "numeric", 
        month: "short", 
        year: "numeric" 
      };
      
      return new Date(dateString).toLocaleDateString("bs-BA", options);
    };

    const today = formatDate(new Date().toISOString());

    return (
      <div className="flex flex-col h-full">
        <div className="flex justify-between mb-4">
          <h2 className="text-xl font-semibold">Pregled uživo</h2>
          <div className="space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex items-center gap-2"
              onClick={onPrint}
            >
              <Printer className="h-4 w-4" /> Print i PDF
            </Button>
            <Button 
              size="sm" 
              className="bg-emerald-500 hover:bg-emerald-600 flex items-center gap-2"
              onClick={onSave}
            >
              <Save className="h-4 w-4" /> Spremi
            </Button>
          </div>
        </div>
        
        <Card className="p-6 font-[Inter] text-sm flex-1 overflow-auto" ref={ref}>
          {/* Header with clinic and logo info */}
          <div className="flex justify-between items-start mb-8">
            {/* Logo on the left */}
            <div className="flex-shrink-0">
              <img 
                src="/placeholder.svg" 
                alt="Clinic Logo" 
                className="h-12 mb-2"
              />
            </div>
            
            {/* Clinic info on the right */}
            <div className="text-right">
              <h2 className="font-semibold text-lg text-emerald-600">Spark Studio</h2>
              <p className="text-muted-foreground">
                Ozimice 1, Bihać<br />
                spark.studio.dev@gmail.com<br />
                387 61 123 456
              </p>
            </div>
          </div>

          {/* Patient info */}
          <div className="mb-8">
            <p className="font-bold">Ime i Prezime: {patient ? patient.name : ""}</p>
            <p>Datum rođenja: {patient ? formatDate(patient.dob) : ""}</p>
            <p>Spol: {patient ? (patient.gender === "M" ? "Muški" : "Ženski") : ""}</p>
            <p>JMBG: {patient ? patient.jmbg : ""}</p>
            <p className="mt-4">Datum ispisa nalaza: {today}</p>
          </div>

          {/* Report content */}
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold mb-2">Nalaz</h3>
              <p className="whitespace-pre-wrap min-h-[100px] border-l-2 border-emerald-200 pl-2">
                {reportText || "Ovdje će biti prikazan tekst nalaza koji korisnik unosi..."}
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Terapija i preporuke</h3>
              <p className="whitespace-pre-wrap min-h-[100px] border-l-2 border-emerald-200 pl-2">
                {therapyText || "Ovdje će biti prikazana terapija i preporuke..."}
              </p>
            </div>
            
            {/* Signature and stamp area */}
            {(showSignature || showStamp) && (
              <div className="mt-12 pt-8 text-right">
                <div className="flex justify-end items-end space-x-4">
                  {showSignature && (
                    <div className="text-center">
                      <div className="border-b border-black w-32 mb-1"></div>
                      <p className="text-xs text-gray-600">potpis doktora</p>
                    </div>
                  )}
                  
                  {showStamp && (
                    <div className="border-2 border-dashed border-gray-300 rounded-full w-24 h-24 flex items-center justify-center text-gray-400">
                      Pečat
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>
    );
  }
);

MedicalReportPreview.displayName = "MedicalReportPreview";

export default MedicalReportPreview;
