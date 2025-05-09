import { useState, useEffect, useRef } from "react";
import Header from "@/components/layout/Header";
import MedicalReportPreview from "@/components/medical-reports/MedicalReportPreview";
import MedicalReportForm from "@/components/medical-reports/MedicalReportForm";
import ReportVerification from "@/components/medical-reports/ReportVerification";
import PatientSelection from "@/components/medical-reports/PatientSelection";
import ExaminationTypeSelect from "@/components/medical-reports/ExaminationTypeSelect";
import ReportEditor from "@/components/medical-reports/ReportEditor";
import { useSaveData } from "@/hooks/useSaveData";
import { saveMedicalReport } from "@/utils/fileSystemUtils";
import { isAbsolutePath, normalizePath, createReportData, generateReportCode } from "@/utils/reportUtils";
import type { MedicalReport, ExaminationType } from "@/types/medical-report";
import type { Patient } from "@/types/patient";
import { ensurePatient } from "@/types/patient";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

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
  const [isSavingToFileSystem, setIsSavingToFileSystem] = useState(false);
  const [reportCode, setReportCode] = useState<string | undefined>(undefined);

  // Auto-save for the report editor
  const { saveStatus, lastSaved } = useSaveData({
    data: {
      reportText,
      therapyText,
      selectedExamType,
      hasSignature,
      hasStamp,
      patientId: selectedPatient?.id
    },
    key: `report-editor-draft`,
    saveDelay: 1500,
    condition: !isSaved && selectedPatient !== null,
    onSave: async (data) => {
      console.log("[MedicalReports] Auto-saving editor draft:", data);
    }
  });

  useEffect(() => {
    // Check for dataFolderPath in localStorage on component mount
    const basePath = localStorage.getItem('dataFolderPath');
    if (basePath) {
      console.log("[MedicalReports] Data folder path found:", basePath);
      // Validate the path
      if (!isAbsolutePath(basePath)) {
        console.warn("[MedicalReports] Data folder path is not absolute:", basePath);
        toast({
          title: "Upozorenje",
          description: "Putanja do foldera nije apsolutna. Izvještaji možda neće biti spremljeni.",
          variant: "destructive",
        });
      }
    } else {
      console.warn("[MedicalReports] No data folder path found in localStorage");
    }
  }, [toast]);

  const handleSelectPatient = (patient: any) => {
    // Ensure patient has the correct gender type and name getter
    const typedPatient = ensurePatient({
      ...patient,
      gender: patient.gender as 'M' | 'F'
    });
    
    setSelectedPatient(typedPatient);
    // When a new patient is selected, reset the report state
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
    setReportCode(undefined); // Reset report code when creating new report
  };

  const handleCreateReport = async (data: Partial<MedicalReport>) => {
    // Will implement with Supabase later
    console.log('[MedicalReports] Creating medical report:', data);
    
    // Generate a report code if not already set
    const reportCodeToUse = data.reportCode || generateReportCode();
    
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
      },
      reportCode: reportCodeToUse, // Include the report code
    };
    
    // Update state with the report code
    setReportCode(reportCodeToUse);
    
    // Try to save to file system if available
    const basePath = localStorage.getItem('dataFolderPath');
    if (basePath && window.electron?.isElectron) {
      setIsSavingToFileSystem(true);
      try {
        console.log("[MedicalReports] Saving report to filesystem:", savedReportData);
        const normalizedPath = normalizePath(basePath);
        console.log("[MedicalReports] Using normalized path:", normalizedPath);
        
        const saved = await saveMedicalReport(
          normalizedPath, 
          selectedPatient!.id.toString(), 
          savedReportData
        );
        
        if (saved) {
          toast({
            title: "Uspješno spremljeno",
            description: "Nalaz je uspješno spremljen u folder Nalazi",
          });
        } else {
          toast({
            title: "Greška",
            description: "Nije moguće spremiti nalaz na disk. Provjerite putanju foldera.",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("[MedicalReports] Error saving to file system:", error);
        toast({
          title: "Greška",
          description: "Došlo je do greške prilikom spremanja nalaza na disk.",
          variant: "destructive",
        });
      } finally {
        setIsSavingToFileSystem(false);
      }
    }
    
    setSavedReport(savedReportData);
    
    toast({
      title: "Nalaz sačuvan",
      description: data.status === 'final' 
        ? "Finalni nalaz je spreman za verifikaciju." 
        : "Nalaz je sačuvan kao nacrt.",
    });
    
    // Save to localStorage as well for compatibility
    try {
      const existingReports = JSON.parse(localStorage.getItem('medicalReports') || '[]');
      existingReports.push(savedReportData);
      localStorage.setItem('medicalReports', JSON.stringify(existingReports));
    } catch (error) {
      console.error("[MedicalReports] Error saving to localStorage:", error);
    }
    
    // If it's a final report, show verification dialog
    if (data.status === 'final') {
      setTimeout(() => {
        setIsVerificationDialogOpen(true);
      }, 500);
    }
  };

  const handleSaveReport = () => {
    // Validation before saving
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
    
    const typedPatient = ensurePatient(selectedPatient!);
    
    // Use the helper function to create report data
    const values = {
      report: reportText,
      therapy: therapyText,
      notes: "",
      status: isFinal ? "final" as const : "draft" as const,
      appointmentType: selectedExamType,
      visitType: "first" as const
    };
    
    const defaultValues = {
      patientId: typedPatient.id.toString(),
      doctorId: currentDoctor.id,
      patientInfo: {
        fullName: typedPatient.name,
        birthDate: typedPatient.dob,
        gender: typedPatient.gender,
        jmbg: typedPatient.jmbg
      }
    };
    
    const reportData = createReportData(values, defaultValues, isFinal ? "final" : "draft");
    
    // Debug log for testing
    console.log("[MedicalReports] Report data to be saved:", reportData);

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
      console.log('[MedicalReports] Report verified:', {
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

    // Log audit information about printing
    console.log('[MedicalReports] Audit log: Report printed', {
      reportId: savedReport?.id,
      patientId: selectedPatient?.id,
      doctorId: currentDoctor.id,
      timestamp: new Date().toISOString()
    });
    
    // Prepare the report for printing
    const printContent = reportPreviewRef.current.cloneNode(true) as HTMLElement;
    
    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast({
        title: "Greška",
        description: "Nije moguće otvoriti prozor za printanje. Provjerite postavke browsera.",
        variant: "destructive",
      });
      return;
    }
    
    // Add necessary styles for print
    printWindow.document.write(`
      <html>
        <head>
          <title>Nalaz - ${selectedPatient?.name || 'Pacijent'}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;500;600;700&display=swap');
            
            body {
              font-family: 'Open Sans', Arial, sans-serif;
              margin: 0;
              padding: 20px;
              color: #333;
              line-height: 1.5;
            }
            
            .report-container {
              max-width: 210mm;
              margin: 0 auto;
              background: white;
            }
            
            .header {
              display: flex;
              justify-content: space-between;
              margin-bottom: 20px;
            }
            
            .logo {
              height: 60px;
              object-fit: contain;
            }
            
            .clinic-info {
              text-align: right;
            }
            
            .clinic-name {
              font-weight: bold;
              color: #059669;
              font-size: 18px;
              margin-bottom: 5px;
            }
            
            .patient-info {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 20px;
              margin-bottom: 20px;
            }
            
            .separator {
              border-top: 1px solid #e5e7eb;
              margin: 20px 0;
            }
            
            .content-section {
              margin-bottom: 30px;
            }
            
            .section-title {
              font-weight: bold;
              margin-bottom: 10px;
              font-size: 16px;
            }
            
            .content-box {
              white-space: pre-wrap;
            }
            
            .signature-area {
              display: flex;
              justify-content: flex-end;
              margin-top: 60px;
              align-items: flex-end;
            }
            
            .signature-line {
              text-align: center;
            }
            
            .signature-line-border {
              border-bottom: 1px solid black;
              width: 120px;
              display: inline-block;
              margin-bottom: 5px;
            }
            
            .doctor-name {
              font-size: 12px;
              color: #666;
            }
            
            .stamp {
              border: 2px dashed #ccc;
              border-radius: 50%;
              width: 100px;
              height: 100px;
              display: flex;
              align-items: center;
              justify-content: center;
              margin-left: 20px;
              color: #999;
            }
            
            @media print {
              body {
                padding: 0;
                margin: 0;
              }
              
              .report-container {
                width: 100%;
                max-width: none;
                padding: 20px;
                box-sizing: border-box;
              }
              
              @page {
                margin: 15mm;
                size: A4;
              }
            }
          </style>
        </head>
        <body>
          <div class="report-container">
            ${printContent.outerHTML}
          </div>
          <script>
            // Remove unnecessary elements that shouldn't be printed
            document.addEventListener('DOMContentLoaded', function() {
              // Find and remove elements with print:hidden class
              const elementsToRemove = document.querySelectorAll('.print\\:hidden');
              elementsToRemove.forEach(el => el.remove());
              
              // Open print dialog after everything is loaded
              window.print();
              
              // Close window after printing
              window.addEventListener('afterprint', function() {
                window.close();
              });
            });
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
    
    toast({
      title: "Printanje",
      description: "Dijalog za printanje je otvoren.",
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
          onSelectPatient={handleSelectPatient}
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
              saveStatus={saveStatus}
              lastSaved={lastSaved}
              isSubmitting={isFinalizingReport}
              onSave={handleSaveReport}
              onPrint={generatePDF}
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
              reportCode={savedReport?.reportCode || reportCode}
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
              {isFinalizingReport ? (
                <Spinner className="mr-2 h-4 w-4" />
              ) : null}
              Sačuvaj kao nacrt
            </Button>
            <Button
              onClick={() => handleFinalizeReport(true)}
              className="bg-emerald-600 hover:bg-emerald-700"
              disabled={isFinalizingReport}
            >
              {isFinalizingReport ? (
                <Spinner className="mr-2 h-4 w-4" />
              ) : null}
              Finaliziraj nalaz
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
