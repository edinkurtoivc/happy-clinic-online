
export type UserRole = 'admin' | 'doctor' | 'nurse' | 'technician';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  specialization?: string;
  phone?: string;
  birthDate?: string;
  signatureImage?: string;
  stampImage?: string;
  active: boolean;
}
