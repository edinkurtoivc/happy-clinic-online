
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

export default function UsersManagement() {
  // Mock data - will be replaced with Supabase data
  const users: User[] = [
    {
      id: "1",
      email: "dr.smith@clinic.com",
      firstName: "John",
      lastName: "Smith",
      role: "doctor",
      specialization: "Cardiology",
      phone: "+123456789",
      active: true,
    },
    {
      id: "2",
      email: "admin@clinic.com",
      firstName: "Jane",
      lastName: "Doe",
      role: "admin",
      phone: "+987654321",
      active: true,
    },
  ];

  return (
    <Card className="p-6">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-clinic-800">Staff Members</h2>
        <p className="text-sm text-muted-foreground">
          Manage doctors, administrators, and medical technicians
        </p>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Specialization</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.firstName} {user.lastName}</TableCell>
                <TableCell className="capitalize">{user.role}</TableCell>
                <TableCell>{user.specialization || '-'}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                    user.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {user.active ? 'Active' : 'Inactive'}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
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
  );
}
