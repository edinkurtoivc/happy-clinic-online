import { useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import useExaminationTypes from "@/hooks/useExaminationTypes";
import dataStorageService from "@/services/DataStorageService";
import type { Appointment } from "@/types/medical-report";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
interface RescheduleAppointmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointment: Appointment;
  onConfirm: (updated: Appointment, reason: string) => void;
}

export default function RescheduleAppointmentDialog({ open, onOpenChange, appointment, onConfirm }: RescheduleAppointmentDialogProps) {
  const [date, setDate] = useState<Date | undefined>(appointment ? new Date(`${appointment.date}T00:00:00`) : new Date());
  const [time, setTime] = useState<string>(appointment?.time || "");
  const { examTypes } = useExaminationTypes();
  const currentExam = useMemo(() => examTypes.find(t => t.name === appointment.examinationType), [examTypes, appointment.examinationType]);
  const [occupied, setOccupied] = useState<string[]>([]);
  const [reason, setReason] = useState("");
  const { toast } = useToast();
  const parseDurationToMinutes = (dur?: string) => {
    if (!dur) return 30;
    const n = parseInt((dur.match(/\d+/)?.[0] || '30'), 10);
    return isNaN(n) || n <= 0 ? 30 : n;
  };

  const generateSlots = () => {
    const step = parseDurationToMinutes(currentExam?.duration);
    const slots: string[] = [];
    for (let h = 8; h <= 20; h++) {
      for (let m = 0; m < 60; m += step) {
        const hh = h.toString().padStart(2, '0');
        const mm = m.toString().padStart(2, '0');
        slots.push(`${hh}:${mm}`);
      }
    }
    return slots;
  };

  useEffect(() => {
    const load = async () => {
      if (!appointment?.doctorId || !date) return setOccupied([]);
      const all = await dataStorageService.getAppointments();
      const day = format(date, 'yyyy-MM-dd');
      const taken = all.filter(a => a.id !== appointment.id && a.doctorId === appointment.doctorId && a.date === day && a.status !== 'cancelled').map(a => a.time);
      setOccupied(taken);
    };
    load();
  }, [appointment?.doctorId, appointment?.id, date]);

const handleConfirm = () => {
  if (!date || !time) return;
  if (!reason.trim()) {
    toast({ title: "Greška", description: "Molimo unesite razlog pomjeranja", variant: "destructive" });
    return;
  }
  const updated: Appointment = {
    ...appointment,
    date: format(date, 'yyyy-MM-dd'),
    time,
    status: 'scheduled',
  };
  onConfirm(updated, reason);
};

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Pomjeri termin</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Datum</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "dd.MM.yyyy.") : <span>Odaberi datum</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar mode="single" selected={date} onSelect={setDate} initialFocus className="p-3 pointer-events-auto" />
              </PopoverContent>
            </Popover>
          </div>
          <div className="space-y-2">
            <Label>Vrijeme</Label>
            <Select value={time} onValueChange={setTime}>
              <SelectTrigger>
                <SelectValue placeholder="Odaberi vrijeme" />
              </SelectTrigger>
              <SelectContent>
                {generateSlots().map(t => (
                  <SelectItem key={t} value={t} disabled={occupied.includes(t)}>
                    {t} {occupied.includes(t) ? '— zauzeto' : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Razlog pomjeranja</Label>
            <Textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Unesite razlog pomjeranja termina"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Odustani</Button>
          <Button onClick={handleConfirm} disabled={!date || !time}>Sačuvaj</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
