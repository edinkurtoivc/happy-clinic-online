
export interface MedicalReport {
  id: string;
  patientId: string;
  doctorId: string;
  date: string;
  report: string;
  therapy: string;
  notes?: string;
  status: 'draft' | 'final';
  patientInfo: {
    fullName: string;
    birthDate: string;
    gender: 'M' | 'F';
    jmbg: string;
  };
}
