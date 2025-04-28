
import * as z from "zod";

export const userFormSchema = z.object({
  email: z.string().email("Unesite ispravnu email adresu"),
  firstName: z.string().min(2, "Ime mora sadržavati najmanje 2 karaktera"),
  lastName: z.string().min(2, "Prezime mora sadržavati najmanje 2 karaktera"),
  role: z.enum(['admin', 'doctor', 'nurse'], {
    errorMap: () => ({ message: "Odaberite ulogu" }),
  }),
  specialization: z.string().optional(),
  phone: z.string().optional(),
});

export type UserFormData = z.infer<typeof userFormSchema>;
