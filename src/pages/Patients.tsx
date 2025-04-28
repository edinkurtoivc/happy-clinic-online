
import { useState, useEffect } from "react";
import Header from "@/components/layout/Header";
import PatientsList from "@/components/patients/PatientsList";
import PatientCard from "@/components/patients/PatientCard";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import type { Patient } from "@/types/patient";

export default function Patients() {
  const { toast } = useToast();
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [patients, setPatients] = useState<Patient[]>([]);
  
  // Učitaj pacijente iz localStorage
  useEffect(() => {
    try {
      const savedPatients = localStorage.getItem('patients');
      if (savedPatients) {
        const parsedPatients = JSON.parse(savedPatients);
        console.log("[Patients] Loaded patients from localStorage:", parsedPatients);
      }
    } catch (error) {
      console.error("[Patients] Error checking patients:", error);
    }
  }, []);
  
  const handleUpdatePatient = (updatedPatient: Patient) => {
    try {
      // Učitaj trenutne pacijente
      const savedPatients = localStorage.getItem('patients') || '[]';
      const currentPatients = JSON.parse(savedPatients);
      
      // Pronađi i ažuriraj pacijenta
      const updatedPatients = currentPatients.map((p: Patient) => 
        p.id === updatedPatient.id ? updatedPatient : p
      );
      
      // Spremi ažurirane pacijente
      localStorage.setItem('patients', JSON.stringify(updatedPatients));
      setSelectedPatient(updatedPatient);
      
      toast({
        title: "Uspješno",
        description: "Informacije o pacijentu su uspješno ažurirane.",
      });
      
      // Evidencija događaja
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
  
  return (
    <div className="flex h-full flex-col">
      <Header 
        title="Pacijenti"
        action={{
          label: "Dodaj pacijenta",
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
              Nazad na listu
            </Button>
            <div className="p-4 border rounded-md">
              <h2 className="text-lg font-semibold mb-4">Dodaj novog pacijenta</h2>
              <p className="text-muted-foreground">Ovdje bi bio formular za kreiranje pacijenta</p>
            </div>
          </div>
        ) : (
          <PatientsList onSelectPatient={setSelectedPatient} />
        )}
      </div>
    </div>
  );
}
