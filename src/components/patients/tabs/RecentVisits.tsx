
import { useEffect, useState } from "react";
import { Calendar, File, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import type { PatientHistory } from "@/types/patient";
import type { MedicalReport } from "@/types/medical-report";

interface RecentVisitsProps {
  patientHistory: PatientHistory[];
  setIsScheduling: (value: boolean) => void;
}

export function RecentVisits({ patientHistory, setIsScheduling }: RecentVisitsProps) {
  const navigate = useNavigate();
  const [reports, setReports] = useState<MedicalReport[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadReports = () => {
      setIsLoading(true);
      try {
        // Get stored reports from localStorage
        const savedReports = localStorage.getItem('medicalReports');
        if (savedReports) {
          const allReports: MedicalReport[] = JSON.parse(savedReports);
          // Filter reports to only show those for the current patient
          const patientIds = patientHistory.map(record => record.patientId.toString());
          const filteredReports = allReports.filter(report => 
            patientIds.includes(report.patientId)
          );
          setReports(filteredReports);
        }
      } catch (error) {
        console.error("[RecentVisits] Error loading medical reports:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadReports();
  }, [patientHistory]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('bs-BA', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Get the most recent visits (limit to 3)
  const recentVisits = [...patientHistory].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  ).slice(0, 3);

  const handleViewReport = (reportId?: string) => {
    if (reportId) {
      navigate(`/medical-reports?reportId=${reportId}&mode=view`);
    } else {
      // If no report exists, navigate to create a new one
      navigate(`/medical-reports`);
    }
  };

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-medium">Nedavne posjete</h3>
        <Button 
          size="sm" 
          variant="outline" 
          className="text-sm"
          onClick={() => setIsScheduling(true)}
        >
          Zakaži termin
        </Button>
      </div>
      
      <div className="space-y-3">
        {isLoading ? (
          <div className="text-center py-4 text-muted-foreground">Učitavanje...</div>
        ) : recentVisits.length > 0 ? (
          recentVisits.map((record) => {
            // Find matching report if one exists
            const matchingReport = reports.find(r => r.id === record.reportId);
            
            return (
              <div key={record.id} className="rounded-md border p-3 hover:bg-muted/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="mr-3 rounded-full bg-clinic-50 p-2 text-clinic-700">
                      {record.type.includes("pregled") ? (
                        <Calendar className="h-4 w-4" />
                      ) : (
                        <File className="h-4 w-4" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{record.type}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(record.date)} · {record.doctor}
                      </p>
                    </div>
                  </div>
                  <button 
                    className="text-sm font-medium text-clinic-600 hover:text-clinic-800 flex items-center"
                    onClick={() => handleViewReport(record.reportId)}
                  >
                    <Eye className="h-4 w-4 mr-1" /> 
                    {matchingReport ? "Pregledaj" : "Kreiraj nalaz"}
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center p-4 text-muted-foreground border rounded-md">
            Nema nedavnih posjeta za ovog pacijenta.
          </div>
        )}
      </div>
    </div>
  );
}

