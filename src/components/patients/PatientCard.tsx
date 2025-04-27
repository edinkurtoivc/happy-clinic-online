
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Users, Calendar, File, Clock, Edit, Save, X, FileText } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import AppointmentForm from "@/components/appointments/AppointmentForm";
import { format } from "date-fns";
import type { Patient, PatientHistory, AuditLog } from "@/types/patient";

interface PatientCardProps {
  patient: Patient;
  onClose: () => void;
  onUpdate?: (updatedPatient: Patient) => void;
}

export default function PatientCard({ patient, onClose, onUpdate }: PatientCardProps) {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [editedPatient, setEditedPatient] = useState<Patient>({...patient});
  const [activeTab, setActiveTab] = useState("overview");
  const [isScheduling, setIsScheduling] = useState(false);
  
  // Mock data for patient history
  const patientHistory: PatientHistory[] = [
    { id: 1, patientId: patient.id, date: "2023-10-15", type: "General Checkup", doctor: "Dr. Marija Popović" },
    { id: 2, patientId: patient.id, date: "2023-08-22", type: "Blood Test", doctor: "Dr. Petar Petrović" },
    { id: 3, patientId: patient.id, date: "2023-05-07", type: "Vaccination", doctor: "Dr. Marija Popović" },
  ];
  
  // Mock data for medical reports
  const reports = [
    { id: "rep1", patientId: patient.id, date: "2023-10-15", title: "General Checkup", doctor: "Dr. Marija Popović", status: "final" },
    { id: "rep2", patientId: patient.id, date: "2023-08-22", title: "Blood Test Results", doctor: "Dr. Petar Petrović", status: "final" },
  ];
  
  // Mock data for audit log
  const auditLogs: AuditLog[] = [
    { id: 1, action: "view", entityType: "patient", entityId: patient.id, performedBy: "Dr. Smith", performedAt: "2023-10-16T10:30:00", details: "Viewed patient profile" },
    { id: 2, action: "update", entityType: "patient", entityId: patient.id, performedBy: "Dr. Smith", performedAt: "2023-10-15T14:45:00", details: "Updated contact information" },
    { id: 3, action: "create", entityType: "report", entityId: "rep1", performedBy: "Dr. Popović", performedAt: "2023-10-15T11:20:00", details: "Created medical report" },
  ];

  // Calculate age from date of birth
  const calculateAge = (dob: string) => {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDifference = today.getMonth() - birthDate.getMonth();
    
    if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  const handleSaveChanges = () => {
    if (!editedPatient.name || !editedPatient.jmbg) {
      toast({
        title: "Error",
        description: "Name and JMBG are required fields.",
        variant: "destructive",
      });
      return;
    }
    
    // Here we would normally save to database
    if (onUpdate) {
      onUpdate(editedPatient);
    }
    
    toast({
      title: "Success",
      description: "Patient information updated successfully.",
    });
    
    setIsEditing(false);
    
    // Log the audit event
    console.log('Audit log: Patient information updated', {
      patientId: patient.id,
      updatedBy: 'Current User', // In a real app, get from auth context
      timestamp: new Date().toISOString(),
    });
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd.MM.yyyy");
    } catch (e) {
      return dateString;
    }
  };

  if (isScheduling) {
    return (
      <div className="w-full">
        <div className="mb-4">
          <Button variant="outline" onClick={() => setIsScheduling(false)}>
            ← Back to Patient
          </Button>
        </div>
        <AppointmentForm 
          onCancel={() => setIsScheduling(false)} 
          preselectedPatient={patient}
        />
      </div>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-xl font-bold text-clinic-800">Patient Record</CardTitle>
        <div className="flex space-x-2">
          {isEditing ? (
            <>
              <Button variant="outline" size="sm" onClick={() => setIsEditing(false)}>
                <X className="h-4 w-4 mr-1" /> Cancel
              </Button>
              <Button size="sm" onClick={handleSaveChanges}>
                <Save className="h-4 w-4 mr-1" /> Save Changes
              </Button>
            </>
          ) : (
            <Button variant="outline" onClick={onClose}>
              Back to List
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="reports">Medical Reports</TabsTrigger>
            <TabsTrigger value="history">Visit History</TabsTrigger>
            <TabsTrigger value="audit">Audit Log</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-4">
            <div className="rounded-lg border bg-white p-4">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center">
                  <div className="mr-4 rounded-full bg-clinic-100 p-3 text-clinic-700">
                    <Users className="h-6 w-6" />
                  </div>
                  <div>
                    {isEditing ? (
                      <Input 
                        value={editedPatient.name} 
                        onChange={(e) => setEditedPatient({...editedPatient, name: e.target.value})}
                        className="font-semibold text-lg"
                      />
                    ) : (
                      <>
                        <h3 className="text-xl font-semibold text-clinic-800">{patient.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {calculateAge(patient.dob)} years old · JMBG: {patient.jmbg}
                        </p>
                      </>
                    )}
                  </div>
                </div>
                {!isEditing && (
                  <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                    <Edit className="h-4 w-4 mr-1" /> Edit Info
                  </Button>
                )}
              </div>
              
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Date of Birth</Label>
                  {isEditing ? (
                    <Input 
                      type="date" 
                      value={editedPatient.dob} 
                      onChange={(e) => setEditedPatient({...editedPatient, dob: e.target.value})}
                    />
                  ) : (
                    <p>{formatDate(patient.dob)}</p>
                  )}
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">JMBG</Label>
                  {isEditing ? (
                    <Input 
                      value={editedPatient.jmbg} 
                      onChange={(e) => setEditedPatient({...editedPatient, jmbg: e.target.value})}
                    />
                  ) : (
                    <p>{patient.jmbg}</p>
                  )}
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Phone</Label>
                  {isEditing ? (
                    <Input 
                      value={editedPatient.phone} 
                      onChange={(e) => setEditedPatient({...editedPatient, phone: e.target.value})}
                    />
                  ) : (
                    <p>{patient.phone}</p>
                  )}
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Address</Label>
                  {isEditing ? (
                    <Input 
                      value={editedPatient.address || ''} 
                      onChange={(e) => setEditedPatient({...editedPatient, address: e.target.value})}
                    />
                  ) : (
                    <p>{patient.address || 'Not provided'}</p>
                  )}
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Email</Label>
                  {isEditing ? (
                    <Input 
                      type="email" 
                      value={editedPatient.email || ''} 
                      onChange={(e) => setEditedPatient({...editedPatient, email: e.target.value})}
                    />
                  ) : (
                    <p>{patient.email || 'Not provided'}</p>
                  )}
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Gender</Label>
                  {isEditing ? (
                    <select 
                      className="w-full h-10 px-3 rounded-md border border-input"
                      value={editedPatient.gender || ''}
                      onChange={(e) => setEditedPatient({...editedPatient, gender: e.target.value as 'M' | 'F'})}
                    >
                      <option value="">Select gender</option>
                      <option value="M">Male</option>
                      <option value="F">Female</option>
                    </select>
                  ) : (
                    <p>{patient.gender === 'M' ? 'Male' : patient.gender === 'F' ? 'Female' : 'Not specified'}</p>
                  )}
                </div>
              </div>
            </div>
            
            <div>
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-medium">Recent Visits</h3>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="text-sm"
                  onClick={() => setIsScheduling(true)}
                >
                  Schedule Appointment
                </Button>
              </div>
              
              <div className="space-y-3">
                {patientHistory.slice(0, 3).map((record) => (
                  <div key={record.id} className="rounded-md border p-3 hover:bg-muted/50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="mr-3 rounded-full bg-clinic-50 p-2 text-clinic-700">
                          {record.type.includes("General") ? (
                            <File className="h-4 w-4" />
                          ) : (
                            <Calendar className="h-4 w-4" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{record.type}</p>
                          <p className="text-sm text-muted-foreground">
                            {formatDate(record.date)} · {record.doctor}
                          </p>
                        </div>
                      </div>
                      <button className="text-sm font-medium text-clinic-600 hover:text-clinic-800">
                        View
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="reports" className="space-y-4">
            <div className="flex justify-between mb-4">
              <h3 className="text-lg font-medium">Medical Reports</h3>
              <Button size="sm" variant="outline">View All</Button>
            </div>
            
            {reports.length > 0 ? (
              <div className="space-y-3">
                {reports.map((report) => (
                  <div key={report.id} className="rounded-md border p-4 hover:bg-muted/50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="mr-3 rounded-full bg-clinic-50 p-2 text-clinic-700">
                          <FileText className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="font-medium">{report.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {formatDate(report.date)} · {report.doctor}
                          </p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">View</Button>
                        <Button variant="outline" size="sm">Edit</Button>
                        <Button variant="outline" size="sm">Print</Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center p-6 border rounded-md">
                <p className="text-muted-foreground">No medical reports found for this patient.</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="history" className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Visit History</h3>
              <div className="flex space-x-2">
                <Input placeholder="Search visits..." className="w-48" />
                <Button size="sm" variant="outline">Filter</Button>
              </div>
            </div>
            
            <div className="rounded-md border">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="px-4 py-2 text-left">Date</th>
                    <th className="px-4 py-2 text-left">Type</th>
                    <th className="px-4 py-2 text-left">Doctor</th>
                    <th className="px-4 py-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {patientHistory.map((record) => (
                    <tr key={record.id} className="border-b hover:bg-muted/50">
                      <td className="px-4 py-2">{formatDate(record.date)}</td>
                      <td className="px-4 py-2">{record.type}</td>
                      <td className="px-4 py-2">{record.doctor}</td>
                      <td className="px-4 py-2 text-right">
                        <Button variant="ghost" size="sm">View Details</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>
          
          <TabsContent value="audit" className="space-y-4">
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
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
