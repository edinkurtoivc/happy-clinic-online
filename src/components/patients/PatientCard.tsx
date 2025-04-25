
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Calendar, File } from "lucide-react";

interface Patient {
  id: number;
  name: string;
  dob: string;
  jmbg: string;
  phone: string;
}

interface PatientCardProps {
  patient: Patient;
  onClose: () => void;
}

export default function PatientCard({ patient, onClose }: PatientCardProps) {
  // Calculate age from date of birth
  const calculateAge = (dob: string) => {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDifference = today.getMonth() - birthDate.getMonth();
    
    if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  // Mock data for patient history
  const patientHistory = [
    { id: 1, date: "2023-10-15", type: "General Checkup", doctor: "Dr. Marija Popović" },
    { id: 2, date: "2023-08-22", type: "Blood Test", doctor: "Dr. Petar Petrović" },
    { id: 3, date: "2023-05-07", type: "Vaccination", doctor: "Dr. Marija Popović" },
  ];

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-xl font-bold text-clinic-800">Patient Record</CardTitle>
        <Button variant="outline" onClick={onClose}>
          Back to List
        </Button>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="rounded-lg border bg-white p-4">
          <div className="mb-4 flex items-center">
            <div className="mr-4 rounded-full bg-clinic-100 p-3 text-clinic-700">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-clinic-800">{patient.name}</h3>
              <p className="text-sm text-muted-foreground">
                {calculateAge(patient.dob)} years old · JMBG: {patient.jmbg}
              </p>
            </div>
          </div>
          
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Date of Birth</p>
              <p>{patient.dob}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Phone</p>
              <p>{patient.phone}</p>
            </div>
          </div>
        </div>
        
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-medium">Patient History</h3>
            <Button size="sm" variant="outline" className="text-sm">
              Schedule Appointment
            </Button>
          </div>
          
          <div className="space-y-3">
            {patientHistory.map((record) => (
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
                        {record.date} · {record.doctor}
                      </p>
                    </div>
                  </div>
                  <button className="text-sm font-medium text-clinic-600 hover:text-clinic-800">
                    View
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
