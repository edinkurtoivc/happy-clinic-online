
import { FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

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
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('bs-BA', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between mb-4">
        <h3 className="text-lg font-medium">Medicinski nalazi</h3>
        <Button size="sm" variant="outline">Prikaži sve</Button>
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
                  <Button variant="outline" size="sm">Pregledaj</Button>
                  <Button variant="outline" size="sm">Uredi</Button>
                  <Button variant="outline" size="sm">Printaj</Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center p-6 border rounded-md">
          <p className="text-muted-foreground">Nema medicinskih nalaza za ovog pacijenta.</p>
        </div>
      )}
    </div>
  );
}
