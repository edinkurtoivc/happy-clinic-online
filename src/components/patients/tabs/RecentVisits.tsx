
import { Calendar, File } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { PatientHistory } from "@/types/patient";

interface RecentVisitsProps {
  patientHistory: PatientHistory[];
  setIsScheduling: (value: boolean) => void;
}

export function RecentVisits({ patientHistory, setIsScheduling }: RecentVisitsProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('bs-BA', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
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
        {patientHistory.slice(0, 3).map((record) => (
          <div key={record.id} className="rounded-md border p-3 hover:bg-muted/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="mr-3 rounded-full bg-clinic-50 p-2 text-clinic-700">
                  {record.type.includes("General") ? (
                    <File className="h-4 w-4" />
                  ) : (
                    <Calendar className="h-4 w-4" />
                  )}
                </div>
                <div>
                  <p className="font-medium">{record.type}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(record.date)} · {record.doctor}
                  </p>
                </div>
              </div>
              <button className="text-sm font-medium text-clinic-600 hover:text-clinic-800">
                Pregledaj
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
