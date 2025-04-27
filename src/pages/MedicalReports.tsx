
import { useState, useRef, useEffect } from "react";
import Header from "@/components/layout/Header";
import MedicalReportPreview from "@/components/medical-reports/MedicalReportPreview";
import MedicalReportForm from "@/components/medical-reports/MedicalReportForm";
import ReportVerification from "@/components/medical-reports/ReportVerification";
import type { MedicalReport, ExaminationType } from "@/types/medical-report";
import type { Patient } from "@/types/patient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bold, Italic, Underline, Save, Printer, Signature, Stamp, AlertTriangle, ShieldCheck } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import PatientsList from "@/components/patients/PatientsList";
import html2pdf from "html2pdf.js";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogFooter 
} from "@/components/ui/dialog";

// Mock data for patients
const mockPatients = [
  { id: 1, name: "Ana Marković", dob: "1985-04-12", gender: "F", jmbg: "1204985123456", phone: "064-123-4567" },
  { id: 2, name: "Nikola Jovanović", dob: "1976-08-30", gender: "M", jmbg: "3008976123456", phone: "065-234-5678" },
  { id: 3, name: "Milica Petrović", dob: "1990-11-15", gender: "F", jmbg: "1511990123456", phone: "063-345-6789" },
  { id: 4, name: "Stefan Nikolić", dob: "1982-02-22", gender: "M", jmbg: "2202982123456", phone: "062-456-7890" },
  { id: 5, name: "Jelena Stojanović", dob: "1995-07-08", gender: "F", jmbg: "0807995123456", phone: "061-567-8901" },
];

// Mock data for examination types - would come from settings in a real app
const mockExaminationTypes: ExaminationType[] = [
  { id: 1, name: "Internistički pregled", duration: "30", price: "50" },
  { id: 2, name: "Kardiološki pregled", duration: "40", price: "80" },
  { id: 3, name: "Laboratorijski nalaz", duration: "20", price: "30" },
  { id: 4, name: "Oftalmološki pregled", duration: "25", price: "45" },
  { id: 5, name: "Pedijatrijski pregled", duration: "30", price: "40" },
];

// Mock current user/doctor
const currentDoctor = {
  id: "1",
  name: "Dr. Marko Marković",
  specialization: "Kardiolog"
};

export default function MedicalReports() {
  const { toast } = useToast();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isVerificationDialogOpen, setIsVerificationDialogOpen] = useState(false);
  const [showPatientsDropdown, setShowPatientsDropdown] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [reportText, setReportText] = useState("");
  const [therapyText, setTherapyText] = useState("");
  const [selectedExamType, setSelectedExamType] = useState<string>("");
  const [hasSignature, setHasSignature] = useState(false);
  const [hasStamp, setHasStamp] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [savedReport, setSavedReport] = useState<Partial<MedicalReport> | null>(null);
  const [showFinalizeConfirm, setShowFinalizeConfirm] = useState(false);
  const [isFinalizingReport, setIsFinalizingReport] = useState(false);
  const reportPreviewRef = useRef<HTMLDivElement>(null);

  // Fetch examination types from settings (mock implementation)
  const [examinationTypes, setExaminationTypes] = useState<ExaminationType[]>(mockExaminationTypes);
  
  useEffect(() => {
    // Here you would fetch exam types from your backend
    // For now we're using mock data
  }, []);
  
  const filteredPatients = mockPatients.filter(patient =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.jmbg.includes(searchTerm)
  );

  const handleSelectPatient = (patient: Patient) => {
    // Convert gender type if needed
    const typedPatient: Patient = {
      ...patient,
      gender: patient.gender as 'M' | 'F'
    };
    
    setSelectedPatient(typedPatient);
    setShowPatientsDropdown(false);
    // Reset the report form when a new patient is selected
    if (isSaved) {
      resetReportState();
    }
  };

  const resetReportState = () => {
    setReportText("");
    setTherapyText("");
    setSelectedExamType("");
    setIsSaved(false);
    setSavedReport(null);
    setHasSignature(false);
    setHasStamp(false);
  };

  const handleCreateReport = async (data: Partial<MedicalReport>) => {
    // Will implement with Supabase later
    console.log('Kreiranje medicinskog izvještaja:', data);
    
    // For now, simulate saving with an ID
    const savedReportData: Partial<MedicalReport> = {
      ...data,
      id: `report-${Date.now()}`,
      patientId: selectedPatient.id.toString(),
      doctorId: currentDoctor.id,
      date: new Date().toISOString(),
      verificationStatus: data.status === 'final' ? 'pending' as const : 'unverified' as const,
      doctorInfo: {
        fullName: currentDoctor.name,
        specialization: currentDoctor.specialization
      }
    };
    
    setSavedReport(savedReportData);
    
    toast({
      title: "Nalaz sačuvan",
      description: data.status === 'final' 
        ? "Finalni nalaz je spreman za verifikaciju." 
        : "Nalaz je sačuvan kao nacrt.",
    });
    
    // If it's a final report, show verification dialog
    if (data.status === 'final') {
      setTimeout(() => {
        setIsVerificationDialogOpen(true);
      }, 500);
    }
  };

  const handleSaveReport = () => {
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
    
    if (!selectedExamType) {
      toast({
        title: "Greška",
        description: "Odaberite vrstu pregleda prije spremanja nalaza.",
        variant: "destructive",
      });
      return;
    }

    // Ask if they want to finalize
    setShowFinalizeConfirm(true);
  };
  
  const handleFinalizeReport = (isFinal: boolean) => {
    setShowFinalizeConfirm(false);
    setIsFinalizingReport(true);
    
    const currentDate = new Date().toISOString();
    
    const reportData: Partial<MedicalReport> = {
      patientId: selectedPatient.id.toString(),
      doctorId: currentDoctor.id,
      date: currentDate,
      report: reportText,
      therapy: therapyText,
      status: isFinal ? 'final' : 'draft',
      appointmentType: selectedExamType,
      patientInfo: {
        fullName: selectedPatient.name,
        birthDate: selectedPatient.dob,
        gender: selectedPatient.gender as 'M' | 'F',
        jmbg: selectedPatient.jmbg
      }
    };

    // Simulate a delay for saving
    setTimeout(() => {
      handleCreateReport(reportData);
      setIsFinalizingReport(false);
      setIsSaved(true);
    }, 1000);
  };
  
  const handleVerifyReport = (reportId: string, doctorName: string) => {
    // In a real app, this would call your backend API
    if (savedReport) {
      const verifiedReport = {
        ...savedReport,
        verificationStatus: 'verified' as const,
        verifiedBy: doctorName,
        verifiedAt: new Date().toISOString()
      };
      
      setSavedReport(verifiedReport);
      
      // Log this action
      console.log('Report verified:', {
        reportId,
        verifiedBy: doctorName,
        timestamp: new Date().toISOString()
      });
      
      toast({
        title: "Nalaz verifikovan",
        description: "Nalaz je uspješno verifikovan i spreman za printanje.",
      });
    }
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

    // Don't allow printing unverified reports
    if (savedReport?.verificationStatus !== 'verified') {
      toast({
        title: "Upozorenje",
        description: "Samo verifikovani nalaz može biti printovan.",
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
    
    // Log audit information about printing
    console.log('Audit log: Report printed', {
      reportId: savedReport?.id,
      patientId: selectedPatient?.id,
      doctorId: currentDoctor.id,
      timestamp: new Date().toISOString()
    });
    
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
        
        {/* Examination type selection */}
        {selectedPatient && (
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Vrsta pregleda</label>
            <select 
              className="w-full border rounded-md p-2" 
              value={selectedExamType}
              onChange={(e) => setSelectedExamType(e.target.value)}
              disabled={isSaved}
            >
              <option value="">Odaberite vrstu pregleda</option>
              {examinationTypes.map(type => (
                <option key={type.id} value={type.name}>{type.name}</option>
              ))}
            </select>
            {!selectedExamType && (
              <p className="text-sm text-amber-600 mt-1">
                <AlertTriangle className="inline-block h-4 w-4 mr-1" />
                Vrsta pregleda je obavezna za spremanje nalaza
              </p>
            )}
          </div>
        )}

        <div className="mx-auto max-w-[1120px]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Editor Section */}
            <div className="w-full max-w-[560px]">
              <h2 className="text-xl font-semibold mb-4 text-emerald-600">Editor za nalaz</h2>
              <div className="border rounded-md p-2 mb-4">
                <div className="flex gap-2 mb-2">
                  <Button variant="outline" size="icon" className="h-8 w-8" disabled={isSaved}>
                    <Bold className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon" className="h-8 w-8" disabled={isSaved}>
                    <Italic className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon" className="h-8 w-8" disabled={isSaved}>
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
                  disabled={isSaved}
                ></textarea>
              </div>
              
              <h2 className="text-xl font-semibold mb-4 text-emerald-600">Terapija i preporuke</h2>
              <div className="border rounded-md p-4 h-[200px] mb-4">
                <textarea 
                  className="w-full h-full outline-none resize-none" 
                  placeholder="Unesite terapiju i preporuke..."
                  value={therapyText}
                  onChange={(e) => setTherapyText(e.target.value)}
                  disabled={isSaved}
                ></textarea>
              </div>
              
              <div className="flex items-center space-x-4 mb-4">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className={`flex items-center gap-2 ${hasSignature ? 'bg-emerald-100' : ''}`}
                  onClick={() => setHasSignature(!hasSignature)}
                  disabled={isSaved}
                >
                  <Signature className="h-4 w-4" /> {hasSignature ? 'Potpis dodan' : 'Dodaj potpis'}
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className={`flex items-center gap-2 ${hasStamp ? 'bg-emerald-100' : ''}`}
                  onClick={() => setHasStamp(!hasStamp)}
                  disabled={isSaved}
                >
                  <Stamp className="h-4 w-4" /> {hasStamp ? 'Pečat dodan' : 'Dodaj pečat'}
                </Button>
              </div>
              
              {isSaved && (
                <div className="flex justify-between mt-4">
                  <Button 
                    variant="outline"
                    onClick={resetReportState}
                  >
                    Novi nalaz
                  </Button>
                  
                  {savedReport?.verificationStatus === 'pending' && (
                    <Button 
                      variant="outline"
                      className="border-green-500 text-green-600"
                      onClick={() => setIsVerificationDialogOpen(true)}
                    >
                      <ShieldCheck className="h-4 w-4 mr-2" />
                      Verifikuj nalaz
                    </Button>
                  )}
                </div>
              )}
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
                isSaved={isSaved}
                verificationStatus={savedReport?.verificationStatus}
                verifiedBy={savedReport?.verifiedBy}
                appointmentType={selectedExamType}
                doctorName={currentDoctor.name}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Report form dialog */}
      <MedicalReportForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSubmit={handleCreateReport}
        examinationTypes={examinationTypes}
      />
      
      {/* Report verification dialog */}
      {savedReport && (
        <ReportVerification
          open={isVerificationDialogOpen}
          onOpenChange={setIsVerificationDialogOpen}
          report={savedReport}
          onVerify={handleVerifyReport}
          currentDoctor={currentDoctor}
        />
      )}
      
      {/* Finalize confirmation dialog */}
      <Dialog open={showFinalizeConfirm} onOpenChange={setShowFinalizeConfirm}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Potvrda spremanja nalaza</DialogTitle>
            <DialogDescription>
              Želite li finalizovati nalaz ili sačuvati kao nacrt?
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter className="flex-col sm:flex-row sm:justify-between gap-2">
            <Button 
              variant="outline"
              onClick={() => handleFinalizeReport(false)}
              disabled={isFinalizingReport}
            >
              Sačuvaj kao nacrt
            </Button>
            <Button
              onClick={() => handleFinalizeReport(true)}
              className="bg-emerald-600 hover:bg-emerald-700"
              disabled={isFinalizingReport}
            >
              {isFinalizingReport ? 'Spremanje...' : 'Finaliziraj nalaz'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
