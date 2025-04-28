
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import type { Patient } from "@/types/patient";

interface PatientSelectionProps {
  selectedPatient: Patient | null;
  onSelectPatient: (patient: Patient) => void;
}

const mockPatients = [
  { id: 1, name: "Ana Marković", dob: "1985-04-12", gender: "F" as const, jmbg: "1204985123456", phone: "064-123-4567" },
  { id: 2, name: "Nikola Jovanović", dob: "1976-08-30", gender: "M" as const, jmbg: "3008976123456", phone: "065-234-5678" },
  { id: 3, name: "Milica Petrović", dob: "1990-11-15", gender: "F" as const, jmbg: "1511990123456", phone: "063-345-6789" },
  { id: 4, name: "Stefan Nikolić", dob: "1982-02-22", gender: "M" as const, jmbg: "2202982123456", phone: "062-456-7890" },
  { id: 5, name: "Jelena Stojanović", dob: "1995-07-08", gender: "F" as const, jmbg: "0807995123456", phone: "061-567-8901" },
];

export default function PatientSelection({ selectedPatient, onSelectPatient }: PatientSelectionProps) {
  const [showPatientsDropdown, setShowPatientsDropdown] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [visitType, setVisitType] = useState<string | undefined>();

  const filteredPatients = mockPatients.filter(patient => {
    const searchLower = searchTerm.toLowerCase();
    return (
      patient.name.toLowerCase().includes(searchLower) ||
      patient.jmbg.includes(searchTerm) ||
      patient.dob.includes(searchTerm)
    );
  });

  const handleSelectPatient = (patient: Patient) => {
    onSelectPatient(patient);
    setShowPatientsDropdown(false);
    setSearchTerm("");
  };

  return (
    <div className="space-y-4 mb-6">
      <div className="relative">
        <div className="w-full relative">
          <Input 
            placeholder={selectedPatient ? selectedPatient.name : "Odaberite pacijenta"}
            className="w-full border rounded-md p-4"
            onClick={() => setShowPatientsDropdown(!showPatientsDropdown)}
            readOnly
          />
          <div className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
          </div>
        </div>
        
        {showPatientsDropdown && (
          <div className="absolute z-10 w-full bg-white border rounded-md mt-1 shadow-md">
            <div className="relative m-2">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Pronađite pacijenta..." 
                className="pl-8 w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                autoFocus
              />
            </div>

            {filteredPatients.length > 0 ? (
              <>
                <div className="max-h-[300px] overflow-y-auto">
                  {filteredPatients.map(patient => (
                    <div 
                      key={patient.id} 
                      className="p-2 hover:bg-gray-100 cursor-pointer flex flex-col"
                      onClick={() => handleSelectPatient(patient)}
                    >
                      <span className="font-medium">{patient.name}</span>
                      <span className="text-sm text-muted-foreground">
                        JMBG: {patient.jmbg} · Rođen: {patient.dob}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="p-2 hover:bg-gray-100 cursor-pointer flex border-t">
                  <span className="text-emerald-600">+</span>
                  <span className="ml-2">Dodaj novog pacijenta</span>
                </div>
              </>
            ) : (
              <div className="p-4 text-center text-muted-foreground">
                {searchTerm ? "Nema pronađenih pacijenata." : "Učitavanje pacijenata..."}
              </div>
            )}
          </div>
        )}
      </div>

      {selectedPatient && (
        <div className="pt-2">
          <div className="text-sm font-medium mb-2 text-gray-600">Tip pregleda (opcionalno)</div>
          <RadioGroup
            value={visitType}
            onValueChange={setVisitType}
            className="flex space-x-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="first" id="first-visit" />
              <label htmlFor="first-visit" className="text-sm">
                Prvi pregled
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="followup" id="followup-visit" />
              <label htmlFor="followup-visit" className="text-sm">
                Kontrolni pregled
              </label>
            </div>
          </RadioGroup>
        </div>
      )}
    </div>
  );
}

