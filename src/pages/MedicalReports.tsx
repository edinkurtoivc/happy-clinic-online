
import { useState } from "react";
import Header from "@/components/layout/Header";
import { Card } from "@/components/ui/card";
import MedicalReportForm from "@/components/medical-reports/MedicalReportForm";
import type { MedicalReport } from "@/types/medical-report";

export default function MedicalReports() {
  const [isFormOpen, setIsFormOpen] = useState(false);

  const handleCreateReport = async (data: Partial<MedicalReport>) => {
    // Will implement with Supabase
    console.log('Creating medical report:', data);
  };

  return (
    <div className="flex h-full flex-col">
      <Header 
        title="Medical Reports"
        action={{
          label: "New Report",
          onClick: () => setIsFormOpen(true),
        }}
      />
      <div className="page-container">
        <Card className="p-6">
          <div className="flex h-48 items-center justify-center">
            <p className="text-muted-foreground">Select a patient to view or create medical reports</p>
          </div>
        </Card>
      </div>

      <MedicalReportForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSubmit={handleCreateReport}
      />
    </div>
  );
}
