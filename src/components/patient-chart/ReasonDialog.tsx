import * as React from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface ReasonDialogProps {
  open: boolean;
  title?: string;
  description?: string;
  label?: string;
  confirmText?: string;
  cancelText?: string;
  onClose: () => void;
  onConfirm: (reason: string) => void;
}

export function ReasonDialog({
  open,
  title = "Unesite razlog",
  description = "Zbog evidencije, molimo upišite razlog ove akcije.",
  label = "Razlog",
  confirmText = "Potvrdi",
  cancelText = "Odustani",
  onClose,
  onConfirm,
}: ReasonDialogProps) {
  const [reason, setReason] = React.useState("");

  React.useEffect(() => {
    if (!open) setReason("");
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">{label}</label>
          <Textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Npr. duplikat zapisa / greška u unosu" />
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">{cancelText}</Button>
          </DialogClose>
          <Button
            onClick={() => {
              if (!reason.trim()) return;
              onConfirm(reason.trim());
            }}
          >
            {confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
