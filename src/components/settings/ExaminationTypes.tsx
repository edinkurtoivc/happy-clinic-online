import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";
import { useSaveData } from "@/hooks/useSaveData";
import { AutoSaveIndicator } from "@/components/ui/auto-save-indicator";
import dataStorageService from "@/services/DataStorageService";
import type { ExaminationType } from "@/types/medical-report";


const examTypeSchema = z.object({
  id: z.number().optional(),
  name: z.string().min(1, "Naziv vrste pregleda je obavezan"),
  duration: z.string().min(1, "Trajanje pregleda je obavezno"),
  price: z.string().optional(),
});

type ExamTypeFormData = z.infer<typeof examTypeSchema>;

export default function ExaminationTypes() {
  const { toast } = useToast();
  const [examTypes, setExamTypes] = useState<ExaminationType[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const fileInputId = "exam-types-import";

  useEffect(() => {
    const loadTypes = async () => {
      try {
        const types = await dataStorageService.getExaminationTypes();
        if (types && Array.isArray(types)) {
          setExamTypes(types);
          console.log("[ExaminationTypes] Loaded examination types:", types);
        }
      } catch (error) {
        console.error("[ExaminationTypes] Error loading examination types:", error);
      }
    };
    loadTypes();
  }, []);

  const { isSaving, lastSaved, isOffline, forceSave, saveStatus } = useSaveData({
    data: examTypes,
    key: "examination-types",
    onSave: async (data) => {
      await dataStorageService.saveExaminationTypes(data as ExaminationType[]);
      return;
    },
    loadFromStorage: false
  });

  const saveWithVersioning = async (updated: ExaminationType[]) => {
    try {
      const history = JSON.parse(localStorage.getItem('examination-types-history') || '[]');
      history.push({ timestamp: new Date().toISOString(), types: examTypes });
      localStorage.setItem('examination-types-history', JSON.stringify(history));
    } catch {}
    setExamTypes(updated);
    await dataStorageService.saveExaminationTypes(updated);
  };

  const exportTypes = () => {
    const blob = new Blob([JSON.stringify(examTypes, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `examination-types-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importTypes = async (file: File) => {
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      const types: ExaminationType[] = parsed.types || parsed; // support {types: []} or []
      if (!Array.isArray(types)) throw new Error('Invalid format');
      await saveWithVersioning(types);
      toast({ title: 'Uvoz uspješan', description: `Uvezeno ${types.length} vrsta pregleda` });
    } catch (e) {
      toast({ title: 'Greška pri uvozu', description: 'Provjerite JSON format', variant: 'destructive' });
    }
  };

  const revertLastVersion = async () => {
    try {
      const history = JSON.parse(localStorage.getItem('examination-types-history') || '[]');
      const last = history.pop();
      if (!last) return;
      localStorage.setItem('examination-types-history', JSON.stringify(history));
      await saveWithVersioning(last.types as ExaminationType[]);
      toast({ title: 'Vrati verziju', description: 'Vraćena posljednja verzija' });
    } catch {}
  };

  const form = useForm<ExamTypeFormData>({
    resolver: zodResolver(examTypeSchema),
    defaultValues: {
      name: "",
      duration: "",
      price: "",
    },
  });

  const openAddDialog = () => {
    form.reset({
      name: "",
      duration: "",
      price: "",
    });
    setFormMode('create');
    setIsDialogOpen(true);
  };

  const openEditDialog = (examType: ExaminationType) => {
    form.reset({
      id: examType.id,
      name: examType.name,
      duration: examType.duration,
      price: examType.price,
    });
    setFormMode('edit');
    setIsDialogOpen(true);
  };

  const handleSubmit = async (data: ExamTypeFormData) => {
    if (formMode === 'create') {
      const newExamType: ExaminationType = {
        id: Math.max(0, ...examTypes.map(e => e.id)) + 1,
        name: data.name,
        duration: data.duration,
        price: data.price || "",
      };
      const updated = [...examTypes, newExamType];
      await saveWithVersioning(updated);
      toast({
        title: "Vrsta pregleda kreirana",
        description: "Nova vrsta pregleda je uspješno dodana",
      });
    } else {
      const updated = examTypes.map(e => (e.id === data.id ? {
        id: e.id,
        name: data.name,
        duration: data.duration,
        price: data.price || "",
      } as ExaminationType : e));
      await saveWithVersioning(updated);
      toast({
        title: "Vrsta pregleda ažurirana",
        description: "Vrsta pregleda je uspješno ažurirana",
      });
    }
    setIsDialogOpen(false);
  };

  const handleDelete = async (id: number) => {
    const updated = examTypes.filter(e => e.id !== id);
    await saveWithVersioning(updated);
    toast({
      title: "Vrsta pregleda obrisana",
      description: "Vrsta pregleda je uspješno obrisana",
    });
  };

  return (
    <>
      <Card className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-semibold">Vrste pregleda</h2>
            <p className="text-muted-foreground">
              Definišite vrste pregleda koje obavljate u praksi
            </p>
          </div>
          <div className="flex items-center gap-2">
            <input
              id={fileInputId}
              type="file"
              accept="application/json"
              className="hidden"
              onChange={async (e) => {
                const f = e.target.files?.[0];
                if (f) await importTypes(f);
                (e.target as HTMLInputElement).value = '';
              }}
            />
            <AutoSaveIndicator 
              status={
                isOffline ? "offline" : 
                isSaving ? "saving" : 
                saveStatus === "saved" ? "saved" : "idle"
              } 
              lastSaved={lastSaved} 
              onRetry={forceSave}
            />
            <Button variant="outline" onClick={exportTypes}>Izvezi JSON</Button>
            <Button variant="outline" onClick={() => document.getElementById(fileInputId)?.click()}>Uvezi JSON</Button>
            <Button variant="outline" onClick={revertLastVersion}>Vrati zadnju verziju</Button>
            <Button onClick={openAddDialog}>Dodaj vrstu pregleda</Button>
          </div>
        </div>
        
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Naziv</TableHead>
              <TableHead>Trajanje</TableHead>
              <TableHead>Cijena</TableHead>
              <TableHead className="text-right">Akcije</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {examTypes.map((examType) => (
              <TableRow key={examType.id}>
                <TableCell className="font-medium">{examType.name}</TableCell>
                <TableCell>{examType.duration}</TableCell>
                <TableCell>{examType.price}</TableCell>
                <TableCell className="text-right space-x-2">
                  <Button variant="ghost" size="sm" onClick={() => openEditDialog(examType)}>Uredi</Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-red-500"
                    onClick={() => handleDelete(examType.id)}
                  >
                    Obriši
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {formMode === 'create' ? 'Dodaj novu vrstu pregleda' : 'Uredi vrstu pregleda'}
            </DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Naziv</FormLabel>
                    <FormControl>
                      <Input placeholder="npr. Opći pregled" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Trajanje</FormLabel>
                    <FormControl>
                      <Input placeholder="npr. 30 min" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cijena (opciono)</FormLabel>
                    <FormControl>
                      <Input placeholder="npr. 50 KM" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Odustani
                </Button>
                <Button type="submit">
                  {formMode === 'create' ? 'Dodaj' : 'Sačuvaj'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}
