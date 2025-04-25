
export interface MedicalReport {
  id: string;
  patientId: string;
  doctorId: string;
  date: string;
  diagnosis: string;
  treatment: string;
  notes?: string;
  status: 'draft' | 'final';
}
