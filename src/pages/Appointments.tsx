
import { useState } from "react";
import Header from "@/components/layout/Header";
import AppointmentsList from "@/components/appointments/AppointmentsList";
import AppointmentForm from "@/components/appointments/AppointmentForm";

export default function Appointments() {
  const [isCreating, setIsCreating] = useState(false);
  
  return (
    <div className="flex h-full flex-col">
      <Header 
        title="Termini"
        action={{
          label: "Zakaži",
          onClick: () => setIsCreating(true),
        }}
      />
      <div className="page-container">
        {isCreating ? (
          <AppointmentForm onCancel={() => setIsCreating(false)} />
        ) : (
          <AppointmentsList />
        )}
      </div>
    </div>
  );
}
