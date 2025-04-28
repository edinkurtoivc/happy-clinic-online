import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import CancelAppointmentDialog from "./CancelAppointmentDialog";
import type { Appointment } from "@/types/medical-report";

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

export default function AppointmentsList() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [appointments, setAppointments] = useState<AppointmentWithCancellation[]>(mockAppointments);
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentWithCancellation | null>(null);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const formatDisplayDate = (dateStr: string) => {
    try {
      return format(new Date(dateStr), "dd.MM.yyyy.");
    } catch (e) {
      return dateStr;
    }
  };

  const filteredAppointments = selectedDate
    ? appointments.filter(
        (appointment) => appointment.date === format(selectedDate, "yyyy-MM-dd")
      )
    : appointments;
    
  const handleStatusChange = (appointmentId: string, newStatus: 'scheduled' | 'completed' | 'cancelled', reason?: string) => {
    setAppointments(prevAppointments => 
      prevAppointments.map(appointment => 
        appointment.id === appointmentId 
          ? { 
              ...appointment, 
              status: newStatus,
              ...(reason && { cancellationReason: reason })
            } 
          : appointment
      )
    );

    if (newStatus === 'cancelled') {
      toast({
        title: "Termin otkazan",
        description: "Termin je uspješno otkazan"
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
  
  const handleCreateReport = (appointment: Appointment) => {
    navigate('/medical-reports', { 
      state: { 
        patientId: appointment.patientId,
        patientName: appointment.patientName, 
        appointmentId: appointment.id,
        examinationType: appointment.examinationType
      } 
    });
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Završen</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-200">Otkazan</Badge>;
      default:
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">Zakazan</Badge>;
    }
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
                {filteredAppointments.length > 0 ? (
                  filteredAppointments.map((appointment) => (
                    <tr 
                      key={appointment.id} 
                      className={`hover:bg-muted/50 ${
                        appointment.status === 'completed' ? 'bg-green-50' : 
                        appointment.status === 'cancelled' ? 'bg-red-50' : ''
                      }`}
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
                              onClick={() => handleCreateReport(appointment)}
                            >
                              Kreiraj nalaz
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-red-600"
                              onClick={() => handleCancelClick(appointment)}
                            >
                              Otkaži
                            </Button>
                          </>
                        )}
                        {appointment.status === 'completed' && appointment.reportId && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => navigate(`/medical-reports/${appointment.reportId}`)}
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
                      Nema zakazanih termina za ovaj datum
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </Card>

      {selectedAppointment && (
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
      )}
    </div>
  );
}
