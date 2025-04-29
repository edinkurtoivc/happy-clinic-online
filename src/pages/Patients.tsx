
import { useState, useEffect } from "react";
import Header from "@/components/layout/Header";
import PatientsList from "@/components/patients/PatientsList";
import PatientCard from "@/components/patients/PatientCard";
import PatientForm from "@/components/patients/PatientForm";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import type { Patient } from "@/types/patient";

export default function Patients() {
  const { toast } = useToast();
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [patients, setPatients] = useState<Patient[]>([]);
  
  // Load patients from localStorage
  useEffect(() => {
    try {
      const savedPatients = localStorage.getItem('patients');
      if (savedPatients) {
        const parsedPatients = JSON.parse(savedPatients);
        setPatients(parsedPatients);
        console.log("[Patients] Loaded patients from localStorage:", parsedPatients);
      } else {
        // If no patients in localStorage, initialize with empty array
        localStorage.setItem('patients', JSON.stringify([]));
      }
    } catch (error) {
      console.error("[Patients] Error loading patients:", error);
    }
  }, []);
  
  const handleUpdatePatient = (updatedPatient: Patient) => {
    try {
      // Load current patients
      const savedPatients = localStorage.getItem('patients') || '[]';
      const currentPatients = JSON.parse(savedPatients);
      
      // Find and update patient
      const updatedPatients = currentPatients.map((p: Patient) => 
        p.id === updatedPatient.id ? updatedPatient : p
      );
      
      // Save updated patients
      localStorage.setItem('patients', JSON.stringify(updatedPatients));
      setPatients(updatedPatients);
      setSelectedPatient(updatedPatient);
      
      toast({
        title: "Uspješno",
        description: "Informacije o pacijentu su uspješno ažurirane.",
      });
      
      // Log event
      console.log('[Patients] Patient updated:', {
        patientId: updatedPatient.id,
        updatedBy: 'Trenutni korisnik', 
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("[Patients] Error updating patient:", error);
      toast({
        title: "Greška",
        description: "Dogodila se greška pri ažuriranju pacijenta.",
        variant: "destructive"
      });
    }
  };
  
  const handleAddPatient = (newPatient: Omit<Patient, "id">) => {
    try {
      // Generate a new ID for the patient
      const id = Date.now();
      const patientWithId = { ...newPatient, id };
      
      // Get current patients from localStorage
      const savedPatients = localStorage.getItem('patients') || '[]';
      const currentPatients = JSON.parse(savedPatients);
      
      // Add new patient to the list
      const updatedPatients = [...currentPatients, patientWithId];
      
      // Save updated patients list
      localStorage.setItem('patients', JSON.stringify(updatedPatients));
      setPatients(updatedPatients);
      setIsCreating(false);
      
      toast({
        title: "Uspješno",
        description: `Pacijent ${patientWithId.name} je uspješno dodan.`,
      });
      
      // Log event
      console.log('[Patients] Patient added:', {
        patientId: patientWithId.id,
        name: patientWithId.name,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("[Patients] Error adding patient:", error);
      toast({
        title: "Greška",
        description: "Dogodila se greška pri dodavanju pacijenta.",
        variant: "destructive"
      });
    }
  };
  
  return (
    <div className="flex h-full flex-col">
      <Header title="Pacijenti" />
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
              Nazad na listu
            </Button>
            <PatientForm onSubmit={handleAddPatient} onCancel={() => setIsCreating(false)} />
          </div>
        ) : (
          <div>
            <Button onClick={() => setIsCreating(true)} className="mb-4">
              Dodaj pacijenta
            </Button>
            <PatientsList patients={patients} onSelectPatient={setSelectedPatient} />
          </div>
        )}
      </div>
    </div>
  );
}
