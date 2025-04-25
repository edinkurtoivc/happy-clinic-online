
import { useState } from "react";
import Header from "@/components/layout/Header";
import PatientsList from "@/components/patients/PatientsList";
import PatientCard from "@/components/patients/PatientCard";

interface Patient {
  id: number;
  name: string;
  dob: string;
  jmbg: string;
  phone: string;
}

export default function Patients() {
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  
  return (
    <div className="flex h-full flex-col">
      <Header 
        title="Patients"
        action={{
          label: "Add Patient",
          onClick: () => console.log("Add patient clicked"),
        }}
      />
      <div className="page-container">
        {selectedPatient ? (
          <PatientCard 
            patient={selectedPatient}
            onClose={() => setSelectedPatient(null)}
          />
        ) : (
          <PatientsList onSelectPatient={setSelectedPatient} />
        )}
      </div>
    </div>
  );
}
