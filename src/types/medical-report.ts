
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
  doctorInfo?: {
    fullName: string;
    specialization?: string;
    signatureImage?: string;
    stampImage?: string;
  };
  signature?: boolean;
  stamp?: boolean;
  versions?: MedicalReportVersion[];
  updatedAt?: string;
  updatedBy?: string;
}

export interface MedicalReportVersion {
  id: string;
  reportId: string;
  version: number;
  report: string;
  therapy: string;
  notes?: string;
  createdAt: string;
  createdBy: string;
  status: 'draft' | 'final';
}

export interface MedicalReportAudit {
  id: string;
  reportId: string;
  action: 'created' | 'updated' | 'viewed' | 'printed';
  performedBy: string;
  performedAt: string;
  details?: string;
}
