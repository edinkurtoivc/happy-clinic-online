
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { AuditLog } from "@/types/patient";

interface AuditLogProps {
  auditLogs: AuditLog[];
}

export function AuditLogTab({ auditLogs }: AuditLogProps) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Audit Log</h3>
        <div className="flex space-x-2">
          <Input placeholder="Search activities..." className="w-48" />
          <Button size="sm" variant="outline">Filter</Button>
        </div>
      </div>
      
      <div className="rounded-md border">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="px-4 py-2 text-left">Date & Time</th>
              <th className="px-4 py-2 text-left">Action</th>
              <th className="px-4 py-2 text-left">Performed By</th>
              <th className="px-4 py-2 text-left">Details</th>
            </tr>
          </thead>
          <tbody>
            {auditLogs.map((log) => (
              <tr key={log.id} className="border-b hover:bg-muted/50">
                <td className="px-4 py-2">{new Date(log.performedAt).toLocaleString()}</td>
                <td className="px-4 py-2 capitalize">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    log.action === 'create' ? 'bg-green-100 text-green-800' : 
                    log.action === 'update' ? 'bg-blue-100 text-blue-800' : 
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {log.action}
                  </span>
                </td>
                <td className="px-4 py-2">{log.performedBy}</td>
                <td className="px-4 py-2">{log.details}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
