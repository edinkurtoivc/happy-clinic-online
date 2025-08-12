import { useState, useEffect } from "react";
import Header from "@/components/layout/Header";
import AppointmentsList from "@/components/appointments/AppointmentsList";
import AppointmentForm from "@/components/appointments/AppointmentForm";
import CalendarView from "@/components/appointments/CalendarView";
import type { Appointment } from "@/types/medical-report";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import dataStorageService from "@/services/DataStorageService";

export default function Appointments() {
  const [isCreating, setIsCreating] = useState(false);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>("list");
  const { toast } = useToast();
  
  // Učitaj termine pri inicijalnom renderiranju
  useEffect(() => {
    loadAppointments();
  }, []);
  
const loadAppointments = async () => {
  try {
    setIsLoading(true);
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
  } finally {
    setIsLoading(false);
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
  
  const filteredAppointments = appointments.filter(appointment => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      appointment.patientName.toLowerCase().includes(searchLower) ||
      appointment.doctorName.toLowerCase().includes(searchLower) ||
      appointment.date.includes(searchTerm) ||
      appointment.examinationType.toLowerCase().includes(searchLower) ||
      appointment.status.toLowerCase().includes(searchLower)
    );
  });
  
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
            <div className="flex justify-between mb-4 items-center">
              <h3 className="text-lg font-medium">Pregled termina</h3>
              <div className="flex items-center gap-2">
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                >
                  Lista
                </Button>
                <Button
                  variant={viewMode === 'calendar' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('calendar')}
                >
                  Kalendar
                </Button>
                <Button onClick={() => setIsCreating(true)}>Zakaži</Button>
              </div>
            </div>

            <div className="relative flex-grow max-w-sm mb-4">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Pretraži termine..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            {viewMode === 'calendar' ? (
              <CalendarView appointments={filteredAppointments} onUpdated={loadAppointments} />
            ) : (
              <AppointmentsList 
                initialAppointments={filteredAppointments}
                isLoading={isLoading}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
