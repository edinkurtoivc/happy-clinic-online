
import { useState, useEffect } from "react";
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
import { useToast } from "@/hooks/use-toast";
import * as bcrypt from 'bcryptjs';

export default function UsersManagement() {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [users, setUsers] = useState<User[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const savedUsers = localStorage.getItem('users');
    if (savedUsers) {
      try {
        const parsedUsers = JSON.parse(savedUsers);
        setUsers(parsedUsers);
        console.log("[UsersManagement] Loaded users from localStorage:", parsedUsers);
      } catch (error) {
        console.error("[UsersManagement] Error parsing users:", error);
        loadDefaultUsers();
      }
    } else {
      loadDefaultUsers();
    }
  }, []);

  const loadDefaultUsers = () => {
    const defaultUsers: User[] = [
      {
        id: "1",
        email: "dr.smith@klinika.com",
        firstName: "Adnan",
        lastName: "Hadžić",
        role: "doctor",
        specialization: "Kardiologija",
        phone: "+38761123456",
        password: "doctor123",
        permissions: ["view_reports", "create_patients"],
        active: true,
      },
      {
        id: "2",
        email: "admin@klinika.com",
        firstName: "Amina",
        lastName: "Selimović",
        role: "admin",
        phone: "+38761654321",
        password: "admin123",
        permissions: ["view_reports", "create_patients", "delete_users"],
        active: true,
      },
      {
        id: "3",
        email: "superadmin@klinika.com",
        firstName: "Super",
        lastName: "Admin",
        role: "admin",
        phone: "+38761111111",
        password: "superadmin123",
        permissions: ["view_reports", "create_patients", "delete_users"],
        active: true,
      }
    ];

    setUsers(defaultUsers);
    localStorage.setItem('users', JSON.stringify(defaultUsers));
    console.log("[UsersManagement] Loaded default users");
  };

  const saveUsers = (updatedUsers: User[]) => {
    localStorage.setItem('users', JSON.stringify(updatedUsers));
    console.log("[UsersManagement] Saved users to localStorage:", updatedUsers);
  };

  const handleAddUser = async (data: {
    email: string;
    firstName: string;
    lastName: string;
    password: string;
    role: "admin" | "doctor" | "nurse";
    specialization?: string;
    phone?: string;
  }) => {
    try {
      // Hash the password before storing it
      const hashedPassword = await bcrypt.hash(data.password, 10);
      
      // Set default permissions based on role
      let permissions: string[] = [];
      if (data.role === "admin") {
        permissions = ["view_reports", "create_patients", "delete_users"];
      } else if (data.role === "doctor") {
        permissions = ["view_reports", "create_patients"];
      } else if (data.role === "nurse") {
        permissions = ["create_patients"];
      }
      
      const newUser: User = {
        id: `user-${Date.now()}`,
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        password: hashedPassword,
        role: data.role,
        specialization: data.specialization,
        phone: data.phone,
        permissions,
        active: true,
      };
      
      const updatedUsers = [...users, newUser];
      setUsers(updatedUsers);
      saveUsers(updatedUsers);
      
      console.log("[UsersManagement] Added new user:", newUser);
    } catch (error) {
      console.error("[UsersManagement] Error adding user:", error);
      throw error;
    }
  };

  const handleEditUser = async (data: {
    email: string;
    firstName: string;
    lastName: string;
    password: string;
    role: "admin" | "doctor" | "nurse";
    specialization?: string;
    phone?: string;
  }) => {
    try {
      if (!selectedUser) return;
      
      // Only hash password if it was changed (not empty string)
      const password = data.password 
        ? await bcrypt.hash(data.password, 10)
        : selectedUser.password;
      
      // Update permissions based on role if they don't exist or role has changed
      let permissions = selectedUser.permissions || [];
      if (!permissions.length || selectedUser.role !== data.role) {
        if (data.role === "admin") {
          permissions = ["view_reports", "create_patients", "delete_users"];
        } else if (data.role === "doctor") {
          permissions = ["view_reports", "create_patients"];
        } else if (data.role === "nurse") {
          permissions = ["create_patients"];
        }
      }
      
      const updatedUsers = users.map(user => 
        user.id === selectedUser.id 
          ? { ...user, ...data, password, permissions }
          : user
      );
      
      setUsers(updatedUsers);
      saveUsers(updatedUsers);
      
      console.log("[UsersManagement] Updated user:", selectedUser.id);
    } catch (error) {
      console.error("[UsersManagement] Error updating user:", error);
      throw error;
    }
  };

  const handleDeleteUser = (userId: string) => {
    try {
      const updatedUsers = users.filter(user => user.id !== userId);
      setUsers(updatedUsers);
      
      saveUsers(updatedUsers);
      
      toast({
        title: "Korisnik obrisan",
        description: "Korisnik je uspješno obrisan iz sistema",
      });
      
      console.log("[UsersManagement] Deleted user:", userId);
    } catch (error) {
      console.error("[UsersManagement] Error deleting user:", error);
      toast({
        title: "Greška",
        description: "Dogodila se greška pri brisanju korisnika",
        variant: "destructive"
      });
    }
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
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        title="Obriši"
                        onClick={() => handleDeleteUser(user.id)}
                      >
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
