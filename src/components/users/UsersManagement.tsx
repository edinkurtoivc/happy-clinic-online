
import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Eye, Edit, Trash2 } from "lucide-react";
import type { User } from "@/types/user";
import UserForm from "./UserForm";

export default function UsersManagement() {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');

  // Mock podaci - bit će zamijenjeni Supabase podacima
  const users: User[] = [
    {
      id: "1",
      email: "dr.smith@klinika.com",
      firstName: "Adnan",
      lastName: "Hadžić",
      role: "doctor",
      specialization: "Kardiologija",
      phone: "+38761123456",
      active: true,
    },
    {
      id: "2",
      email: "admin@klinika.com",
      firstName: "Amina",
      lastName: "Selimović",
      role: "admin",
      phone: "+38761654321",
      active: true,
    },
  ];

  const handleAddUser = async (data: {
    email: string;
    firstName: string;
    lastName: string;
    role: "admin" | "doctor" | "nurse";
    specialization?: string;
    phone?: string;
  }) => {
    // Implementacija sa Supabase
    console.log('Kreiranje korisnika:', data);
  };

  const handleEditUser = async (data: {
    email: string;
    firstName: string;
    lastName: string;
    role: "admin" | "doctor" | "nurse";
    specialization?: string;
    phone?: string;
  }) => {
    // Implementacija sa Supabase
    console.log('Ažuriranje korisnika:', data);
  };

  const openAddForm = () => {
    setSelectedUser(null);
    setFormMode('create');
    setIsFormOpen(true);
  };

  const openEditForm = (user: User) => {
    setSelectedUser(user);
    setFormMode('edit');
    setIsFormOpen(true);
  };

  return (
    <>
      <Card className="p-6">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h2 className="text-lg font-semibold text-clinic-800">Osoblje</h2>
            <p className="text-sm text-muted-foreground">
              Upravljanje doktorima, administratorima i medicinskim tehničarima
            </p>
          </div>
          <Button onClick={openAddForm}>Dodaj korisnika</Button>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ime</TableHead>
                <TableHead>Uloga</TableHead>
                <TableHead>Specijalizacija</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Akcije</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.firstName} {user.lastName}</TableCell>
                  <TableCell className="capitalize">
                    {user.role === 'admin' ? 'Administrator' : 
                     user.role === 'doctor' ? 'Doktor' : 
                     user.role === 'nurse' ? 'Tehničar' : user.role}
                  </TableCell>
                  <TableCell>{user.specialization || '-'}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                      user.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {user.active ? 'Aktivan' : 'Neaktivan'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon" title="Pregledaj">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => openEditForm(user)}
                        title="Uredi"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" title="Obriši">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>

      <UserForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSubmit={formMode === 'create' ? handleAddUser : handleEditUser}
        defaultValues={selectedUser || undefined}
        mode={formMode}
      />
    </>
  );
}
