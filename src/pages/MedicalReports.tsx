
import { useState, useRef } from "react";
import Header from "@/components/layout/Header";
import MedicalReportPreview from "@/components/medical-reports/MedicalReportPreview";
import MedicalReportForm from "@/components/medical-reports/MedicalReportForm";
import type { MedicalReport } from "@/types/medical-report";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bold, Italic, Underline, Save, Printer, Signature, Stamp } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import PatientsList from "@/components/patients/PatientsList";
import html2pdf from "html2pdf.js";

// Mock data for patients
const mockPatients = [
  { id: 1, name: "Ana Marković", dob: "1985-04-12", gender: "F", jmbg: "1204985123456", phone: "064-123-4567" },
  { id: 2, name: "Nikola Jovanović", dob: "1976-08-30", gender: "M", jmbg: "3008976123456", phone: "065-234-5678" },
  { id: 3, name: "Milica Petrović", dob: "1990-11-15", gender: "F", jmbg: "1511990123456", phone: "063-345-6789" },
  { id: 4, name: "Stefan Nikolić", dob: "1982-02-22", gender: "M", jmbg: "2202982123456", phone: "062-456-7890" },
  { id: 5, name: "Jelena Stojanović", dob: "1995-07-08", gender: "F", jmbg: "0807995123456", phone: "061-567-8901" },
];

export default function MedicalReports() {
  const { toast } = useToast();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [showPatientsDropdown, setShowPatientsDropdown] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [reportText, setReportText] = useState("");
  const [therapyText, setTherapyText] = useState("");
  const [hasSignature, setHasSignature] = useState(false);
  const [hasStamp, setHasStamp] = useState(false);
  const reportPreviewRef = useRef<HTMLDivElement>(null);

  const filteredPatients = mockPatients.filter(patient =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.jmbg.includes(searchTerm)
  );

  const handleSelectPatient = (patient: any) => {
    setSelectedPatient(patient);
    setShowPatientsDropdown(false);
  };

  const handleCreateReport = async (data: Partial<MedicalReport>) => {
    // Will implement with Supabase later
    console.log('Kreiranje medicinskog izvještaja:', data);
    toast({
      title: "Nalaz sačuvan",
      description: "Nalaz je uspješno dodan u historiju pacijenta.",
    });
  };

  const handleSaveReport = () => {
    const currentDate = new Date().toISOString();
    
    if (!selectedPatient) {
      toast({
        title: "Greška",
        description: "Molimo odaberite pacijenta prije spremanja nalaza.",
        variant: "destructive",
      });
      return;
    }
    
    if (!reportText.trim()) {
      toast({
        title: "Greška",
        description: "Unesite tekst nalaza prije spremanja.",
        variant: "destructive",
      });
      return;
    }

    const reportData: Partial<MedicalReport> = {
      patientId: selectedPatient.id.toString(),
      doctorId: "1", // Mock doctor ID
      date: currentDate,
      report: reportText,
      therapy: therapyText,
      status: 'final',
      patientInfo: {
        fullName: selectedPatient.name,
        birthDate: selectedPatient.dob,
        gender: selectedPatient.gender as 'M' | 'F',
        jmbg: selectedPatient.jmbg
      }
    };

    handleCreateReport(reportData);
  };

  const generatePDF = () => {
    if (!reportPreviewRef.current) {
      toast({
        title: "Greška",
        description: "Nije moguće generisati PDF u ovom trenutku.",
        variant: "destructive",
      });
      return;
    }

    const element = reportPreviewRef.current;
    const opt = {
      margin: 10,
      filename: `nalaz-${selectedPatient?.name || 'pacijent'}-${new Date().toLocaleDateString('bs')}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
    };

    html2pdf().set(opt).from(element).save();
    
    toast({
      title: "PDF generisan",
      description: "Nalaz je uspješno konvertovan u PDF format.",
    });
  };

  return (
    <div className="flex h-full flex-col">
      <Header 
        title="Nalaz i Mišljenje"
      />
      
      <div className="page-container p-4">
        {/* Breadcrumb */}
        <div className="flex items-center text-sm mb-6">
          <span className="text-muted-foreground">Početna</span>
          <span className="mx-2">›</span>
          <span className="text-emerald-600">Nalaz i Mišljenje</span>
        </div>
        
        {/* Patient selection */}
        <div className="relative mb-6">
          <div className="w-full relative">
            <Input 
              placeholder={selectedPatient ? selectedPatient.name : "Odaberite pacijenta"}
              className="w-full border rounded-md p-4"
              onClick={() => setShowPatientsDropdown(!showPatientsDropdown)}
              readOnly
            />
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
            </div>
          </div>
          
          {showPatientsDropdown && (
            <div className="absolute z-10 w-full bg-white border rounded-md mt-1 shadow-md">
              <Input 
                placeholder="Pronađite pacijenta..." 
                className="m-2 w-[calc(100%-16px)]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <div className="p-2 hover:bg-gray-100 cursor-pointer flex border-t">
                <span className="text-emerald-600">+</span>
                <span className="ml-2">Dodaj novog pacijenta</span>
              </div>
              {filteredPatients.map(patient => (
                <div 
                  key={patient.id} 
                  className="p-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() => handleSelectPatient(patient)}
                >
                  {patient.name}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mx-auto max-w-[1120px]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Editor Section */}
            <div className="w-full max-w-[560px]">
              <h2 className="text-xl font-semibold mb-4 text-emerald-600">Editor za nalaz</h2>
              <div className="border rounded-md p-2 mb-4">
                <div className="flex gap-2 mb-2">
                  <Button variant="outline" size="icon" className="h-8 w-8">
                    <Bold className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon" className="h-8 w-8">
                    <Italic className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon" className="h-8 w-8">
                    <Underline className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="border rounded-md p-4 h-[300px] mb-6">
                <textarea 
                  className="w-full h-full outline-none resize-none" 
                  placeholder="Unesite tekst nalaza..."
                  value={reportText}
                  onChange={(e) => setReportText(e.target.value)}
                ></textarea>
              </div>
              
              <h2 className="text-xl font-semibold mb-4 text-emerald-600">Terapija i preporuke</h2>
              <div className="border rounded-md p-4 h-[200px] mb-4">
                <textarea 
                  className="w-full h-full outline-none resize-none" 
                  placeholder="Unesite terapiju i preporuke..."
                  value={therapyText}
                  onChange={(e) => setTherapyText(e.target.value)}
                ></textarea>
              </div>
              
              <div className="flex items-center space-x-4 mb-4">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className={`flex items-center gap-2 ${hasSignature ? 'bg-emerald-100' : ''}`}
                  onClick={() => setHasSignature(!hasSignature)}
                >
                  <Signature className="h-4 w-4" /> {hasSignature ? 'Potpis dodan' : 'Dodaj potpis'}
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className={`flex items-center gap-2 ${hasStamp ? 'bg-emerald-100' : ''}`}
                  onClick={() => setHasStamp(!hasStamp)}
                >
                  <Stamp className="h-4 w-4" /> {hasStamp ? 'Pečat dodan' : 'Dodaj pečat'}
                </Button>
              </div>
            </div>
            
            {/* Preview Section */}
            <div className="w-full max-w-[560px]">
              <MedicalReportPreview 
                ref={reportPreviewRef}
                patient={selectedPatient}
                reportText={reportText}
                therapyText={therapyText}
                showSignature={hasSignature}
                showStamp={hasStamp}
                onPrint={generatePDF}
                onSave={handleSaveReport}
              />
            </div>
          </div>
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
