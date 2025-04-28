
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
    // U stvarnoj aplikaciji, ovo bi ažuriralo pacijenta u bazi podataka
    setSelectedPatient(updatedPatient);
    
    toast({
      title: "Uspješno",
      description: "Informacije o pacijentu su uspješno ažurirane.",
    });
    
    // Evidencija događaja
    console.log('Evidencija: Informacije o pacijentu su ažurirane', {
      patientId: updatedPatient.id,
      updatedBy: 'Trenutni korisnik', // U stvarnoj aplikaciji, dohvatiti iz konteksta autentifikacije
      timestamp: new Date().toISOString(),
    });
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
