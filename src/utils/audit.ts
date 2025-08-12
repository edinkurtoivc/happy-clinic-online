import type { AuditLog } from "@/types/patient";
import { logAction } from "@/utils/fileSystemUtils";

export const addAuditLog = async (partial: Partial<AuditLog>) => {
  const entry: AuditLog = {
    id: Date.now(),
    action: (partial.action as AuditLog["action"]) || "view",
    entityType: (partial.entityType as AuditLog["entityType"]) || "patient",
    entityId: partial.entityId ?? "unknown",
    performedBy: partial.performedBy || "system",
    performedAt: partial.performedAt || new Date().toISOString(),
    details: partial.details || "",
    reason: partial.reason,
    reportId: partial.reportId,
    appointmentId: partial.appointmentId,
  };

  try {
    const existing = localStorage.getItem("auditLogs");
    const logs = existing ? JSON.parse(existing) : [];
    logs.push(entry);
    localStorage.setItem("auditLogs", JSON.stringify(logs));
  } catch (e) {
    console.error("[audit] Failed to write auditLogs", e);
  }

  try {
    const basePath = localStorage.getItem('dataFolderPath') || '';
    if (basePath && (window as any).electron?.isElectron) {
      await logAction(basePath, `${entry.action} ${entry.entityType} ${entry.entityId} by ${entry.performedBy}`);
    }
  } catch (e) {
    console.warn("[audit] FS logAction failed", e);
  }
};

export default addAuditLog;
