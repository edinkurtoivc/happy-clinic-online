import * as React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface SectionPdfDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (sections: string[]) => void;
  sections: { id: string; label: string }[];
}

export default function SectionPdfDialog({ open, onClose, onConfirm, sections }: SectionPdfDialogProps) {
  const [selected, setSelected] = React.useState<string[]>(sections.map(s => s.id));

  React.useEffect(() => {
    if (!open) setSelected(sections.map(s => s.id));
  }, [open, sections]);

  const toggle = (id: string) => {
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Izvoz u PDF</DialogTitle>
        </DialogHeader>
        <div className="space-y-2">
          {sections.map(s => (
            <label key={s.id} className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={selected.includes(s.id)} onChange={() => toggle(s.id)} />
              {s.label}
            </label>
          ))}
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Zatvori</Button>
          </DialogClose>
          <Button onClick={() => onConfirm(selected)}>Izvezi</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
