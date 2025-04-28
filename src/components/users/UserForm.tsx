
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import type { User, UserRole } from "@/types/user";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const userFormSchema = z.object({
  email: z.string().email("Unesite ispravnu email adresu"),
  firstName: z.string().min(2, "Ime mora sadržavati najmanje 2 karaktera"),
  lastName: z.string().min(2, "Prezime mora sadržavati najmanje 2 karaktera"),
  role: z.enum(['admin', 'doctor', 'nurse'], {
    errorMap: () => ({ message: "Odaberite ulogu" }),
  }),
  specialization: z.string().optional(),
  phone: z.string().optional(),
});

type UserFormData = z.infer<typeof userFormSchema>;

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

  const form = useForm<UserFormData>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      email: defaultValues?.email || "",
      firstName: defaultValues?.firstName || "",
      lastName: defaultValues?.lastName || "",
      role: (defaultValues?.role as 'admin' | 'doctor' | 'nurse') || "doctor",
      specialization: defaultValues?.specialization || "",
      phone: defaultValues?.phone || "",
    },
  });

  const handleSubmit = async (data: UserFormData) => {
    try {
      setIsLoading(true);
      await onSubmit(data);
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
      <DialogContent className="sm:max-w-[425px]">
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
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="korisnik@primjer.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ime</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Prezime</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Uloga</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Odaberite ulogu" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="admin">Administrator</SelectItem>
                      <SelectItem value="doctor">Doktor</SelectItem>
                      <SelectItem value="nurse">Medicinski tehničar</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="specialization"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Specijalizacija</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Broj telefona</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
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
