
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import type { Patient } from "@/types/patient";
import type { Appointment } from "@/types/medical-report";
import type { User } from "@/types/user";
import dataStorageService from "@/services/DataStorageService";

interface AppointmentFormProps {
  onCancel: () => void;
  preselectedPatient?: Patient;
  onSave?: (appointment: Appointment) => void;
}

export default function AppointmentForm({ onCancel, preselectedPatient, onSave }: AppointmentFormProps) {
  const { toast } = useToast();
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [selectedPatientId, setSelectedPatientId] = useState<string>(
    preselectedPatient ? preselectedPatient.id.toString() : ""
  );
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>("");
  const [selectedAppointmentType, setSelectedAppointmentType] = useState<string>("");
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<User[]>([]);
  const [isLoadingPatients, setIsLoadingPatients] = useState(false);
  const [isLoadingDoctors, setIsLoadingDoctors] = useState(false);

  // Fetch patients from DataStorageService
  useEffect(() => {
    const loadPatients = async () => {
      setIsLoadingPatients(true);
      try {
        const loadedPatients = await dataStorageService.getPatients();
        setPatients(loadedPatients);
        console.log("[AppointmentForm] Loaded patients:", loadedPatients);
      } catch (error) {
        console.error("[AppointmentForm] Error loading patients:", error);
        toast({
          title: "Greška",
          description: "Dogodila se greška pri učitavanju pacijenata.",
          variant: "destructive"
        });
      } finally {
        setIsLoadingPatients(false);
      }
    };

    loadPatients();
  }, [toast]);

  // Fetch doctors from DataStorageService
  useEffect(() => {
    const loadDoctors = async () => {
      setIsLoadingDoctors(true);
      try {
        const allUsers = await dataStorageService.getUsers();
        const activeDoctors = allUsers.filter(user => user.role === 'doctor' && user.active);
        setDoctors(activeDoctors);
        console.log("[AppointmentForm] Loaded doctors:", activeDoctors.length);
      } catch (error) {
        console.error("[AppointmentForm] Error loading doctors:", error);
        toast({
          title: "Greška",
          description: "Dogodila se greška pri učitavanju doktora.",
          variant: "destructive"
        });
        // Fallback to default doctors if error
        setDoctors(getDefaultDoctors());
      } finally {
        setIsLoadingDoctors(false);
      }
    };

    loadDoctors();
  }, [toast]);
  
  const getDefaultDoctors = (): User[] => {
    return [
      { 
        id: "1", 
        email: "dr.smith@klinika.com", 
        firstName: "Adnan", 
        lastName: "Hadžić",
        role: "doctor",
        specialization: "Kardiologija",
        password: "doctor123", 
        active: true 
      },
      { 
        id: "2", 
        email: "dr.jones@klinika.com", 
        firstName: "Petar", 
        lastName: "Petrović",
        role: "doctor",
        specialization: "Neurologija",
        password: "doctor123",
        active: true 
      },
    ];
  };
  
  const loadAppointmentTypes = () => {
    try {
      const savedTypes = localStorage.getItem('examinationTypes');
      if (savedTypes) {
        return JSON.parse(savedTypes);
      }
    } catch (error) {
      console.error("[AppointmentForm] Error loading examination types:", error);
    }
    
    return [
      { id: "1", name: "Internistički pregled", duration: "30 min", price: "50 KM" },
      { id: "2", name: "Kardiološki pregled", duration: "45 min", price: "80 KM" },
      { id: "3", name: "Dermatološki pregled", duration: "30 min", price: "60 KM" },
      { id: "4", name: "Neurološki pregled", duration: "60 min", price: "100 KM" },
      { id: "5", name: "Laboratorijski nalaz", duration: "20 min", price: "30 KM" },
    ];
  };
  
  const appointmentTypes = loadAppointmentTypes();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedPatientId || !date || !selectedTime || !selectedDoctorId || !selectedAppointmentType) {
      toast({
        title: "Greška pri validaciji",
        description: "Molimo popunite sva obavezna polja",
        variant: "destructive"
      });
      return;
    }
    
    const selectedPatient = patients.find(p => p.id.toString() === selectedPatientId);
    const selectedDoctor = doctors.find(d => d.id === selectedDoctorId);
    const appointmentType = appointmentTypes.find(t => t.id === selectedAppointmentType)?.name;
    
    if (!selectedPatient || !selectedDoctor || !appointmentType) {
      toast({
        title: "Greška",
        description: "Nepravilni podaci u formi",
        variant: "destructive"
      });
      return;
    }
    
    const newAppointment: Appointment = {
      id: `apt-${Date.now()}`,
      patientId: selectedPatientId,
      patientName: selectedPatient.name,
      doctorId: selectedDoctorId,
      doctorName: `${selectedDoctor.firstName} ${selectedDoctor.lastName}`,
      date: format(date!, "yyyy-MM-dd"),
      time: selectedTime,
      examinationType: appointmentType,
      status: 'scheduled',
    };
    
    console.log("[AppointmentForm] Creating new appointment:", newAppointment);
    
    if (onSave) {
      onSave(newAppointment);
    } else {
      try {
        const savedAppointments = localStorage.getItem('appointments') || '[]';
        const appointments = JSON.parse(savedAppointments);
        appointments.push(newAppointment);
        localStorage.setItem('appointments', JSON.stringify(appointments));
        
        toast({
          title: "Termin zakazan",
          description: `Termin uspješno zakazan za ${format(date!, "dd.MM.yyyy.")} u ${selectedTime}`,
        });
        
        console.log("[AppointmentForm] Saved appointment directly to localStorage");
        onCancel();
      } catch (error) {
        console.error("[AppointmentForm] Error saving appointment:", error);
        toast({
          title: "Greška",
          description: "Dogodila se greška pri spremanju termina",
          variant: "destructive"
        });
      }
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
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
                <SelectValue placeholder={isLoadingPatients ? "Učitavanje pacijenata..." : "Odaberi pacijenta"} />
              </SelectTrigger>
              <SelectContent>
                {isLoadingPatients ? (
                  <SelectItem value="loading" disabled>Učitavanje pacijenata...</SelectItem>
                ) : patients.length > 0 ? (
                  patients.map(patient => (
                    <SelectItem key={patient.id} value={patient.id.toString()}>
                      {patient.name}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="no-patients" disabled>Nema dostupnih pacijenata</SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="doctor">Doktor</Label>
            <Select onValueChange={setSelectedDoctorId}>
              <SelectTrigger id="doctor">
                <SelectValue placeholder={isLoadingDoctors ? "Učitavanje doktora..." : "Odaberi doktora"} />
              </SelectTrigger>
              <SelectContent>
                {isLoadingDoctors ? (
                  <SelectItem value="loading" disabled>Učitavanje doktora...</SelectItem>
                ) : doctors.length > 0 ? (
                  doctors.filter(d => d.role === 'doctor' && d.active).map(doctor => (
                    <SelectItem key={doctor.id} value={doctor.id}>
                      {doctor.firstName} {doctor.lastName} - {doctor.specialization || 'Opća praksa'}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="no-doctors" disabled>Nema dostupnih doktora</SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="type">Vrsta pregleda</Label>
            <Select onValueChange={setSelectedAppointmentType}>
              <SelectTrigger id="type">
                <SelectValue placeholder="Odaberi vrstu pregleda" />
              </SelectTrigger>
              <SelectContent>
                {appointmentTypes.map(type => (
                  <SelectItem key={type.id} value={type.id}>
                    {type.name} - {type.duration} ({type.price})
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
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "dd.MM.yyyy.") : <span>Odaberi datum</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
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
            <Select onValueChange={setSelectedTime}>
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
        </CardContent>
        
        <CardFooter className="flex justify-between">
          <Button type="button" variant="outline" onClick={onCancel}>
            Odustani
          </Button>
          <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700">
            Zakaži termin
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
