
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

// Mock data for patients
const mockPatients = [
  { id: 1, name: "Ana Marković", dob: "1985-04-12", jmbg: "1204985123456", phone: "064-123-4567" },
  { id: 2, name: "Nikola Jovanović", dob: "1976-08-30", jmbg: "3008976123456", phone: "065-234-5678" },
  { id: 3, name: "Milica Petrović", dob: "1990-11-15", jmbg: "1511990123456", phone: "063-345-6789" },
  { id: 4, name: "Stefan Nikolić", dob: "1982-02-22", jmbg: "2202982123456", phone: "062-456-7890" },
  { id: 5, name: "Jelena Stojanović", dob: "1995-07-08", jmbg: "0807995123456", phone: "061-567-8901" },
];

interface Patient {
  id: number;
  name: string;
  dob: string;
  jmbg: string;
  phone: string;
}

interface PatientsListProps {
  onSelectPatient: (patient: Patient) => void;
}

export default function PatientsList({ onSelectPatient }: PatientsListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [patients, setPatients] = useState<Patient[]>(mockPatients);

  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.jmbg.includes(searchTerm)
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Input
          placeholder="Search patients by name or JMBG..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <div className="rounded-md border">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-muted">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Name</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Date of Birth</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">JMBG</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Phone</th>
              <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y bg-white">
            {filteredPatients.map((patient) => (
              <tr key={patient.id} className="hover:bg-muted/50">
                <td className="px-4 py-3 text-sm font-medium">{patient.name}</td>
                <td className="px-4 py-3 text-sm">{patient.dob}</td>
                <td className="px-4 py-3 text-sm">{patient.jmbg}</td>
                <td className="px-4 py-3 text-sm">{patient.phone}</td>
                <td className="px-4 py-3 text-right">
                  <button 
                    onClick={() => onSelectPatient(patient)} 
                    className="text-sm font-medium text-clinic-600 hover:text-clinic-800"
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredPatients.length === 0 && (
          <div className="flex h-32 items-center justify-center">
            <p className="text-muted-foreground">No patients found</p>
          </div>
        )}
      </div>
    </div>
  );
}
