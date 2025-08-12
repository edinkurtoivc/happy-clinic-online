
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { X } from "lucide-react";
import AppointmentForm from "@/components/appointments/AppointmentForm";
import { PatientOverview } from "./tabs/PatientOverview";
import { MedicalReports } from "./tabs/MedicalReports";
import { AuditLogTab } from "./tabs/AuditLog";
import { useAuth } from "@/contexts/AuthContext";
import type { Patient, PatientHistory as PatientHistoryType, AuditLog } from "@/types/patient";
import dataStorageService from "@/services/DataStorageService";
import { RecentVisits } from "./tabs/RecentVisits";

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
  const [patientHistory, setPatientHistory] = useState<PatientHistoryType[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const { user } = useAuth();
  
  // Fetch real patient history and audit logs on component mount
  useEffect(() => {
    const fetchPatientData = async () => {
      try {
        // This is a simplified example. In a real app, you would fetch from fileSystemUtils or dataStorageService
        // For demonstration, we'll use local storage as fallback
        
        // Fetch patient history (visits)
        const visits = await fetchPatientHistory(patient.id);
        setPatientHistory(visits);
        
        // Fetch audit logs for this patient
        const logs = await fetchPatientAuditLogs(patient.id);
        setAuditLogs(logs);
        
        // Log this view action with more details
        if (user) {
          logPatientView(patient.id, user.firstName + ' ' + user.lastName, patient);
        }
      } catch (error) {
        console.error("Error fetching patient data:", error);
      }
    };
    
    fetchPatientData();
  }, [patient.id, user]);
  
  // Fetch patient history from data storage
  const fetchPatientHistory = async (patientId: number): Promise<PatientHistoryType[]> => {
    try {
      // 1) Clinical observations -> history entries
      const clinical = await dataStorageService.getPatientClinicalData(String(patientId));
      const fromObs: PatientHistoryType[] = (clinical?.observations || []).map((o: any) => ({
        id: Number(o.id) || Date.now(),
        patientId,
        date: (o.resultedAt || new Date().toISOString()).slice(0,10),
        type: `Rezultat ${o.code}: ${o.value} ${o.unit || ''}`.trim(),
        doctor: '—'
      }));

      // 2) Extra history entries saved explicitly
      const extraKey = `patient-history-${patientId}`;
      const extra = JSON.parse(localStorage.getItem(extraKey) || '[]') as PatientHistoryType[];

      // Merge and sort desc
      const merged = [...fromObs, ...extra];
      return merged.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    } catch (e) {
      console.error('Error building patient history:', e);
      return [];
    }
  };
  
  // Fetch patient audit logs from data storage
  const fetchPatientAuditLogs = async (patientId: number): Promise<AuditLog[]> => {
    try {
      // In a real implementation, this would come from your data storage service
      // For now we're simulating by checking localStorage for audit logs
      const allLogs = localStorage.getItem('auditLogs');
      const logs = allLogs ? JSON.parse(allLogs) : [];
      
      // Filter logs for this specific patient
      return logs.filter(log => 
        (log.entityId === patientId && log.entityType === 'patient') ||
        (log.entityType === 'report' && log.details && log.details.includes(patient.firstName))
      );
    } catch (error) {
      console.error("Error fetching audit logs:", error);
      return [];
    }
  };
  
  // Log patient view action with more details
  const logPatientView = async (patientId: number, userName: string, patientData: Patient) => {
    try {
      const newLog: AuditLog = {
        id: Date.now(),
        action: 'view',
        entityType: 'patient',
        entityId: patientId,
        performedBy: userName,
        performedAt: new Date().toISOString(),
        details: `Pregled kartona pacijenta ${patientData.firstName} ${patientData.lastName}, JMBG: ${patientData.jmbg}`
      };
      
      // Get existing logs or initialize empty array
      const existingLogs = localStorage.getItem('auditLogs');
      const logs = existingLogs ? JSON.parse(existingLogs) : [];
      
      // Add new log
      logs.push(newLog);
      
      // Save updated logs
      localStorage.setItem('auditLogs', JSON.stringify(logs));
      
      // Update state to include this new log
      setAuditLogs(prev => [...prev, newLog]);
      
      // In a real implementation, you would use dataStorageService to persist this log
    } catch (error) {
      console.error("Error logging patient view:", error);
    }
  };

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
        <CardTitle className="text-xl font-bold text-clinic-800">Karton pacijenta</CardTitle>
        <Button variant="outline" onClick={onClose}>
          <X className="h-4 w-4 mr-1" /> Nazad na listu
        </Button>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="overview">Pregled</TabsTrigger>
            <TabsTrigger value="reports">Nalazi</TabsTrigger>
            <TabsTrigger value="audit">Evidencija aktivnosti</TabsTrigger>
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
            
            <section aria-labelledby="patient-history" className="mt-6">
              <h3 id="patient-history" className="text-lg font-semibold text-clinic-800">Historija pacijenta</h3>
              <RecentVisits 
                patientHistory={patientHistory} 
                setIsScheduling={setIsScheduling}
                patient={patient}
              />
            </section>
          </TabsContent>
          
          <TabsContent value="reports">
            <MedicalReports patient={patient} />
          </TabsContent>
          
          <TabsContent value="audit">
            <AuditLogTab auditLogs={auditLogs} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
