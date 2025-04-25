
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";

export default function AppointmentForm({ onCancel }: { onCancel: () => void }) {
  const [date, setDate] = useState<Date | undefined>(new Date());
  
  // Mock data for doctors and appointment types
  const doctors = [
    { id: 1, name: "Dr. Marija Popović" },
    { id: 2, name: "Dr. Petar Petrović" },
  ];
  
  const appointmentTypes = [
    { id: 1, name: "General Checkup" },
    { id: 2, name: "Cardiology" },
    { id: 3, name: "Dermatology" },
    { id: 4, name: "Neurology" },
  ];

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-clinic-800">Schedule New Appointment</CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="patient">Patient</Label>
          <Select>
            <SelectTrigger id="patient">
              <SelectValue placeholder="Select patient" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">Ana Marković</SelectItem>
              <SelectItem value="2">Nikola Jovanović</SelectItem>
              <SelectItem value="3">Milica Petrović</SelectItem>
              <SelectItem value="4">Stefan Nikolić</SelectItem>
              <SelectItem value="5">Jelena Stojanović</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label>Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                initialFocus
                className="p-3 pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="time">Time</Label>
          <Select>
            <SelectTrigger id="time">
              <SelectValue placeholder="Select time" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="09:00">09:00</SelectItem>
              <SelectItem value="09:30">09:30</SelectItem>
              <SelectItem value="10:00">10:00</SelectItem>
              <SelectItem value="10:30">10:30</SelectItem>
              <SelectItem value="11:00">11:00</SelectItem>
              <SelectItem value="11:30">11:30</SelectItem>
              <SelectItem value="12:00">12:00</SelectItem>
              <SelectItem value="12:30">12:30</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="doctor">Doctor</Label>
          <Select>
            <SelectTrigger id="doctor">
              <SelectValue placeholder="Select doctor" />
            </SelectTrigger>
            <SelectContent>
              {doctors.map(doctor => (
                <SelectItem key={doctor.id} value={doctor.id.toString()}>
                  {doctor.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="type">Appointment Type</Label>
          <Select>
            <SelectTrigger id="type">
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              {appointmentTypes.map(type => (
                <SelectItem key={type.id} value={type.id.toString()}>
                  {type.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="notes">Notes (Optional)</Label>
          <Input id="notes" placeholder="Enter any additional notes" />
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
        <Button className="bg-clinic-600 hover:bg-clinic-700">Schedule Appointment</Button>
      </CardFooter>
    </Card>
  );
}
