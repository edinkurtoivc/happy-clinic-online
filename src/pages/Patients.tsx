
import { useState, useEffect } from "react";
import Header from "@/components/layout/Header";
import PatientsList from "@/components/patients/PatientsList";
import PatientCard from "@/components/patients/PatientCard";
import PatientForm from "@/components/patients/PatientForm";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import type { Patient } from "@/types/patient";
import dataStorageService from "@/services/DataStorageService";

export default function Patients() {
  const { toast } = useToast();
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [patients, setPatients] = useState<Patient[]>([]);
  
  // Load patients on initial render
  useEffect(() => {
    loadPatients();
  }, []);
  
  const loadPatients = async () => {
    try {
      const loadedPatients = await dataStorageService.getPatients();
      setPatients(loadedPatients);
      console.log("[Patients] Loaded patients:", loadedPatients);
    } catch (error) {
      console.error("[Patients] Error loading patients:", error);
      toast({
        title: "Greška",
        description: "Dogodila se greška pri učitavanju pacijenata.",
        variant: "destructive"
      });
    }
  };
  
  const handleUpdatePatient = async (updatedPatient: Patient) => {
    try {
      const success = await dataStorageService.savePatient(updatedPatient);
      
      if (success) {
        // Refresh patients list
        await loadPatients();
        setSelectedPatient(updatedPatient);
        
        toast({
          title: "Uspješno",
          description: "Informacije o pacijentu su uspješno ažurirane.",
        });
        
        console.log('[Patients] Patient updated:', {
          patientId: updatedPatient.id,
          updatedBy: 'Trenutni korisnik', 
          timestamp: new Date().toISOString(),
        });
      } else {
        throw new Error("Nije moguće ažurirati pacijenta");
      }
    } catch (error) {
      console.error("[Patients] Error updating patient:", error);
      toast({
        title: "Greška",
        description: "Dogodila se greška pri ažuriranju pacijenta.",
        variant: "destructive"
      });
    }
  };
  
  const handleAddPatient = async (newPatient: Omit<Patient, "id">) => {
    try {
      // Generate a new ID for the patient
      const id = Date.now();
      const patientWithId = { ...newPatient, id };
      
      const success = await dataStorageService.savePatient(patientWithId);
      
      if (success) {
        // Refresh patients list
        await loadPatients();
        setIsCreating(false);
        
        toast({
          title: "Uspješno",
          description: `Pacijent ${patientWithId.name} je uspješno dodan.`,
        });
        
        console.log('[Patients] Patient added:', {
          patientId: patientWithId.id,
          name: patientWithId.name,
          timestamp: new Date().toISOString(),
        });
      } else {
        throw new Error("Nije moguće dodati pacijenta");
      }
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
