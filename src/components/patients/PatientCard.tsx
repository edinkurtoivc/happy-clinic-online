
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { X } from "lucide-react";
import AppointmentForm from "@/components/appointments/AppointmentForm";
import { PatientOverview } from "./tabs/PatientOverview";
import { MedicalReports } from "./tabs/MedicalReports";
import { PatientHistory } from "./tabs/PatientHistory";
import { AuditLogTab } from "./tabs/AuditLog";
import type { Patient, PatientHistory as PatientHistoryType, AuditLog } from "@/types/patient";

interface PatientCardProps {
  patient: Patient;
  onClose: () => void;
  onUpdate?: (updatedPatient: Patient) => void;
}

export default function PatientCard({ patient, onClose, onUpdate }: PatientCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedPatient, setEditedPatient] = useState<Patient>({...patient});
  const [activeTab, setActiveTab] = useState("overview");
  const [isScheduling, setIsScheduling] = useState(false);
  
  // Mock data for patient history
  const patientHistory: PatientHistoryType[] = [
    { id: 1, patientId: patient.id, date: "2023-10-15", type: "General Checkup", doctor: "Dr. Marija Popović" },
    { id: 2, patientId: patient.id, date: "2023-08-22", type: "Blood Test", doctor: "Dr. Petar Petrović" },
    { id: 3, patientId: patient.id, date: "2023-05-07", type: "Vaccination", doctor: "Dr. Marija Popović" },
  ];
  
  // Mock data for medical reports
  const reports = [
    { id: "rep1", patientId: patient.id, date: "2023-10-15", title: "General Checkup", doctor: "Dr. Marija Popović", status: "final" },
    { id: "rep2", patientId: patient.id, date: "2023-08-22", title: "Blood Test Results", doctor: "Dr. Petar Petrović", status: "final" },
  ];
  
  // Mock data for audit log
  const auditLogs: AuditLog[] = [
    { id: 1, action: "view", entityType: "patient", entityId: patient.id, performedBy: "Dr. Smith", performedAt: "2023-10-16T10:30:00", details: "Viewed patient profile" },
    { id: 2, action: "update", entityType: "patient", entityId: patient.id, performedBy: "Dr. Smith", performedAt: "2023-10-15T14:45:00", details: "Updated contact information" },
    { id: 3, action: "create", entityType: "report", entityId: "rep1", performedBy: "Dr. Popović", performedAt: "2023-10-15T11:20:00", details: "Created medical report" },
  ];

  if (isScheduling) {
    return (
      <div className="w-full">
        <div className="mb-4">
          <Button variant="outline" onClick={() => setIsScheduling(false)}>
            ← Back to Patient
          </Button>
        </div>
        <AppointmentForm 
          onCancel={() => setIsScheduling(false)} 
          preselectedPatient={patient}
        />
      </div>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-xl font-bold text-clinic-800">Patient Record</CardTitle>
        <Button variant="outline" onClick={onClose}>
          <X className="h-4 w-4 mr-1" /> Back to List
        </Button>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="reports">Medical Reports</TabsTrigger>
            <TabsTrigger value="history">Visit History</TabsTrigger>
            <TabsTrigger value="audit">Audit Log</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview">
            <PatientOverview 
              patient={patient}
              editedPatient={editedPatient}
              isEditing={isEditing}
              setIsEditing={setIsEditing}
              setEditedPatient={setEditedPatient}
              onUpdate={onUpdate}
              setIsScheduling={setIsScheduling}
              patientHistory={patientHistory}
            />
          </TabsContent>
          
          <TabsContent value="reports">
            <MedicalReports reports={reports} />
          </TabsContent>
          
          <TabsContent value="history">
            <PatientHistory patientHistory={patientHistory} />
          </TabsContent>
          
          <TabsContent value="audit">
            <AuditLogTab auditLogs={auditLogs} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
