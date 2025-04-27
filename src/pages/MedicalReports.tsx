import { useState, useRef } from "react";
import Header from "@/components/layout/Header";
import MedicalReportPreview from "@/components/medical-reports/MedicalReportPreview";
import MedicalReportForm from "@/components/medical-reports/MedicalReportForm";
import ReportVerification from "@/components/medical-reports/ReportVerification";
import PatientSelection from "@/components/medical-reports/PatientSelection";
import ExaminationTypeSelect from "@/components/medical-reports/ExaminationTypeSelect";
import ReportEditor from "@/components/medical-reports/ReportEditor";
import type { MedicalReport, ExaminationType } from "@/types/medical-report";
import type { Patient } from "@/types/patient";
import { useToast } from "@/components/ui/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import html2pdf from "html2pdf.js";

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
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
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
  const [examinationTypes] = useState<ExaminationType[]>(mockExaminationTypes);

  const handleSelectPatient = (patient: any) => {
    // Ensure patient has the correct gender type
    const typedPatient: Patient = {
      ...patient,
      gender: patient.gender as 'M' | 'F'
    };
    
    setSelectedPatient(typedPatient);
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
      patientId: selectedPatient!.id.toString(),
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
      patientId: selectedPatient!.id.toString(),
      doctorId: currentDoctor.id,
      date: currentDate,
      report: reportText,
      therapy: therapyText,
      status: isFinal ? 'final' : 'draft',
      appointmentType: selectedExamType,
      patientInfo: {
        fullName: selectedPatient!.name,
        birthDate: selectedPatient!.dob,
        gender: selectedPatient!.gender,
        jmbg: selectedPatient!.jmbg
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
      <Header title="Nalaz i Mišljenje" />
      
      <div className="page-container p-4">
        {/* Breadcrumb */}
        <div className="flex items-center text-sm mb-6">
          <span className="text-muted-foreground">Početna</span>
          <span className="mx-2">›</span>
          <span className="text-emerald-600">Nalaz i Mišljenje</span>
        </div>
        
        <PatientSelection 
          selectedPatient={selectedPatient}
          onSelectPatient={setSelectedPatient}
        />
        
        {selectedPatient && (
          <ExaminationTypeSelect
            selectedExamType={selectedExamType}
            onSelectExamType={setSelectedExamType}
            examinationTypes={examinationTypes}
            disabled={isSaved}
          />
        )}

        <div className="mx-auto max-w-[1120px]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ReportEditor 
              reportText={reportText}
              therapyText={therapyText}
              onReportChange={setReportText}
              onTherapyChange={setTherapyText}
              hasSignature={hasSignature}
              hasStamp={hasStamp}
              onToggleSignature={() => setHasSignature(!hasSignature)}
              onToggleStamp={() => setHasStamp(!hasStamp)}
              isSaved={isSaved}
              verificationStatus={savedReport?.verificationStatus}
              onResetReport={resetReportState}
              onOpenVerification={() => setIsVerificationDialogOpen(true)}
            />
            
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

      <MedicalReportForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSubmit={handleCreateReport}
        examinationTypes={examinationTypes}
      />
      
      {savedReport && (
        <ReportVerification
          open={isVerificationDialogOpen}
          onOpenChange={setIsVerificationDialogOpen}
          report={savedReport}
          onVerify={handleVerifyReport}
          currentDoctor={currentDoctor}
        />
      )}
      
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
