import { useMemo } from "react";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";

import interactionPlugin from "@fullcalendar/interaction";



import type { Appointment } from "@/types/medical-report";
import dataStorageService from "@/services/DataStorageService";
import { useToast } from "@/hooks/use-toast";

interface CalendarViewProps {
  appointments: Appointment[];
  onUpdated?: () => void;
}

export default function CalendarView({ appointments, onUpdated }: CalendarViewProps) {
  const { toast } = useToast();

  const events = useMemo(
    () =>
      appointments.map((a) => {
        const start = new Date(`${a.date}T${a.time}:00`);
        const end = new Date(start.getTime() + 30 * 60 * 1000); // 30min default
        return {
          id: a.id,
          title: `${a.patientName} • ${a.examinationType}`,
          start,
          end,
          editable: a.status === "scheduled",
          extendedProps: {
            status: a.status,
            appointment: a,
          },
        } as any;
      }),
    [appointments]
  );

  const eventClassNames = (arg: any) => {
    const status = arg.event.extendedProps?.status as Appointment["status"]; 
    if (status === "completed") return ["border-l-4", "border-secondary", "bg-secondary/10", "opacity-80"];
    if (status === "cancelled") return ["border-l-4", "border-destructive", "bg-destructive/10", "line-through", "opacity-60"];
    return ["border-l-4", "border-primary", "bg-primary/10"]; // scheduled
  };

  const handleEventDrop = async (info: any) => {
    try {
      const appt: Appointment = info.event.extendedProps?.appointment;
      if (!appt) return;
      if (!info.event.start) return;

      // Ask for reason to keep audit consistency
      const proceed = window.confirm("Pomjeranje termina – želite li nastaviti?");
      if (!proceed) {
        info.revert();
        return;
      }
      const reason = window.prompt("Razlog pomjeranja:");
      if (!reason) {
        info.revert();
        return;
      }

      const d = info.event.start as Date;
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const dd = String(d.getDate()).padStart(2, "0");
      const HH = String(d.getHours()).padStart(2, "0");
      const MM = String(d.getMinutes()).padStart(2, "0");

      const updated: Appointment = {
        ...appt,
        date: `${yyyy}-${mm}-${dd}`,
        time: `${HH}:${MM}`,
        status: "scheduled",
      };

      // localStorage sync for compatibility
      const current = JSON.parse(localStorage.getItem("appointments") || "[]");
      const next = current.map((x: Appointment) => (x.id === updated.id ? updated : x));
      localStorage.setItem("appointments", JSON.stringify(next));

      await dataStorageService.updateAppointment(updated);

      // Audit
      try {
        const currentUser = localStorage.getItem("currentUser");
        const performedBy = currentUser ? `${JSON.parse(currentUser).firstName} ${JSON.parse(currentUser).lastName}` : "unknown";
        const logs = JSON.parse(localStorage.getItem("auditLogs") || "[]");
        logs.push({
          id: Date.now(),
          action: "update",
          entityType: "appointment",
          entityId: updated.id,
          performedBy,
          performedAt: new Date().toISOString(),
          details: `Termin pomjeren na ${updated.date} ${updated.time}. Razlog: ${reason}`,
          appointmentId: updated.id,
        });
        localStorage.setItem("auditLogs", JSON.stringify(logs));
      } catch {}

      toast({ title: "Termin pomjeren", description: "Uspješno ste pomjerili termin." });
      onUpdated?.();
    } catch (e) {
      console.error("[CalendarView] eventDrop error", e);
      info.revert();
      toast({ title: "Greška", description: "Nije moguće pomjeriti termin.", variant: "destructive" });
    }
  };

  return (
    <div className="rounded-md border overflow-hidden">
      <FullCalendar
        plugins={[timeGridPlugin, interactionPlugin]}
        initialView="timeGridWeek"
        headerToolbar={{ left: "prev,next today", center: "title", right: "timeGridWeek,timeGridDay" }}
        slotMinTime="08:00:00"
        slotMaxTime="20:00:00"
        weekends={true}
        nowIndicator={true}
        editable={true}
        droppable={false}
        eventStartEditable={true}
        eventDurationEditable={false}
        events={events}
        eventClassNames={eventClassNames}
        eventDrop={handleEventDrop}
        height="auto"
        locale="bs"
      />
    </div>
  );
}
