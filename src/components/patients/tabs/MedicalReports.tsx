
import { FileText, Eye, Edit, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { MedicalReport } from "@/types/medical-report";

interface MedicalReportsProps {
  reports: Array<{
    id: string;
    patientId: number;
    date: string;
    title: string;
    doctor: string;
    status: string;
  }>;
}

export function MedicalReports({ reports }: MedicalReportsProps) {
  const navigate = useNavigate();
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('bs-BA', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const handleView = (reportId: string) => {
    navigate(`/medical-reports?reportId=${reportId}&mode=view`);
  };

  const handleEdit = (reportId: string) => {
    navigate(`/medical-reports?reportId=${reportId}&mode=edit`);
  };

  const handlePrint = (reportId: string) => {
    navigate(`/medical-reports?reportId=${reportId}&mode=print`);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between mb-4">
        <h3 className="text-lg font-medium">Medicinski nalazi</h3>
        <Button 
          size="sm" 
          variant="outline"
          onClick={() => navigate('/medical-reports')}
        >
          Novi nalaz
        </Button>
      </div>
      
      {reports.length > 0 ? (
        <div className="space-y-3">
          {reports.map((report) => (
            <div key={report.id} className="rounded-md border p-4 hover:bg-muted/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="mr-3 rounded-full bg-clinic-50 p-2 text-clinic-700">
                    <FileText className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-medium">{report.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(report.date)} · {report.doctor}
                    </p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleView(report.id)}
                  >
                    <Eye className="h-4 w-4 mr-1" /> Pregledaj
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleEdit(report.id)}
                  >
                    <Edit className="h-4 w-4 mr-1" /> Uredi
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handlePrint(report.id)}
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
          <p className="text-muted-foreground">Nema medicinskih nalaza za ovog pacijenta.</p>
          <Button 
            variant="outline" 
            size="sm" 
            className="mt-2"
            onClick={() => navigate('/medical-reports')}
          >
            Kreiraj novi nalaz
          </Button>
        </div>
      )}
    </div>
  );
}
