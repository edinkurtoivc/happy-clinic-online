
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Users, Calendar, Edit, Save, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Patient } from "@/types/patient";

interface PatientOverviewProps {
  patient: Patient;
  editedPatient: Patient;
  isEditing: boolean;
  setIsEditing: (value: boolean) => void;
  setEditedPatient: (patient: Patient) => void;
  onUpdate?: (patient: Patient) => void;
  setIsScheduling: (value: boolean) => void;
  patientHistory: any[];
}

export function PatientOverview({
  patient,
  editedPatient,
  isEditing,
  setIsEditing,
  setEditedPatient,
  onUpdate,
  setIsScheduling,
  patientHistory
}: PatientOverviewProps) {
  const { toast } = useToast();

  const handleSaveChanges = () => {
    if (!editedPatient.name || !editedPatient.jmbg) {
      toast({
        title: "Error",
        description: "Name and JMBG are required fields.",
        variant: "destructive",
      });
      return;
    }
    
    if (onUpdate) {
      onUpdate(editedPatient);
    }
    
    toast({
      title: "Success",
      description: "Patient information updated successfully.",
    });
    
    setIsEditing(false);
    
    console.log('Audit log: Patient information updated', {
      patientId: patient.id,
      updatedBy: 'Current User',
      timestamp: new Date().toISOString(),
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('bs-BA', { 
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

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

  return (
    <div className="space-y-4">
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

      <RecentVisits 
        patientHistory={patientHistory} 
        setIsScheduling={setIsScheduling} 
      />

      {isEditing && (
        <div className="flex justify-end space-x-2">
          <Button variant="outline" size="sm" onClick={() => setIsEditing(false)}>
            <X className="h-4 w-4 mr-1" /> Cancel
          </Button>
          <Button size="sm" onClick={handleSaveChanges}>
            <Save className="h-4 w-4 mr-1" /> Save Changes
          </Button>
        </div>
      )}
    </div>
  );
}
