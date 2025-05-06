
import type { MedicalReport } from "@/types/medical-report";
import { MedicalReportFormData } from "@/components/medical-reports/MedicalReportForm";

/**
 * Creates a medical report data object from form values and default values
 */
export function createReportData(
  values: MedicalReportFormData,
  defaultValues?: Partial<MedicalReport>,
  status: "draft" | "final" = "draft"
): Partial<MedicalReport> {
  return {
    ...values,
    date: new Date().toISOString(),
    status,
    verificationStatus: status === "final" ? "pending" as const : "unverified" as const,
    patientId: defaultValues?.patientId,
    doctorId: defaultValues?.doctorId,
    patientInfo: defaultValues?.patientInfo,
    doctorInfo: defaultValues?.doctorInfo,
  };
}

/**
 * Validates if a file path is an absolute path
 */
export function isAbsolutePath(path: string): boolean {
  // Check if path starts with '/' on Unix or a drive letter followed by ':\' on Windows
  return /^(\/|[A-Za-z]:\\)/.test(path);
}

/**
 * Ensures a path has correct format for filesystem operations
 */
export function normalizePath(path: string): string {
  // Replace backslashes with forward slashes for consistency
  let normalized = path.replace(/\\/g, '/');
  
  // Remove trailing slash if present (except for root path)
  if (normalized !== '/' && normalized.endsWith('/')) {
    normalized = normalized.slice(0, -1);
  }
  
  return normalized;
}
