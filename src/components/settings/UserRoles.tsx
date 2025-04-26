
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useToast } from "@/components/ui/use-toast";

// Define the role schema
const roleSchema = z.object({
  id: z.number().optional(),
  name: z.string().min(1, "Naziv role je obavezan"),
  description: z.string().min(1, "Opis role je obavezan"),
  permissions: z.string().min(1, "Permisije su obavezne"),
});

type RoleFormData = z.infer<typeof roleSchema>;

export default function UserRoles() {
  const { toast } = useToast();
  const [roles, setRoles] = useState([
    { id: 1, name: "Administrator", description: "Potpuni pristup", permissions: "Sve" },
    { id: 2, name: "Doktor", description: "Pregledi i nalazi", permissions: "Pacijenti, Nalazi" },
    { id: 3, name: "Medicinska sestra", description: "Rezervacije termina", permissions: "Pacijenti, Termini" },
  ]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentRole, setCurrentRole] = useState<RoleFormData | null>(null);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');

  const form = useForm<RoleFormData>({
    resolver: zodResolver(roleSchema),
    defaultValues: {
      name: "",
      description: "",
      permissions: "",
    },
  });

  const openAddDialog = () => {
    form.reset({
      name: "",
      description: "",
      permissions: "",
    });
    setFormMode('create');
    setIsDialogOpen(true);
  };

  const openEditDialog = (role: any) => {
    setCurrentRole(role);
    form.reset({
      id: role.id,
      name: role.name,
      description: role.description,
      permissions: role.permissions,
    });
    setFormMode('edit');
    setIsDialogOpen(true);
  };

  const handleSubmit = (data: RoleFormData) => {
    if (formMode === 'create') {
      const newRole = {
        ...data,
        id: Math.max(0, ...roles.map(r => r.id)) + 1,
      };
      setRoles([...roles, newRole]);
      toast({
        title: "Rola kreirana",
        description: "Nova rola je uspješno dodana",
      });
    } else {
      setRoles(roles.map(r => (r.id === data.id ? { ...data } : r)));
      toast({
        title: "Rola ažurirana",
        description: "Rola je uspješno ažurirana",
      });
    }
    setIsDialogOpen(false);
  };

  const handleDelete = (id: number) => {
    setRoles(roles.filter(r => r.id !== id));
    toast({
      title: "Rola obrisana",
      description: "Rola je uspješno obrisana",
    });
  };

  return (
    <>
      <Card className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-semibold">Role i permisije</h2>
            <p className="text-muted-foreground">
              Upravljajte rolama i permisijama za korisnike sistema
            </p>
          </div>
          <Button onClick={openAddDialog}>Dodaj rolu</Button>
        </div>
        
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Naziv role</TableHead>
              <TableHead>Opis</TableHead>
              <TableHead>Permisije</TableHead>
              <TableHead className="text-right">Akcije</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {roles.map((role) => (
              <TableRow key={role.id}>
                <TableCell className="font-medium">{role.name}</TableCell>
                <TableCell>{role.description}</TableCell>
                <TableCell>{role.permissions}</TableCell>
                <TableCell className="text-right space-x-2">
                  <Button variant="ghost" size="sm" onClick={() => openEditDialog(role)}>Uredi</Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-red-500"
                    onClick={() => handleDelete(role.id)}
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
              {formMode === 'create' ? 'Dodaj novu rolu' : 'Uredi rolu'}
            </DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Naziv role</FormLabel>
                    <FormControl>
                      <Input placeholder="npr. Administrator" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Opis</FormLabel>
                    <FormControl>
                      <Input placeholder="npr. Potpuni pristup" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="permissions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Permisije</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="npr. Pacijenti, Nalazi, Termini" 
                        className="resize-none"
                        {...field} 
                      />
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
