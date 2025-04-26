import { useState } from "react";
import Header from "@/components/layout/Header";
import MedicalReportForm from "@/components/medical-reports/MedicalReportForm";
import MedicalReportPreview from "@/components/medical-reports/MedicalReportPreview";
import type { MedicalReport } from "@/types/medical-report";

export default function MedicalReports() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const handleCreateReport = async (data: Partial<MedicalReport>) => {
    // Will implement with Supabase
    console.log('Kreiranje medicinskog izvještaja:', data);
  };

  return (
    <div className="flex h-full flex-col">
      <Header 
        title="Nalazi"
        action={{
          label: "Novi Nalaz",
          onClick: () => setIsFormOpen(true),
        }}
      />
      <div className="page-container p-6">
        <div className="mx-auto max-w-[1120px]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="w-full max-w-[560px]">
              <h2 className="text-xl font-semibold mb-4">Editor nalaza</h2>
              {/* Editor component will go here */}
            </div>
            
            <div className="w-full max-w-[560px]">
              <h2 className="text-xl font-semibold mb-4">Pregled nalaza</h2>
              <MedicalReportPreview />
            </div>
          </div>
        </div>
      </div>

      <MedicalReportForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSubmit={handleCreateReport}
      />
    </div>
  );
}
