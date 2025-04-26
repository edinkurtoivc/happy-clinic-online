
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useToast } from "@/components/ui/use-toast";

const examTypeSchema = z.object({
  id: z.number().optional(),
  name: z.string().min(1, "Naziv vrste pregleda je obavezan"),
  duration: z.string().min(1, "Trajanje pregleda je obavezno"),
  price: z.string().optional(),
});

type ExamTypeFormData = z.infer<typeof examTypeSchema>;

export default function ExaminationTypes() {
  const { toast } = useToast();
  const [examTypes, setExamTypes] = useState([
    { id: 1, name: "Opći pregled", duration: "30 min", price: "50 KM" },
    { id: 2, name: "Kardiološki pregled", duration: "45 min", price: "80 KM" },
    { id: 3, name: "Dermatološki pregled", duration: "30 min", price: "60 KM" },
    { id: 4, name: "Neurološki pregled", duration: "60 min", price: "100 KM" },
  ]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');

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

  const openEditDialog = (examType: any) => {
    form.reset({
      id: examType.id,
      name: examType.name,
      duration: examType.duration,
      price: examType.price,
    });
    setFormMode('edit');
    setIsDialogOpen(true);
  };

  const handleSubmit = (data: ExamTypeFormData) => {
    if (formMode === 'create') {
      const newExamType = {
        ...data,
        id: Math.max(0, ...examTypes.map(e => e.id)) + 1,
      };
      setExamTypes([...examTypes, newExamType]);
      toast({
        title: "Vrsta pregleda kreirana",
        description: "Nova vrsta pregleda je uspješno dodana",
      });
    } else {
      setExamTypes(examTypes.map(e => (e.id === data.id ? { ...data } : e)));
      toast({
        title: "Vrsta pregleda ažurirana",
        description: "Vrsta pregleda je uspješno ažurirana",
      });
    }
    setIsDialogOpen(false);
  };

  const handleDelete = (id: number) => {
    setExamTypes(examTypes.filter(e => e.id !== id));
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
          <Button onClick={openAddDialog}>Dodaj vrstu pregleda</Button>
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
