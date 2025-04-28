
import { Card } from "@/components/ui/card";

export default function Dashboard() {
  // Mock data for today's appointments
  const todayAppointments = [
    { id: 1, patient: "Jana Petrović", time: "09:00", type: "General Checkup" },
    { id: 2, patient: "Marko Nikolić", time: "10:30", type: "Dermatology" },
    { id: 3, patient: "Ana Stanković", time: "12:15", type: "Cardiology" },
    { id: 4, patient: "Jovan Jovanović", time: "14:00", type: "Neurology" },
  ];

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="mb-4 text-lg font-medium">Današnji pregledi</h3>
        
        <div className="overflow-hidden rounded-md border">
          <table className="min-w-full divide-y">
            <thead className="bg-muted">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Pacijent</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Vrijeme</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Tip pregleda</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Akcije</th>
              </tr>
            </thead>
            <tbody className="divide-y bg-white">
              {todayAppointments.map((appointment) => (
                <tr key={appointment.id}>
                  <td className="px-4 py-3 text-sm">{appointment.patient}</td>
                  <td className="px-4 py-3 text-sm">{appointment.time}</td>
                  <td className="px-4 py-3 text-sm">{appointment.type}</td>
                  <td className="px-4 py-3 text-right text-sm">
                    <button className="text-clinic-600 hover:text-clinic-800">
                      Pregled
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
