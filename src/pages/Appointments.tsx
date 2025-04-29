
import { useState, useEffect } from "react";
import Header from "@/components/layout/Header";
import AppointmentsList from "@/components/appointments/AppointmentsList";
import AppointmentForm from "@/components/appointments/AppointmentForm";
import type { Appointment } from "@/types/medical-report";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";

export default function Appointments() {
  const [isCreating, setIsCreating] = useState(false);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const { toast } = useToast();
  
  // Učitaj termine pri inicijalnom renderiranju
  useEffect(() => {
    const savedAppointments = localStorage.getItem('appointments');
    if (savedAppointments) {
      try {
        const parsed = JSON.parse(savedAppointments);
        setAppointments(parsed);
        console.log("[Appointments] Loaded appointments:", parsed);
      } catch (error) {
        console.error("[Appointments] Error parsing appointments:", error);
      }
    }
  }, []);

  const handleSaveAppointment = (appointment: Appointment) => {
    const newAppointments = [...appointments, appointment];
    setAppointments(newAppointments);
    
    // Spremi termine u localStorage
    localStorage.setItem('appointments', JSON.stringify(newAppointments));
    
    toast({
      title: "Termin spremljen",
      description: "Termin je uspješno spremljen"
    });
    
    console.log("[Appointments] Saved new appointment:", appointment);
    console.log("[Appointments] All appointments:", newAppointments);
  };
  
  return (
    <div className="flex h-full flex-col">
      <Header title="Termini" />
      <div className="page-container">
        {isCreating ? (
          <AppointmentForm 
            onCancel={() => setIsCreating(false)}
            onSave={handleSaveAppointment}
          />
        ) : (
          <div className="mb-4">
            <Button onClick={() => setIsCreating(true)}>Zakaži</Button>
            <AppointmentsList initialAppointments={appointments} />
          </div>
        )}
      </div>
    </div>
  );
}
