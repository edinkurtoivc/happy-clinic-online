import * as React from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";

export interface ResultPayload {
  code: string;
  value: string;
  unit?: string;
  refLow?: string;
  refHigh?: string;
  refText?: string;
  note?: string;
  abnormal?: boolean;
}

interface ResultEntryDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: ResultPayload) => void;
  defaultUnit?: string;
}

export function ResultEntryDialog({ open, onClose, onSubmit, defaultUnit }: ResultEntryDialogProps) {
  const [form, setForm] = React.useState<ResultPayload>({ code: "", value: "", unit: defaultUnit, abnormal: false });

  React.useEffect(() => {
    if (!open) {
      setForm({ code: "", value: "", unit: defaultUnit, abnormal: false });
    }
  }, [open, defaultUnit]);

  const canSubmit = form.code.trim() && form.value.trim();

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Unos rezultata</DialogTitle>
          <DialogDescription>Unesite podatke o rezultatu mjerenja/testa</DialogDescription>
        </DialogHeader>
        <div className="grid gap-3 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Šifra</label>
            <Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="npr. LOINC" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Vrijednost</label>
            <Input value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} placeholder="npr. 5.2" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Jedinica</label>
            <Input value={form.unit || ""} onChange={(e) => setForm({ ...form, unit: e.target.value || undefined })} placeholder="npr. mmol/L" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Ref. raspon (min)</label>
            <Input value={form.refLow || ""} onChange={(e) => setForm({ ...form, refLow: e.target.value || undefined })} placeholder="min" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Ref. raspon (max)</label>
            <Input value={form.refHigh || ""} onChange={(e) => setForm({ ...form, refHigh: e.target.value || undefined })} placeholder="max" />
          </div>
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium text-muted-foreground">Ref. napomena (tekstualno)</label>
            <Input value={form.refText || ""} onChange={(e) => setForm({ ...form, refText: e.target.value || undefined })} placeholder="npr. ovisi o dobi/spolu" />
          </div>
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium text-muted-foreground">Napomena</label>
            <Textarea value={form.note || ""} onChange={(e) => setForm({ ...form, note: e.target.value || undefined })} placeholder="Dodatne informacije" />
          </div>
          <div className="flex items-center gap-2 md:col-span-2">
            <Switch checked={!!form.abnormal} onCheckedChange={(v) => setForm({ ...form, abnormal: v })} />
            <span className="text-sm">Označi kao abnormalno</span>
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Odustani</Button>
          </DialogClose>
          <Button disabled={!canSubmit} onClick={() => canSubmit && onSubmit(form)}>Sačuvaj</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
