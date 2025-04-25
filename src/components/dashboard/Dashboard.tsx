
import { Card } from "@/components/ui/card";
import { Calendar, Users, File } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
}

function StatCard({ title, value, icon }: StatCardProps) {
  return (
    <Card className="card-stats flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <h3 className="mt-1 text-2xl font-semibold text-clinic-700">{value}</h3>
      </div>
      <div className="rounded-full bg-clinic-100 p-3 text-clinic-700">
        {icon}
      </div>
    </Card>
  );
}

export default function Dashboard() {
  // Mock data for the dashboard
  const stats = [
    {
      title: "Total Patients",
      value: 1,248,
      icon: <Users className="h-5 w-5" />,
    },
    {
      title: "Today's Appointments",
      value: 8,
      icon: <Calendar className="h-5 w-5" />,
    },
    {
      title: "Medical Reports",
      value: 347,
      icon: <File className="h-5 w-5" />,
    },
  ];

  const recentAppointments = [
    { id: 1, patient: "Jana Petrović", time: "09:00", type: "General Checkup" },
    { id: 2, patient: "Marko Nikolić", time: "10:30", type: "Dermatology" },
    { id: 3, patient: "Ana Stanković", time: "12:15", type: "Cardiology" },
    { id: 4, patient: "Jovan Jovanović", time: "14:00", type: "Neurology" },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        {stats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      <Card className="p-6">
        <h3 className="mb-4 text-lg font-medium">Today's Appointments</h3>
        
        <div className="overflow-hidden rounded-md border">
          <table className="min-w-full divide-y">
            <thead className="bg-muted">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Patient</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Time</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Type</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y bg-white">
              {recentAppointments.map((appointment) => (
                <tr key={appointment.id}>
                  <td className="px-4 py-3 text-sm">{appointment.patient}</td>
                  <td className="px-4 py-3 text-sm">{appointment.time}</td>
                  <td className="px-4 py-3 text-sm">{appointment.type}</td>
                  <td className="px-4 py-3 text-right text-sm">
                    <button className="text-clinic-600 hover:text-clinic-800">
                      View
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
