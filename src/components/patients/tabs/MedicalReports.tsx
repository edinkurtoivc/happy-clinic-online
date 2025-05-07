
import { FileText, Eye, Edit, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import type { MedicalReport, MedicalReportFile } from "@/types/medical-report";
import { getPatientReports } from "@/utils/fileSystemUtils";
import { Spinner } from "@/components/ui/spinner";
import MedicalReportForm from "@/components/medical-reports/MedicalReportForm";
import MedicalReportPreview from "@/components/medical-reports/MedicalReportPreview";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

interface MedicalReportsProps {
  patient: { id: number };
}

export function MedicalReports({ patient }: MedicalReportsProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [reports, setReports] = useState<MedicalReport[]>([]);
  const [fileSystemReports, setFileSystemReports] = useState<MedicalReportFile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedReport, setSelectedReport] = useState<MedicalReport | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editFormOpen, setEditFormOpen] = useState(false);
  
  useEffect(() => {
    const loadReports = async () => {
      setIsLoading(true);
      try {
        // Get stored reports from localStorage
        const savedReports = localStorage.getItem('medicalReports');
        if (savedReports) {
          const allReports: MedicalReport[] = JSON.parse(savedReports);
          // Filter reports to only show those for the current patient
          const patientReports = allReports.filter(report => 
            report.patientId === patient.id.toString()
          );
          setReports(patientReports);
        }
        
        // Get reports from file system if Electron is available
        if (window.electron?.isElectron) {
          const basePath = localStorage.getItem('dataFolderPath');
          if (basePath) {
            console.log("[MedicalReports] Loading reports from filesystem for patient:", patient.id);
            const fsReports = await getPatientReports(basePath, patient.id.toString());
            console.log("[MedicalReports] Loaded reports from filesystem:", fsReports);
            setFileSystemReports(fsReports);
          }
        }
      } catch (error) {
        console.error("[MedicalReports] Error loading reports:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (patient?.id) {
      loadReports();
    }
  }, [patient?.id]);
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('bs-BA', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Combine file system reports with localStorage reports
  const allReports = [
    ...fileSystemReports.map(report => ({
      id: report.id,
      appointmentType: report.appointmentType || "Medicinski nalaz",
      doctor: report.doctor,
      date: report.date,
      verified: report.verified,
      report: report.report,
      therapy: report.therapy,
      notes: report.notes || "",
      patientId: report.patientId
    })),
    ...reports.map(report => ({
      id: report.id,
      appointmentType: report.appointmentType || "Medicinski nalaz",
      doctor: report.doctorInfo?.fullName || "Doktor",
      date: report.date,
      verified: report.verificationStatus === 'verified',
      report: report.report,
      therapy: report.therapy,
      notes: report.notes || "",
      patientId: report.patientId
    }))
  ];

  // Remove duplicates (prioritize filesystem reports)
  const uniqueReports = Array.from(
    new Map(allReports.map(report => [report.id, report])).values()
  );
  
  const displayReports = uniqueReports.filter(report => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      (report.appointmentType?.toLowerCase().includes(searchLower) || 
      report.doctor?.toLowerCase().includes(searchLower) ||
      formatDate(report.date).includes(searchTerm))
    );
  });

  // Sort by date descending (newest first)
  displayReports.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const handleView = (report: any) => {
    setSelectedReport(report);
    setViewDialogOpen(true);
  };

  const handleEdit = (report: any) => {
    setSelectedReport(report);
    setEditFormOpen(true);
  };

  const handlePrint = (reportId: string) => {
    // Make sure to pass the patient ID when navigating to print a report
    navigate(`/medical-reports?reportId=${reportId}&mode=print&patientId=${patient.id}`);
  };

  const handleSaveReport = (updatedReport: Partial<MedicalReport>) => {
    if (!selectedReport || !updatedReport) return;
    
    try {
      // Get existing reports
      const savedReports = localStorage.getItem('medicalReports');
      if (savedReports) {
        const allReports: MedicalReport[] = JSON.parse(savedReports);
        
        // Find and update the report
        const reportIndex = allReports.findIndex(r => r.id === selectedReport.id);
        
        if (reportIndex >= 0) {
          // Update existing report
          allReports[reportIndex] = {
            ...allReports[reportIndex],
            ...updatedReport,
            updatedAt: new Date().toISOString()
          };
        }
        
        // Save back to localStorage
        localStorage.setItem('medicalReports', JSON.stringify(allReports));
        
        // Update state
        setReports(prevReports => {
          const updated = [...prevReports];
          const index = updated.findIndex(r => r.id === selectedReport.id);
          if (index >= 0) {
            updated[index] = { ...updated[index], ...updatedReport };
          }
          return updated;
        });
        
        toast({
          title: "Uspješno",
          description: "Nalaz je uspješno ažuriran",
        });
        
        // Close the form
        setEditFormOpen(false);
      }
    } catch (error) {
      console.error("[MedicalReports] Error saving report:", error);
      toast({
        title: "Greška",
        description: "Došlo je do greške prilikom ažuriranja nalaza",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between mb-4">
        <h3 className="text-lg font-medium">Medicinski nalazi</h3>
        <Button 
          size="sm" 
          variant="outline"
          onClick={() => navigate(`/medical-reports?patientId=${patient.id}`)}
        >
          Novi nalaz
        </Button>
      </div>

      <div className="relative flex-grow max-w-sm mb-4">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Pretraži nalaze..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-8"
        />
      </div>
      
      {isLoading ? (
        <div className="text-center p-4">
          <Spinner className="mx-auto" />
          <p className="text-muted-foreground mt-2">Učitavanje nalaza...</p>
        </div>
      ) : displayReports.length > 0 ? (
        <div className="space-y-3">
          {displayReports.map((report) => (
            <div key={report.id} className="rounded-md border p-4 hover:bg-muted/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="mr-3 rounded-full bg-clinic-50 p-2 text-clinic-700">
                    <FileText className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-medium">{report.appointmentType}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(report.date)} · {report.doctor}
                    </p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleView(report)}
                  >
                    <Eye className="h-4 w-4 mr-1" /> Pregledaj
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleEdit(report)}
                  >
                    <Edit className="h-4 w-4 mr-1" /> Uredi
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handlePrint(report.id)}
                    disabled={!report.verified}
                    title={!report.verified ? "Samo verifikovani nalazi se mogu printati" : ""}
                  >
                    <Printer className="h-4 w-4 mr-1" /> Printaj
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center p-6 border rounded-md">
          <p className="text-muted-foreground">
            {searchTerm ? "Nema pronađenih nalaza." : "Nema medicinskih nalaza za ovog pacijenta."}
          </p>
          <Button 
            variant="outline" 
            size="sm" 
            className="mt-2"
            onClick={() => navigate(`/medical-reports?patientId=${patient.id}`)}
          >
            Kreiraj novi nalaz
          </Button>
        </div>
      )}

      {/* Dialog for viewing reports */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-4xl h-[80vh]">
          <DialogHeader>
            <DialogTitle>Pregled nalaza</DialogTitle>
          </DialogHeader>
          {selectedReport && (
            <div className="overflow-auto h-full py-4">
              <MedicalReportPreview
                patient={{ name: `Pacijent ${patient.id}` }}
                reportText={selectedReport.report}
                therapyText={selectedReport.therapy}
                showSignature={true}
                showStamp={selectedReport.verified}
                appointmentType={selectedReport.appointmentType}
                doctorName={selectedReport.doctor}
                onPrint={() => handlePrint(selectedReport.id)}
                onSave={() => {}}
                isSaved={true}
                verificationStatus={selectedReport.verified ? 'verified' : 'unverified'}
              />
              <div className="flex justify-end space-x-2 mt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setViewDialogOpen(false)}
                >
                  Zatvori
                </Button>
                <Button 
                  onClick={() => {
                    setViewDialogOpen(false);
                    handleEdit(selectedReport);
                  }}
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Uredi nalaz
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Form */}
      {selectedReport && (
        <MedicalReportForm
          open={editFormOpen}
          onOpenChange={setEditFormOpen}
          onSubmit={handleSaveReport}
          defaultValues={{
            id: selectedReport.id,
            patientId: selectedReport.patientId,
            report: selectedReport.report,
            therapy: selectedReport.therapy,
            notes: selectedReport.notes,
            appointmentType: selectedReport.appointmentType,
            status: 'final',
            visitType: 'followup',
          }}
          examinationTypes={[
            { id: 1, name: selectedReport.appointmentType, duration: "30min", price: "100" }
          ]}
        />
      )}
    </div>
  );
}
