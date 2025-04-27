
export interface Patient {
  id: number;
  name: string;
  dob: string;
  jmbg: string;
  phone: string;
  address?: string;
  email?: string;
  gender?: 'M' | 'F';
}

export interface PatientHistory {
  id: number;
  patientId: number;
  date: string;
  type: string;
  doctor: string;
  reportId?: string;
}

export interface ReportVersion {
  id: string;
  reportId: string;
  content: string;
  therapy: string;
  notes?: string;
  createdAt: string;
  createdBy: string;
  status: 'draft' | 'final';
}

export interface AuditLog {
  id: number;
  action: 'create' | 'update' | 'view';
  entityType: 'patient' | 'report' | 'appointment';
  entityId: string | number;
  performedBy: string;
  performedAt: string;
  details: string;
}
