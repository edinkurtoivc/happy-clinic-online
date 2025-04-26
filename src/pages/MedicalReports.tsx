
import { useState } from "react";
import Header from "@/components/layout/Header";
import MedicalReportForm from "@/components/medical-reports/MedicalReportForm";
import MedicalReportPreview from "@/components/medical-reports/MedicalReportPreview";
import type { MedicalReport } from "@/types/medical-report";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bold, Italic, Underline } from "lucide-react";

export default function MedicalReports() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [showPatientsDropdown, setShowPatientsDropdown] = useState(false);

  const handleCreateReport = async (data: Partial<MedicalReport>) => {
    // Will implement with Supabase
    console.log('Kreiranje medicinskog izvještaja:', data);
  };

  return (
    <div className="flex h-full flex-col">
      <Header 
        title="Nalaz i Mišljenje"
      />
      
      <div className="page-container p-4">
        {/* Breadcrumb */}
        <div className="flex items-center text-sm mb-6">
          <span className="text-muted-foreground">Početna</span>
          <span className="mx-2">›</span>
          <span className="text-emerald-600">Nalaz i Mišljenje</span>
        </div>
        
        {/* Patient selection */}
        <div className="relative mb-6">
          <div className="w-full relative">
            <Input 
              placeholder="Odaberite pacijenta"
              className="w-full border rounded-md p-4"
              onClick={() => setShowPatientsDropdown(!showPatientsDropdown)}
            />
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
            </div>
          </div>
          
          {showPatientsDropdown && (
            <div className="absolute z-10 w-full bg-white border rounded-md mt-1 shadow-md">
              <Input 
                placeholder="Pronađite pacijenta..." 
                className="m-2 w-[calc(100%-16px)]"
              />
              <div className="p-2 hover:bg-gray-100 cursor-pointer flex border-t">
                <span className="text-emerald-600">+</span>
                <span className="ml-2">Dodaj novog pacijenta</span>
              </div>
              <div className="p-2 hover:bg-gray-100 cursor-pointer">
                Emina Eminić
              </div>
            </div>
          )}
        </div>

        <div className="mx-auto max-w-[1120px]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Editor Section */}
            <div className="w-full max-w-[560px]">
              <h2 className="text-xl font-semibold mb-4 text-emerald-600">Editor za nalaz</h2>
              <div className="border rounded-md p-2 mb-4">
                <div className="flex gap-2 mb-2">
                  <Button variant="outline" size="icon" className="h-8 w-8">
                    <Bold className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon" className="h-8 w-8">
                    <Italic className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon" className="h-8 w-8">
                    <Underline className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="border rounded-md p-4 h-[500px]">
                {/* This will be replaced with a proper rich text editor */}
                <textarea 
                  className="w-full h-full outline-none resize-none" 
                  placeholder="Unesite tekst nalaza..."
                ></textarea>
              </div>
            </div>
            
            {/* Preview Section */}
            <div className="w-full max-w-[560px]">
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
