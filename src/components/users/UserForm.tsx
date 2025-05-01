
import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import type { User } from "@/types/user";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { userFormSchema, type UserFormData } from "@/schemas/userForm";
import { UserFormFields } from "./UserFormFields";

interface UserFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: UserFormData) => Promise<void>;
  defaultValues?: Partial<User>;
  mode: 'create' | 'edit';
}

export default function UserForm({ 
  open, 
  onOpenChange, 
  onSubmit, 
  defaultValues,
  mode 
}: UserFormProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  // Format permissions for form
  const getPermissionsObject = (permissions?: string[]) => ({
    view_reports: permissions?.includes('view_reports') || false,
    create_patients: permissions?.includes('create_patients') || false,
    delete_users: permissions?.includes('delete_users') || false,
  });
  
  const form = useForm<UserFormData>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      email: defaultValues?.email || "",
      firstName: defaultValues?.firstName || "",
      lastName: defaultValues?.lastName || "",
      role: (defaultValues?.role as 'admin' | 'doctor' | 'nurse') || "doctor",
      specialization: defaultValues?.specialization || "",
      phone: defaultValues?.phone || "",
      permissions: getPermissionsObject(defaultValues?.permissions),
    },
  });

  // Reset form when default values change
  useEffect(() => {
    if (defaultValues) {
      form.reset({
        email: defaultValues.email || "",
        firstName: defaultValues.firstName || "",
        lastName: defaultValues.lastName || "",
        role: (defaultValues.role as 'admin' | 'doctor' | 'nurse') || "doctor",
        specialization: defaultValues.specialization || "",
        phone: defaultValues.phone || "",
        permissions: getPermissionsObject(defaultValues?.permissions),
      });
    }
  }, [defaultValues, form]);

  const handleSubmit = async (data: UserFormData) => {
    try {
      setIsLoading(true);
      
      // Convert permissions object to array for API
      const formattedData = {
        ...data,
        permissionsArray: Object.entries(data.permissions)
          .filter(([_, isEnabled]) => isEnabled)
          .map(([permission]) => permission)
      };
      
      await onSubmit(formattedData as any);
      onOpenChange(false);
      form.reset();
      toast({
        title: `Korisnik ${mode === 'create' ? 'kreiran' : 'ažuriran'} uspješno`,
        description: `${data.firstName} ${data.lastName} je ${mode === 'create' ? 'dodan u' : 'ažuriran u'} sistem.`,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Greška",
        description: "Nešto je pošlo po zlu. Molimo pokušajte ponovo.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Dodaj novog korisnika' : 'Uredi korisnika'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'create' 
              ? 'Dodajte novog korisnika u sistem. Dobit će email za postavljanje lozinke.'
              : 'Ažurirajte informacije i uloge korisnika.'
            }
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <UserFormFields form={form} />
            <DialogFooter>
              <Button type="submit" disabled={isLoading}>
                {mode === 'create' ? 'Kreiraj korisnika' : 'Ažuriraj korisnika'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
