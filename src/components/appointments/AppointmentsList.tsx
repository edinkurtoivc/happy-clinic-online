import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import CancelAppointmentDialog from "./CancelAppointmentDialog";
import RescheduleAppointmentDialog from "./RescheduleAppointmentDialog";
import type { Appointment } from "@/types/medical-report";
import dataStorageService from "@/services/DataStorageService";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
interface AppointmentWithCancellation extends Appointment {
  cancellationReason?: string;
}

const mockAppointments: AppointmentWithCancellation[] = [
  { 
    id: "1", 
    patientId: "1", 
    patientName: "Ana Marković", 
    date: "2025-04-25", 
    time: "09:00", 
    doctorId: "1", 
    doctorName: "Dr. Marija Popović", 
    examinationType: "Internistički pregled", 
    status: "scheduled" 
  },
  { 
    id: "2", 
    patientId: "2", 
    patientName: "Nikola Jovanović", 
    date: "2025-04-25", 
    time: "10:30", 
    doctorId: "2", 
    doctorName: "Dr. Petar Petrović", 
    examinationType: "Dermatologija", 
    status: "scheduled" 
  },
  { 
    id: "3", 
    patientId: "3", 
    patientName: "Milica Petrović", 
    date: "2025-04-25", 
    time: "12:15", 
    doctorId: "1", 
    doctorName: "Dr. Marija Popović", 
    examinationType: "Kardiologija", 
    status: "completed",
    reportId: "report-123456" 
  },
  { 
    id: "4", 
    patientId: "4", 
    patientName: "Stefan Nikolić", 
    date: "2025-04-26", 
    time: "09:30", 
    doctorId: "2", 
    doctorName: "Dr. Petar Petrović", 
    examinationType: "Internistički pregled", 
    status: "scheduled" 
  },
  { 
    id: "5", 
    patientId: "5", 
    patientName: "Jelena Stojanović", 
    date: "2025-04-26", 
    time: "11:00", 
    doctorId: "1", 
    doctorName: "Dr. Marija Popović", 
    examinationType: "Neurologija", 
    status: "cancelled" 
  },
];

interface AppointmentsListProps {
  initialAppointments?: Appointment[];
  isLoading?: boolean;
}

export default function AppointmentsList({ initialAppointments, isLoading }: AppointmentsListProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [appointments, setAppointments] = useState<AppointmentWithCancellation[]>([]);
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentWithCancellation | null>(null);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showRescheduleDialog, setShowRescheduleDialog] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'all' | 'scheduled' | 'completed' | 'cancelled'>('all');
  const [doctorFilter, setDoctorFilter] = useState<string>('all');
  const navigate = useNavigate();
  const { toast } = useToast();
  const doctorOptions = Array.from(new Set(appointments.map(a => a.doctorName))).sort();

  useEffect(() => {
    if (initialAppointments && initialAppointments.length > 0) {
      console.log("[AppointmentsList] Using provided appointments:", initialAppointments);
      setAppointments(initialAppointments as AppointmentWithCancellation[]);
    } else {
      const savedAppointments = localStorage.getItem('appointments');
      if (savedAppointments) {
        try {
          const parsed = JSON.parse(savedAppointments);
          setAppointments(parsed);
          console.log("[AppointmentsList] Loaded appointments from localStorage:", parsed);
        } catch (error) {
          console.error("[AppointmentsList] Error parsing appointments:", error);
          setAppointments(mockAppointments);
        }
      } else {
        console.log("[AppointmentsList] Using mock appointments");
        setAppointments(mockAppointments);
      }
    }
  }, [initialAppointments]);

  const formatDisplayDate = (dateStr: string) => {
    try {
      return format(new Date(dateStr), "dd.MM.yyyy.");
    } catch (e) {
      return dateStr;
    }
  };

const filteredAppointments = (
  selectedDate
    ? appointments.filter((appointment) => appointment.date === format(selectedDate, "yyyy-MM-dd"))
    : appointments
).filter((a) => (statusFilter === 'all' || a.status === statusFilter) && (doctorFilter === 'all' || a.doctorName === doctorFilter));
    
  const handleStatusChange = async (appointmentId: string, newStatus: 'scheduled' | 'completed' | 'cancelled', reason?: string) => {
    try {
      const updatedAppointments = appointments.map(appointment => 
        appointment.id === appointmentId 
          ? { 
              ...appointment, 
              status: newStatus,
              ...(reason && { cancellationReason: reason }),
              ...(newStatus === 'completed' ? { completedAt: new Date().toISOString() } : {}),
              ...(newStatus === 'cancelled' ? { cancelledAt: new Date().toISOString() } : {})
            } 
          : appointment
      );

      setAppointments(updatedAppointments);
      
      // Save to localStorage for compatibility
      localStorage.setItem('appointments', JSON.stringify(updatedAppointments));
      
      // Save to DataStorageService
      const appointmentToUpdate = updatedAppointments.find(a => a.id === appointmentId);
      if (appointmentToUpdate) {
        await dataStorageService.updateAppointment(appointmentToUpdate);
        console.log("[AppointmentsList] Appointment updated:", appointmentToUpdate);
      }
      
      // Audit log
      try {
        const currentUser = localStorage.getItem('currentUser');
        const performedBy = currentUser ? `${JSON.parse(currentUser).firstName} ${JSON.parse(currentUser).lastName}` : 'unknown';
        const logs = JSON.parse(localStorage.getItem('auditLogs') || '[]');
        logs.push({
          id: Date.now(),
          action: newStatus === 'cancelled' ? 'update' : (newStatus === 'completed' ? 'update' : 'update'),
          entityType: 'appointment',
          entityId: appointmentId,
          performedBy,
          performedAt: new Date().toISOString(),
          details: newStatus === 'cancelled' ? `Termin otkazan. Razlog: ${reason || ''}` : newStatus === 'completed' ? 'Termin obilježen kao završen' : 'Termin ažuriran',
          appointmentId: appointmentId,
        });
        localStorage.setItem('auditLogs', JSON.stringify(logs));
      } catch {}
      
      let toastMessage = "";
      if (newStatus === 'cancelled') {
        toastMessage = "Termin je uspješno otkazan";
      } else if (newStatus === 'completed') {
        toastMessage = "Termin je uspješno označen kao završen";
      }
      
      toast({
        title: newStatus === 'cancelled' ? "Termin otkazan" : newStatus === 'completed' ? "Termin završen" : "Termin ažuriran",
        description: toastMessage
      });
    } catch (error) {
      console.error("[AppointmentsList] Error updating appointment status:", error);
      toast({
        title: "Greška",
        description: "Dogodila se greška pri ažuriranju termina",
        variant: "destructive"
      });
    }
  };

  const handleCancelClick = (appointment: AppointmentWithCancellation) => {
    setSelectedAppointment(appointment);
    setShowCancelDialog(true);
  };

  const handleCancelConfirm = (reason: string) => {
    if (selectedAppointment) {
      handleStatusChange(selectedAppointment.id, 'cancelled', reason);
    }
    setShowCancelDialog(false);
    setSelectedAppointment(null);
  };
  
  const handleRescheduleConfirm = async (updated: Appointment, reason: string) => {
    try {
      const updatedList = appointments.map(a => a.id === updated.id ? { ...a, date: updated.date, time: updated.time, status: updated.status } : a);
      setAppointments(updatedList);
      localStorage.setItem('appointments', JSON.stringify(updatedList));
      await dataStorageService.updateAppointment(updated);

      // Audit
      try {
        const currentUser = localStorage.getItem('currentUser');
        const performedBy = currentUser ? `${JSON.parse(currentUser).firstName} ${JSON.parse(currentUser).lastName}` : 'unknown';
        const logs = JSON.parse(localStorage.getItem('auditLogs') || '[]');
        logs.push({
          id: Date.now(),
          action: 'update',
          entityType: 'appointment',
          entityId: updated.id,
          performedBy,
          performedAt: new Date().toISOString(),
          details: `Termin pomjeren na ${updated.date} ${updated.time}. Razlog: ${reason}`,
          appointmentId: updated.id,
        });
        localStorage.setItem('auditLogs', JSON.stringify(logs));
      } catch {}

      toast({ title: 'Termin pomjeren', description: 'Termin je uspješno pomjeren' });
    } catch (e) {
      console.error('[AppointmentsList] Reschedule failed', e);
      toast({ title: 'Greška', description: 'Nije moguće pomjeriti termin', variant: 'destructive' });
    } finally {
      setShowRescheduleDialog(false);
      setSelectedAppointment(null);
    }
  };
  const handleCreateReport = (appointment: Appointment) => {
    navigate('/medical-reports', { 
      state: { 
        patientId: appointment.patientId,
        patientName: appointment.patientName, 
        appointmentId: appointment.id,
        examinationType: appointment.examinationType,
        doctorId: appointment.doctorId,
        doctorName: appointment.doctorName
      } 
    });
  };

  const handleAppointmentClick = (appointment: Appointment) => {
    if (appointment.status === 'scheduled') {
      // Direct navigation to medical reports creation when clicking on a scheduled appointment
      handleCreateReport(appointment);
    } else if (appointment.status === 'completed' && appointment.reportId) {
      navigate(`/medical-reports/${appointment.reportId}`);
    }
  };

const getStatusBadge = (status: string) => {
  switch(status) {
    case 'completed':
      return <Badge variant="secondary">Završen</Badge>;
    case 'cancelled':
      return <Badge variant="destructive">Otkazan</Badge>;
    default:
      return <Badge variant="default">Zakazan</Badge>;
  }
};

  const handleCompleteAppointment = async (appointment: Appointment, e: React.MouseEvent) => {
    e.stopPropagation();
    await handleStatusChange(appointment.id, 'completed');
    // After marking as completed, navigate to create a medical report
    handleCreateReport(appointment);
  };

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card className="md:col-span-1">
        <div className="p-4">
          <h3 className="mb-2 font-medium">Odaberite datum</h3>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            className="rounded border p-3 pointer-events-auto"
          />
        </div>
      </Card>

      <Card className="md:col-span-2">
        <div className="p-4">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-medium">
              Termini za {selectedDate ? formatDisplayDate(format(selectedDate, "yyyy-MM-dd")) : "Svi datumi"}
            </h3>
          </div>

          <div className="mb-4 flex flex-wrap gap-2 items-center">
            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as 'all' | 'scheduled' | 'completed' | 'cancelled')}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Svi statusi</SelectItem>
                <SelectItem value="scheduled">Zakazani</SelectItem>
                <SelectItem value="completed">Završeni</SelectItem>
                <SelectItem value="cancelled">Otkazani</SelectItem>
              </SelectContent>
            </Select>

            <Select value={doctorFilter} onValueChange={(v) => setDoctorFilter(v)}>
              <SelectTrigger className="w-[220px]">
                <SelectValue placeholder="Doktor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Svi doktori</SelectItem>
                {doctorOptions.map((name) => (
                  <SelectItem key={name} value={name}>{name}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="ml-auto flex items-center gap-2 text-xs text-muted-foreground">
              <Badge variant="default">Zakazan</Badge>
              <Badge variant="secondary">Završen</Badge>
              <Badge variant="destructive">Otkazan</Badge>
            </div>
          </div>

          <div className="rounded-md border">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-muted">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Vrijeme</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Pacijent</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Vrsta pregleda</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Doktor</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Status</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">Akcije</th>
                </tr>
              </thead>
              <tbody className="divide-y bg-white">
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, idx) => (
                    <tr key={`skeleton-${idx}`}>
                      <td className="px-4 py-3"><Skeleton className="h-4 w-16" /></td>
                      <td className="px-4 py-3"><Skeleton className="h-4 w-40" /></td>
                      <td className="px-4 py-3"><Skeleton className="h-4 w-36" /></td>
                      <td className="px-4 py-3"><Skeleton className="h-4 w-32" /></td>
                      <td className="px-4 py-3"><Skeleton className="h-5 w-20" /></td>
                      <td className="px-4 py-3 text-right"><Skeleton className="h-8 w-48 ml-auto" /></td>
                    </tr>
                  ))
                ) : filteredAppointments.length > 0 ? (
                  filteredAppointments.map((appointment) => (
                    <tr 
                      key={appointment.id} 
                      className={`hover:bg-muted/50 ${
                        appointment.status === 'completed' ? 'bg-green-50' : 
                        appointment.status === 'cancelled' ? 'bg-red-50' : ''
                      } ${
                        appointment.status === 'scheduled' ? 'cursor-pointer' : ''
                      }`}
                      onClick={() => handleAppointmentClick(appointment)}
                    >
                      <td className="px-4 py-3 text-sm">{appointment.time}</td>
                      <td className="px-4 py-3 text-sm font-medium">
                        {appointment.patientName}
                        {appointment.cancellationReason && (
                          <div className="text-xs text-red-600 mt-1">
                            Razlog otkazivanja: {appointment.cancellationReason}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm">{appointment.examinationType}</td>
                      <td className="px-4 py-3 text-sm">{appointment.doctorName}</td>
                      <td className="px-4 py-3 text-sm">
                        {getStatusBadge(appointment.status)}
                      </td>
                      <td className="px-4 py-3 text-right space-x-2">
                        {appointment.status === 'scheduled' && (
                          <>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCreateReport(appointment)
                              }}
                            >
                              Kreiraj nalaz
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-green-600"
                              onClick={(e) => handleCompleteAppointment(appointment, e)}
                            >
                              Završi termin
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedAppointment(appointment);
                                setShowRescheduleDialog(true);
                              }}
                            >
                              Pomjeri
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-red-600"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCancelClick(appointment);
                              }}
                            >
                              Otkaži
                            </Button>
                          </>
                        )}
                        {appointment.status === 'completed' && appointment.reportId && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/medical-reports/${appointment.reportId}`);
                            }}
                          >
                            Pregled nalaza
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                      Nema zakazanih termina za odabrane kriterije
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </Card>

      {selectedAppointment && (
        <>
          <CancelAppointmentDialog
            isOpen={showCancelDialog}
            onClose={() => {
              setShowCancelDialog(false);
              setSelectedAppointment(null);
            }}
            onConfirm={handleCancelConfirm}
            appointmentDate={format(new Date(selectedAppointment.date), "dd.MM.yyyy.")}
            patientName={selectedAppointment.patientName}
          />

          <RescheduleAppointmentDialog
            open={showRescheduleDialog}
            onOpenChange={(open) => {
              setShowRescheduleDialog(open);
              if (!open) setSelectedAppointment(null);
            }}
            appointment={selectedAppointment}
            onConfirm={handleRescheduleConfirm}
          />
        </>
      )}
    </div>
  );
}
