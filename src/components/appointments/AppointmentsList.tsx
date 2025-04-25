
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card } from "@/components/ui/card";
import { format } from "date-fns";

// Mock data for appointments
const mockAppointments = [
  { id: 1, patient: "Ana Marković", date: "2025-04-25", time: "09:00", doctor: "Dr. Marija Popović", type: "General Checkup" },
  { id: 2, patient: "Nikola Jovanović", date: "2025-04-25", time: "10:30", doctor: "Dr. Petar Petrović", type: "Dermatology" },
  { id: 3, patient: "Milica Petrović", date: "2025-04-25", time: "12:15", doctor: "Dr. Marija Popović", type: "Cardiology" },
  { id: 4, patient: "Stefan Nikolić", date: "2025-04-26", time: "09:30", doctor: "Dr. Petar Petrović", type: "General Checkup" },
  { id: 5, patient: "Jelena Stojanović", date: "2025-04-26", time: "11:00", doctor: "Dr. Marija Popović", type: "Neurology" },
];

interface Appointment {
  id: number;
  patient: string;
  date: string;
  time: string;
  doctor: string;
  type: string;
}

export default function AppointmentsList() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [appointments, setAppointments] = useState<Appointment[]>(mockAppointments);

  const filteredAppointments = selectedDate
    ? appointments.filter(
        (appointment) => appointment.date === format(selectedDate, "yyyy-MM-dd")
      )
    : appointments;

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card className="md:col-span-1">
        <div className="p-4">
          <h3 className="mb-2 font-medium">Select Date</h3>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            className="rounded border p-3 pointer-events-auto"
          />
        </div>
      </Card>

      <Card className="md:col-span-2">
        <div className="p-4">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-medium">
              Appointments for {selectedDate ? format(selectedDate, "MMMM d, yyyy") : "All dates"}
            </h3>
          </div>

          <div className="rounded-md border">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-muted">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Time</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Patient</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Type</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Doctor</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y bg-white">
                {filteredAppointments.length > 0 ? (
                  filteredAppointments.map((appointment) => (
                    <tr key={appointment.id} className="hover:bg-muted/50">
                      <td className="px-4 py-3 text-sm">{appointment.time}</td>
                      <td className="px-4 py-3 text-sm font-medium">{appointment.patient}</td>
                      <td className="px-4 py-3 text-sm">{appointment.type}</td>
                      <td className="px-4 py-3 text-sm">{appointment.doctor}</td>
                      <td className="px-4 py-3 text-right">
                        <button className="text-sm font-medium text-clinic-600 hover:text-clinic-800">View</button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                      No appointments scheduled for this date
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </Card>
    </div>
  );
}
