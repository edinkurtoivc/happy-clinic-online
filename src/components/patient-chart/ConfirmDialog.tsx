import * as React from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ConfirmDialogProps {
  open: boolean;
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  destructive?: boolean;
  requireReason?: boolean;
  onClose: () => void;
  onConfirm: (reason?: string) => void;
}

export function ConfirmDialog({
  open,
  title = "Potvrda",
  description = "Da li ste sigurni?",
  confirmText = "Potvrdi",
  cancelText = "Odustani",
  destructive = false,
  requireReason = false,
  onClose,
  onConfirm,
}: ConfirmDialogProps) {
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
        {requireReason && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Razlog (opcionalno)</label>
            <input className="w-full rounded-md border bg-background px-3 py-2 text-sm" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Upišite razlog" />
          </div>
        )}
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">{cancelText}</Button>
          </DialogClose>
          <Button variant={destructive ? "destructive" : "default"} onClick={() => onConfirm(reason.trim() || undefined)}>
            {confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
