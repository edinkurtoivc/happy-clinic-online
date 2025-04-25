
import Header from "@/components/layout/Header";
import { Card } from "@/components/ui/card";

export default function MedicalReports() {
  return (
    <div className="flex h-full flex-col">
      <Header 
        title="Medical Reports"
        action={{
          label: "New Report",
          onClick: () => console.log("New report clicked"),
        }}
      />
      <div className="page-container">
        <Card className="p-6">
          <div className="flex h-48 items-center justify-center">
            <p className="text-muted-foreground">Select a patient to view or create medical reports</p>
          </div>
        </Card>
      </div>
    </div>
  );
}
