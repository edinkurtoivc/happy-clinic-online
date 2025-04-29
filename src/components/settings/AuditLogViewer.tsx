
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import HeaderWithUserMenu from "@/components/layout/HeaderWithUserMenu";
import { Button } from "@/components/ui/button";
import { Download, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";

const AuditLogViewer = () => {
  const [logs, setLogs] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    // Load logs from localStorage
    const storedLogs = localStorage.getItem("auditLogs");
    if (storedLogs) {
      try {
        const parsedLogs = JSON.parse(storedLogs);
        setLogs(parsedLogs);
      } catch (error) {
        console.error("Failed to parse audit logs:", error);
        setLogs([]);
      }
    }
  }, []);

  const clearLogs = () => {
    localStorage.setItem("auditLogs", JSON.stringify([]));
    setLogs([]);
    setIsOpen(false);
    
    toast({
      title: "Evidencija obrisana",
      description: "Evidencija aktivnosti je uspješno obrisana",
    });
    
    // Add log entry for clearing logs
    if (user) {
      const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
      const logEntry = `[${timestamp}] ${user.id} (${user.role}) obrisao evidenciju aktivnosti`;
      
      localStorage.setItem("auditLogs", JSON.stringify([logEntry]));
      setLogs([logEntry]);
    }
  };

  const downloadLogs = () => {
    const logsText = logs.join('\n');
    const blob = new Blob([logsText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    const date = new Date().toISOString().split('T')[0];
    a.download = `audit-logs-${date}.txt`;
    a.href = url;
    a.click();
    
    URL.revokeObjectURL(url);
    
    toast({
      title: "Evidencija preuzeta",
      description: "Evidencija aktivnosti je uspješno preuzeta",
    });
  };

  return (
    <div className="flex flex-col h-full">
      <HeaderWithUserMenu title="Evidencija aktivnosti" />
      <div className="page-container">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Evidencija aktivnosti korisnika</CardTitle>
              <CardDescription>Pregled svih aktivnosti korisnika sistema</CardDescription>
            </div>
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={downloadLogs}
                disabled={logs.length === 0}
              >
                <Download className="mr-2 h-4 w-4" />
                Preuzmi
              </Button>
              
              <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogTrigger asChild>
                  <Button variant="destructive" size="sm" disabled={logs.length === 0}>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Obriši sve
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Potvrda brisanja</DialogTitle>
                    <DialogDescription>
                      Da li ste sigurni da želite obrisati sve zapise o aktivnostima korisnika?
                      Ova akcija se ne može poništiti.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsOpen(false)}>Odustani</Button>
                    <Button variant="destructive" onClick={clearLogs}>Obriši sve</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            {logs.length > 0 ? (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[200px]">Vrijeme</TableHead>
                      <TableHead className="w-[150px]">Korisnik</TableHead>
                      <TableHead>Aktivnost</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {logs.map((log, index) => {
                      // Parse log entry: [timestamp] userId (role) action
                      const timestampMatch = log.match(/\[(.*?)\]/);
                      const userMatch = log.match(/\](.*?)\(/);
                      const roleMatch = log.match(/\((.*?)\)/);
                      const actionMatch = log.match(/\) (.*?)$/);
                      
                      const timestamp = timestampMatch ? timestampMatch[1] : "";
                      const userId = userMatch ? userMatch[1].trim() : "";
                      const role = roleMatch ? roleMatch[1] : "";
                      const action = actionMatch ? actionMatch[1] : "";
                      
                      return (
                        <TableRow key={index}>
                          <TableCell className="font-mono text-sm">{timestamp}</TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span>{userId}</span>
                              <span className="text-xs text-muted-foreground">({role})</span>
                            </div>
                          </TableCell>
                          <TableCell>{action}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="flex items-center justify-center h-40 text-muted-foreground">
                Nema zapisa aktivnosti
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AuditLogViewer;
