
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
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Eye, Edit, Trash2, Search, Download, Key } from "lucide-react";
import type { User } from "@/types/user";
import UserForm from "./UserForm";
import { useToast } from "@/hooks/use-toast";
import * as bcrypt from 'bcryptjs';
import dataStorageService from "@/services/DataStorageService";

export default function UsersManagement() {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'doctor' | 'nurse' | 'technician'>('all');
  const { toast } = useToast();

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      // First try to get users from dataStorageService
      const storedUsers = await dataStorageService.getUsers();
      
      if (storedUsers && storedUsers.length > 0) {
        setUsers(storedUsers);
        console.log("[UsersManagement] Loaded users from dataStorageService:", storedUsers.length);
      } else {
        // Fallback to localStorage
        const savedUsers = localStorage.getItem('users');
        if (savedUsers) {
          try {
            const parsedUsers = JSON.parse(savedUsers);
            setUsers(parsedUsers);
            // Also save to dataStorageService for consistency
            await dataStorageService.saveUsers(parsedUsers);
            console.log("[UsersManagement] Loaded users from localStorage:", parsedUsers);
          } catch (error) {
            console.error("[UsersManagement] Error parsing users:", error);
            loadDefaultUsers();
          }
        } else {
          loadDefaultUsers();
        }
      }
    } catch (error) {
      console.error("[UsersManagement] Error loading users:", error);
      loadDefaultUsers();
    }
  };

  const loadDefaultUsers = async () => {
    // These default users should match the ones in AuthContext
    const defaultUsers: User[] = [
      {
        id: "USR001",
        email: "dr.smith@klinika.com",
        firstName: "Adnan",
        lastName: "Hadžić",
        role: "doctor",
        specialization: "Kardiologija",
        phone: "+38761123456",
        password: "$2a$10$KvwR4nMOa6BIgFmIVneeguBYRNNFYxRh9kKqZN1Hl2wYRJJfXVA5q", // doctor123
        permissions: ["view_reports", "create_patients"],
        active: true,
      },
      {
        id: "USR002",
        email: "admin@klinika.com",
        firstName: "Amina",
        lastName: "Selimović",
        role: "admin",
        phone: "+38761654321",
        password: "$2a$10$BBJUo6ZUYlz3jm7xQgDD5.FR/GRPXFDJibF1.6P5r/OJlO76Durha", // admin123
        permissions: ["view_reports", "create_patients", "delete_users"],
        active: true,
      },
      {
        id: "USR003",
        email: "superadmin@klinika.com",
        firstName: "Super",
        lastName: "Admin",
        role: "admin",
        phone: "+38761111111",
        password: "$2a$10$T3ZGu7WGcEtNYm8F2ZsCoe2P5zLuQzUXvyEFsHwHOCRA8UwJl/YZC", // superadmin123
        permissions: ["view_reports", "create_patients", "delete_users"],
        active: true,
      },
      {
        id: "USR004",
        email: "dr.kovac@klinika.com",
        firstName: "Emina",
        lastName: "Kovač",
        role: "doctor",
        specialization: "Neurologija",
        phone: "+38761222222",
        password: "$2a$10$KvwR4nMOa6BIgFmIVneeguBYRNNFYxRh9kKqZN1Hl2wYRJJfXVA5q", // doctor123
        permissions: ["view_reports", "create_patients"],
        active: true,
      },
      {
        id: "USR005",
        email: "dr.begic@klinika.com",
        firstName: "Amir",
        lastName: "Begić",
        role: "doctor",
        specialization: "Ortopedija",
        phone: "+38761333333",
        password: "$2a$10$KvwR4nMOa6BIgFmIVneeguBYRNNFYxRh9kKqZN1Hl2wYRJJfXVA5q", // doctor123
        permissions: ["view_reports", "create_patients"],
        active: true,
      },
      {
        id: "USR006",
        email: "tehnicar@klinika.com",
        firstName: "Haris",
        lastName: "Mujić",
        role: "nurse",
        phone: "+38761444444",
        password: "$2a$10$YpM2Jf2TXt/9C6gkRJXfOOEq0Evs4xnbzFK1OmYc/2PLm4qXxdTLu", // nurse123
        permissions: ["create_patients"],
        active: true,
      },
    ];

    setUsers(defaultUsers);
    
    // Save to both localStorage and dataStorageService
    localStorage.setItem('users', JSON.stringify(defaultUsers));
    await dataStorageService.saveUsers(defaultUsers);
    
    console.log("[UsersManagement] Loaded default users");
  };

  const saveUsers = async (updatedUsers: User[]) => {
    try {
      // Save to both localStorage and dataStorageService for consistency
      localStorage.setItem('users', JSON.stringify(updatedUsers));
      await dataStorageService.saveUsers(updatedUsers);
      
      console.log("[UsersManagement] Saved users:", updatedUsers.length);
    } catch (error) {
      console.error("[UsersManagement] Error saving users:", error);
      toast({
        title: "Greška",
        description: "Dogodila se greška pri spremanju korisnika",
        variant: "destructive"
      });
    }
  };

  const handleAddUser = async (data: any) => {
    try {
      const password = data.password || "changeme123"; // Default password if not provided
      
      // Hash the password before storing it
      const hashedPassword = await bcrypt.hash(password, 10);
      
      // Extract permissions from form data
      const permissions = data.permissionsArray || [];
      
      const newUser: User = {
        id: `USR${Date.now().toString().substring(7)}`,
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
      await saveUsers(updatedUsers);
      logAudit('create', `Kreiran korisnik ${newUser.email}`, newUser.id);
      console.log("[UsersManagement] Added new user:", newUser);
    } catch (error) {
      console.error("[UsersManagement] Error adding user:", error);
      throw error;
    }
  };

  const handleEditUser = async (data: any) => {
    try {
      if (!selectedUser) return;
      
      // Only hash password if it was provided (not empty string)
      let password = selectedUser.password;
      if (data.password) {
        password = await bcrypt.hash(data.password, 10);
      }
      
      // Get permissions from form data
      const permissions = data.permissionsArray || selectedUser.permissions || [];
      
      const updatedUsers = users.map(user => 
        user.id === selectedUser.id 
          ? { 
              ...user, 
              email: data.email,
              firstName: data.firstName,
              lastName: data.lastName,
              role: data.role,
              specialization: data.specialization,
              phone: data.phone,
              permissions,
              password 
            }
          : user
      );
      
      setUsers(updatedUsers);
      await saveUsers(updatedUsers);
      
      // Update current user in localStorage if it's the same user being edited
      const currentUserData = localStorage.getItem("currentUser");
      if (currentUserData) {
        const currentUser = JSON.parse(currentUserData);
        if (currentUser.id === selectedUser.id) {
          const updatedCurrentUser = {
            ...currentUser,
            firstName: data.firstName,
            lastName: data.lastName,
            role: data.role,
            specialization: data.specialization,
            phone: data.phone,
            permissions
          };
          localStorage.setItem("currentUser", JSON.stringify(updatedCurrentUser));
        }
      }
      
      logAudit('update', `Ažuriran korisnik ${data.email}`, selectedUser.id);
      console.log("[UsersManagement] Updated user:", selectedUser.id);
    } catch (error) {
      console.error("[UsersManagement] Error updating user:", error);
      throw error;
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      const updatedUsers = users.filter(user => user.id !== userId);
      setUsers(updatedUsers);
      
      await saveUsers(updatedUsers);
      
      logAudit('delete', `Obrisan korisnik ${userId}`, userId);
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

  // Derived list with filters
  const filteredUsers = users.filter((u) => {
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    const q = searchTerm.trim().toLowerCase();
    const matchesQuery = !q || `${u.firstName} ${u.lastName}`.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
    return matchesRole && matchesQuery;
  });

  const logAudit = (action: string, details: string, entityId?: string) => {
    try {
      const currentUser = localStorage.getItem('currentUser');
      const performedBy = currentUser ? `${JSON.parse(currentUser).firstName} ${JSON.parse(currentUser).lastName}` : 'unknown';
      const logs = JSON.parse(localStorage.getItem('auditLogs') || '[]');
      logs.push({
        id: Date.now(),
        action,
        entityType: 'user',
        entityId: entityId || '',
        performedBy,
        performedAt: new Date().toISOString(),
        details,
      });
      localStorage.setItem('auditLogs', JSON.stringify(logs));
    } catch {}
  };

  const handleToggleActive = async (user: User) => {
    try {
      const updatedUsers = users.map(u => u.id === user.id ? { ...u, active: !u.active } : u);
      setUsers(updatedUsers);
      await saveUsers(updatedUsers);
      logAudit('update', `Status promijenjen na ${!user.active ? 'Aktivan' : 'Neaktivan'} za ${user.email}`, user.id);
      toast({ title: 'Status ažuriran', description: `${user.firstName} ${user.lastName} je sada ${!user.active ? 'aktivan' : 'neaktivan'}.` });
    } catch (e) {
      console.error('[UsersManagement] Toggle active failed', e);
      toast({ title: 'Greška', description: 'Nije moguće promijeniti status', variant: 'destructive' });
    }
  };

  const handleResetPassword = async (user: User) => {
    try {
      if (!window.confirm(`Reset lozinke za ${user.firstName} ${user.lastName}?`)) return;
      const temp = `Temp-${Math.random().toString(36).slice(2,8)}`;
      const hashed = await bcrypt.hash(temp, 10);
      const updatedUsers = users.map(u => u.id === user.id ? { ...u, password: hashed } : u);
      setUsers(updatedUsers);
      await saveUsers(updatedUsers);
      logAudit('update', `Reset lozinke za ${user.email}`, user.id);
      toast({ title: 'Lozinka resetovana', description: `Privremena lozinka: ${temp}` });
    } catch (e) {
      console.error('[UsersManagement] Reset password failed', e);
      toast({ title: 'Greška', description: 'Nije moguće resetovati lozinku', variant: 'destructive' });
    }
  };

  const exportCSV = () => {
    const headers = ['ID','Ime','Prezime','Email','Uloga','Specijalizacija','Telefon','Aktivan'];
    const rows = filteredUsers.map(u => [u.id, u.firstName, u.lastName, u.email, u.role, u.specialization || '', u.phone || '', u.active ? 'DA' : 'NE']);
    const csv = [headers, ...rows].map(r => r.map(v => `"${String(v).replace(/"/g,'""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `korisnici-${new Date().toISOString().slice(0,10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <Card className="p-6">
        <div className="mb-6 space-y-3">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-semibold text-clinic-800">Osoblje</h2>
              <p className="text-sm text-muted-foreground">
                Upravljanje doktorima, administratorima i medicinskim tehničarima
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={exportCSV}>
                <Download className="h-4 w-4 mr-2" /> Izvoz CSV
              </Button>
              <Button onClick={openAddForm}>Dodaj korisnika</Button>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Pretraži po imenu ili emailu..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Select value={roleFilter} onValueChange={(v) => setRoleFilter(v as any)}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Uloga" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Sve uloge</SelectItem>
                <SelectItem value="admin">Administrator</SelectItem>
                <SelectItem value="doctor">Doktor</SelectItem>
                <SelectItem value="nurse">Medicinski tehničar</SelectItem>
                <SelectItem value="technician">Tehničar</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ime</TableHead>
                <TableHead>Uloga</TableHead>
                <TableHead>Specijalizacija</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Dozvole</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Akcije</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
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
                    <div className="flex flex-wrap gap-1">
                      {user.permissions?.map((permission) => (
                        <span 
                          key={permission} 
                          className="inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700"
                        >
                          {permission === 'view_reports' ? 'Izvještaji' : 
                           permission === 'create_patients' ? 'Pacijenti' : 
                           permission === 'delete_users' ? 'Brisanje' : permission}
                        </span>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                        user.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {user.active ? 'Aktivan' : 'Neaktivan'}
                      </span>
                      <Switch checked={user.active} onCheckedChange={() => handleToggleActive(user)} />
                    </div>
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
                        title="Reset lozinke"
                        onClick={() => handleResetPassword(user)}
                      >
                        <Key className="h-4 w-4" />
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
