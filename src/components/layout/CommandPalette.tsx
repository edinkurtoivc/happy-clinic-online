import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from "@/components/ui/command";
import dataStorageService from "@/services/DataStorageService";

export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [patients, setPatients] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    const load = async () => {
      const [pts, apts] = await Promise.all([
        dataStorageService.getPatients(),
        dataStorageService.getAppointments(),
      ]);
      setPatients(pts || []);
      setAppointments(apts || []);
    };
    if (open) load();
  }, [open]);

  const gotoPatient = (id: string | number) => {
    setOpen(false);
    navigate(`/chart/${id}`);
  };
  const gotoAppointments = () => {
    setOpen(false);
    navigate(`/appointments`);
  };

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Pretraga: pacijenti, termini…" />
      <CommandList>
        <CommandEmpty>Nema rezultata</CommandEmpty>
        <CommandGroup heading="Pacijenti">
          {patients.slice(0, 8).map((p) => (
            <CommandItem key={p.id} onSelect={() => gotoPatient(p.id)}>
              {p.firstName} {p.lastName} — {p.jmbg}
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Termini">
          {appointments.slice(0, 8).map((a) => (
            <CommandItem key={a.id} onSelect={gotoAppointments}>
              {a.date} {a.time} — {a.patientName} ({a.doctorName})
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
