
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const roles = [
  { id: 1, name: "Administrator", description: "Potpuni pristup", permissions: "Sve" },
  { id: 2, name: "Doktor", description: "Pregledi i nalazi", permissions: "Pacijenti, Nalazi" },
  { id: 3, name: "Recepcija", description: "Rezervacije termina", permissions: "Pacijenti, Termini" },
];

export default function UserRoles() {
  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-semibold">Role i permisije</h2>
          <p className="text-muted-foreground">
            Upravljajte rolama i permisijama za korisnike sistema
          </p>
        </div>
        <Button variant="outline">Dodaj rolu</Button>
      </div>
      
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Naziv role</TableHead>
            <TableHead>Opis</TableHead>
            <TableHead>Permisije</TableHead>
            <TableHead className="text-right">Akcije</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {roles.map((role) => (
            <TableRow key={role.id}>
              <TableCell className="font-medium">{role.name}</TableCell>
              <TableCell>{role.description}</TableCell>
              <TableCell>{role.permissions}</TableCell>
              <TableCell className="text-right">
                <Button variant="ghost" size="sm">Uredi</Button>
                <Button variant="ghost" size="sm" className="text-red-500">Obriši</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}
