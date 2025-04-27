
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import type { Patient } from "@/types/patient";

interface AppointmentFormProps {
  onCancel: () => void;
  preselectedPatient?: Patient;
}

export default function AppointmentForm({ onCancel, preselectedPatient }: AppointmentFormProps) {
  const { toast } = useToast();
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [selectedPatientId, setSelectedPatientId] = useState<string>(
    preselectedPatient ? preselectedPatient.id.toString() : ""
  );
  
  // Mock data for doctors and patients
  const doctors = [
    { id: 1, name: "Dr. Marija Popović" },
    { id: 2, name: "Dr. Petar Petrović" },
  ];
  
  const patients = [
    { id: 1, name: "Ana Marković" },
    { id: 2, name: "Nikola Jovanović" },
    { id: 3, name: "Milica Petrović" },
    { id: 4, name: "Stefan Nikolić" },
    { id: 5, name: "Jelena Stojanović" },
  ];
  
  // Use exam types from the settings component
  const appointmentTypes = [
    { id: 1, name: "Opći pregled", duration: "30 min", price: "50 KM" },
    { id: 2, name: "Kardiološki pregled", duration: "45 min", price: "80 KM" },
    { id: 3, name: "Dermatološki pregled", duration: "30 min", price: "60 KM" },
    { id: 4, name: "Neurološki pregled", duration: "60 min", price: "100 KM" },
  ];
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Termin zakazan",
      description: "Termin je uspješno zakazan",
    });
    onCancel();
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-clinic-800">
          {preselectedPatient 
            ? `Zakaži novi termin za ${preselectedPatient.name}`
            : "Zakaži novi termin"}
        </CardTitle>
      </CardHeader>
      
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="patient">Pacijent</Label>
            <Select 
              value={selectedPatientId} 
              onValueChange={setSelectedPatientId}
              disabled={!!preselectedPatient}
            >
              <SelectTrigger id="patient">
                <SelectValue placeholder="Odaberi pacijenta" />
              </SelectTrigger>
              <SelectContent>
                {patients.map(patient => (
                  <SelectItem key={patient.id} value={patient.id.toString()}>
                    {patient.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label>Datum</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : <span>Odaberi datum</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  initialFocus
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="time">Vrijeme</Label>
            <Select>
              <SelectTrigger id="time">
                <SelectValue placeholder="Odaberi vrijeme" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="09:00">09:00</SelectItem>
                <SelectItem value="09:30">09:30</SelectItem>
                <SelectItem value="10:00">10:00</SelectItem>
                <SelectItem value="10:30">10:30</SelectItem>
                <SelectItem value="11:00">11:00</SelectItem>
                <SelectItem value="11:30">11:30</SelectItem>
                <SelectItem value="12:00">12:00</SelectItem>
                <SelectItem value="12:30">12:30</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="doctor">Doktor</Label>
            <Select>
              <SelectTrigger id="doctor">
                <SelectValue placeholder="Odaberi doktora" />
              </SelectTrigger>
              <SelectContent>
                {doctors.map(doctor => (
                  <SelectItem key={doctor.id} value={doctor.id.toString()}>
                    {doctor.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="type">Vrsta pregleda</Label>
            <Select>
              <SelectTrigger id="type">
                <SelectValue placeholder="Odaberi vrstu pregleda" />
              </SelectTrigger>
              <SelectContent>
                {appointmentTypes.map(type => (
                  <SelectItem key={type.id} value={type.id.toString()}>
                    {type.name} - {type.duration} ({type.price})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="notes">Napomena (opcionalno)</Label>
            <Input id="notes" placeholder="Unesite dodatne napomene" />
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-between">
          <Button type="button" variant="outline" onClick={onCancel}>Odustani</Button>
          <Button type="submit" className="bg-clinic-600 hover:bg-clinic-700">Zakaži termin</Button>
        </CardFooter>
      </form>
    </Card>
  );
}
