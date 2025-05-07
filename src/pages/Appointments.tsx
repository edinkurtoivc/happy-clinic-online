
import { useState, useEffect } from "react";
import Header from "@/components/layout/Header";
import AppointmentsList from "@/components/appointments/AppointmentsList";
import AppointmentForm from "@/components/appointments/AppointmentForm";
import type { Appointment } from "@/types/medical-report";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import dataStorageService from "@/services/DataStorageService";

export default function Appointments() {
  const [isCreating, setIsCreating] = useState(false);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const { toast } = useToast();
  
  // Učitaj termine pri inicijalnom renderiranju
  useEffect(() => {
    loadAppointments();
  }, []);
  
  const loadAppointments = async () => {
    try {
      const loadedAppointments = await dataStorageService.getAppointments();
      setAppointments(loadedAppointments);
      console.log("[Appointments] Loaded appointments:", loadedAppointments);
    } catch (error) {
      console.error("[Appointments] Error loading appointments:", error);
      toast({
        title: "Greška",
        description: "Dogodila se greška pri učitavanju termina.",
        variant: "destructive"
      });
    }
  };

  const handleSaveAppointment = async (appointment: Appointment) => {
    try {
      // Ensure appointment has status field set
      if (!appointment.status) {
        appointment.status = 'scheduled';
      }
      
      // Add scheduledAt timestamp if not present
      if (!appointment.scheduledAt) {
        appointment.scheduledAt = new Date().toISOString();
      }
      
      const success = await dataStorageService.addAppointment(appointment);
      
      if (success) {
        // Refresh appointments list
        await loadAppointments();
        
        toast({
          title: "Termin spremljen",
          description: "Termin je uspješno spremljen"
        });
        
        console.log("[Appointments] Saved new appointment:", appointment);
        setIsCreating(false); // Close the form after successful save
      } else {
        throw new Error("Nije moguće spremiti termin");
      }
    } catch (error) {
      console.error("[Appointments] Error saving appointment:", error);
      toast({
        title: "Greška",
        description: "Dogodila se greška pri spremanju termina.",
        variant: "destructive"
      });
    }
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
            <AppointmentsList 
              initialAppointments={appointments} 
            />
          </div>
        )}
      </div>
    </div>
  );
}
