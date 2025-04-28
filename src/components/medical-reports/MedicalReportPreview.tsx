import { forwardRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Printer, Save, ShieldCheck } from "lucide-react";
import { format } from "date-fns";

interface MedicalReportPreviewProps {
  patient?: any;
  reportText: string;
  therapyText: string;
  showSignature: boolean;
  showStamp: boolean;
  onPrint: () => void;
  onSave: () => void;
  isSaved: boolean;
  verificationStatus?: 'unverified' | 'pending' | 'verified';
  verifiedBy?: string;
  visitType?: string;
  doctorName?: string;
  appointmentType?: string;
}

const MedicalReportPreview = forwardRef<HTMLDivElement, MedicalReportPreviewProps>(
  ({ 
    patient, 
    reportText, 
    therapyText, 
    showSignature, 
    showStamp, 
    onPrint, 
    onSave,
    isSaved,
    verificationStatus = 'unverified',
    verifiedBy,
    visitType,
    doctorName,
    appointmentType
  }, ref) => {
    const formatDate = (dateString?: string) => {
      if (!dateString) return "";
      
      try {
        return format(new Date(dateString), "dd.MM.yyyy.");
      } catch (e) {
        return dateString;
      }
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
              disabled={!isSaved || verificationStatus !== 'verified'}
              title={!isSaved ? "Nalaz mora biti sačuvan prije printanja" : 
                     verificationStatus !== 'verified' ? "Nalaz mora biti verifikovan prije printanja" : ""}
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
          <div className="flex justify-between items-start mb-8">
            <div className="flex-shrink-0">
              <img 
                src="/placeholder.svg" 
                alt="Clinic Logo" 
                className="h-12 mb-2"
              />
            </div>
            
            <div className="text-right">
              <h2 className="font-semibold text-lg text-emerald-600">Spark Studio</h2>
              <p className="text-muted-foreground">
                Ozimice 1, Bihać<br />
                spark.studio.dev@gmail.com<br />
                387 61 123 456
              </p>
            </div>
          </div>

          <div className="mb-8">
            <p className="font-bold">Ime i Prezime: {patient ? patient.name : ""}</p>
            <p>Datum rođenja: {patient ? formatDate(patient.dob) : ""}</p>
            <p>Spol: {patient ? (patient.gender === "M" ? "Muški" : "Ženski") : ""}</p>
            <p>JMBG: {patient ? patient.jmbg : ""}</p>
            <p className="mt-4">Datum ispisa nalaza: {today}</p>
            <div className="mt-2">
              {appointmentType && (
                <p className="font-medium text-emerald-700">
                  Vrsta pregleda: {appointmentType}
                </p>
              )}
              {visitType && (
                <p className="font-medium text-emerald-700 mt-1">
                  Tip pregleda: {visitType === 'first' ? 'Prvi pregled' : 'Kontrolni pregled'}
                </p>
              )}
            </div>
          </div>

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
            
            {isSaved && (
              <div className="mt-4 p-2 rounded-md text-sm">
                {verificationStatus === 'verified' && verifiedBy && (
                  <div className="flex items-center text-green-700 bg-green-50 p-2 rounded-md">
                    <ShieldCheck className="h-4 w-4 mr-2" />
                    <span>✅ Verifikovano od strane {verifiedBy}</span>
                  </div>
                )}
                {verificationStatus === 'pending' && (
                  <div className="text-amber-700 bg-amber-50 p-2 rounded-md">
                    Čeka verifikaciju
                  </div>
                )}
              </div>
            )}
            
            {(showSignature || showStamp) && (
              <div className="mt-12 pt-8 text-right">
                <div className="flex justify-end items-end space-x-4">
                  {showSignature && (
                    <div className="text-center">
                      <div className="border-b border-black w-32 mb-1"></div>
                      <p className="text-xs text-gray-600">
                        {doctorName || "potpis doktora"}
                      </p>
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
