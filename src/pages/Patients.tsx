
import { useState } from "react";
import Header from "@/components/layout/Header";
import PatientsList from "@/components/patients/PatientsList";
import PatientCard from "@/components/patients/PatientCard";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import type { Patient } from "@/types/patient";

export default function Patients() {
  const { toast } = useToast();
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  
  const handleUpdatePatient = (updatedPatient: Patient) => {
    // In a real app, this would update the patient in the database
    setSelectedPatient(updatedPatient);
    
    toast({
      title: "Success",
      description: "Patient information updated successfully.",
    });
    
    // Log the audit event
    console.log('Audit log: Patient information updated', {
      patientId: updatedPatient.id,
      updatedBy: 'Current User', // In a real app, get from auth context
      timestamp: new Date().toISOString(),
    });
  };
  
  return (
    <div className="flex h-full flex-col">
      <Header 
        title="Patients"
        action={{
          label: "Add Patient",
          onClick: () => setIsCreating(true),
        }}
      />
      <div className="page-container">
        {selectedPatient ? (
          <PatientCard 
            patient={selectedPatient}
            onClose={() => setSelectedPatient(null)}
            onUpdate={handleUpdatePatient}
          />
        ) : isCreating ? (
          <div>
            <Button variant="outline" onClick={() => setIsCreating(false)} className="mb-4">
              Back to list
            </Button>
            <div className="p-4 border rounded-md">
              <h2 className="text-lg font-semibold mb-4">Add New Patient</h2>
              <p className="text-muted-foreground">Patient creation form would go here</p>
            </div>
          </div>
        ) : (
          <PatientsList onSelectPatient={setSelectedPatient} />
        )}
      </div>
    </div>
  );
}
