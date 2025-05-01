
import { forwardRef, useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Printer, Save } from "lucide-react";
import { format } from "date-fns";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/AuthContext";

interface ClinicInfo {
  name: string;
  address: string;
  city: string;
  canton: string;
  phone: string;
  email: string;
  logo?: string;
}

interface MedicalReportPreviewProps {
  patient?: any;
  reportText: string;
  therapyText: string;
  showSignature: boolean;
  showStamp: boolean;
  onPrint: () => void;
  onSave: () => void;
  isSaved: boolean;
  verificationStatus?: 'unverified' | 'pending' | 'verified';
  verifiedBy?: string;
  appointmentType?: string;
  doctorName?: string;
}

const MedicalReportPreview = forwardRef<HTMLDivElement, MedicalReportPreviewProps>(
  ({ 
    patient, 
    reportText, 
    therapyText, 
    showSignature, 
    showStamp, 
    onPrint, 
    onSave,
    isSaved,
    verificationStatus = 'unverified',
    appointmentType,
    doctorName
  }, ref) => {
    const { user } = useAuth();
    const [clinicInfo, setClinicInfo] = useState<ClinicInfo>({
      name: "Spark Studio",
      address: "Ozimice 1",
      city: "Bihać",
      canton: "",
      phone: "387 61 123 456",
      email: "spark.studio.dev@gmail.com",
    });

    // Load clinic info from localStorage on component mount
    useEffect(() => {
      const savedInfo = localStorage.getItem('clinicInfo');
      
      if (savedInfo) {
        try {
          const parsedInfo = JSON.parse(savedInfo);
          setClinicInfo(parsedInfo);
          console.log("[MedicalReportPreview] Loaded clinic info:", parsedInfo);
        } catch (error) {
          console.error("[MedicalReportPreview] Error parsing clinic info:", error);
        }
      }
    }, []);

    // Get the doctor name from the context if available, otherwise use the prop
    const displayedDoctorName = user ? `${user.firstName} ${user.lastName}` : (doctorName || "potpis doktora");

    const formatDate = (dateString?: string) => {
      if (!dateString) return "";
      
      try {
        return format(new Date(dateString), "dd.MM.yyyy.");
      } catch (e) {
        return dateString;
      }
    };

    const formatDateTime = (dateString?: string) => {
      if (!dateString) return "";
      
      try {
        return format(new Date(dateString), "dd.MM.yyyy. HH:mm");
      } catch (e) {
        return dateString;
      }
    };

    const today = formatDate(new Date().toISOString());
    const nowDateTime = formatDateTime(new Date().toISOString());

    return (
      <div className="flex flex-col h-full">
        <div className="flex justify-between mb-4">
          <h2 className="text-xl font-semibold">Pregled uživo</h2>
          <div className="space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex items-center gap-2"
              onClick={onPrint}
              disabled={!isSaved || verificationStatus !== 'verified'}
              title={!isSaved ? "Nalaz mora biti sačuvan prije printanja" : 
                     verificationStatus !== 'verified' ? "Nalaz mora biti verifikovan prije printanja" : ""}
            >
              <Printer className="h-4 w-4" /> Print i PDF
            </Button>
            <Button 
              size="sm" 
              className="bg-emerald-500 hover:bg-emerald-600 flex items-center gap-2"
              onClick={onSave}
            >
              <Save className="h-4 w-4" /> Spremi
            </Button>
          </div>
        </div>
        
        <Card className="p-6 font-['Open_Sans'] text-sm flex-1 overflow-auto mx-auto max-w-[210mm]" ref={ref}>
          <div className="flex justify-between items-start mb-6 px-6">
            <div className="flex-shrink-0">
              {clinicInfo.logo ? (
                <img 
                  src={clinicInfo.logo} 
                  alt={`${clinicInfo.name} Logo`} 
                  className="h-14 mb-2 object-contain"
                />
              ) : (
                <img 
                  src="/placeholder.svg" 
                  alt="Clinic Logo" 
                  className="h-14 mb-2"
                />
              )}
            </div>
            
            <div className="text-right">
              <h2 className="font-semibold text-lg text-emerald-600">{clinicInfo.name}</h2>
              <p className="text-muted-foreground">
                {clinicInfo.address}, {clinicInfo.city}<br />
                {clinicInfo.email}<br />
                {clinicInfo.phone}
              </p>
            </div>
          </div>

          <div className="mb-6 px-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="font-bold">Ime i Prezime: {patient ? patient.name : ""}</p>
                <p>Datum rođenja: {patient ? formatDate(patient.dob) : ""}</p>
                <p>Spol: {patient ? (patient.gender === "M" ? "Muški" : "Ženski") : ""}</p>
                <p>JMBG: {patient ? patient.jmbg : ""}</p>
                <p className="mt-2">Datum i vrijeme ispisa: {nowDateTime}</p>
                <p>Izdao: {displayedDoctorName}</p>
              </div>
              {appointmentType && (
                <div className="flex items-center justify-end">
                  <p className="font-medium text-emerald-700 text-right">
                    Vrsta pregleda: {appointmentType}
                  </p>
                </div>
              )}
            </div>
          </div>

          <Separator className="mb-6 mx-6" />

          <div className="space-y-6 px-6 leading-relaxed">
            <div>
              <h3 className="font-bold text-base mb-3">Nalaz</h3>
              <div className="bg-gray-50 p-4 rounded-md border border-gray-100 min-h-[100px]">
                <p className="whitespace-pre-wrap leading-relaxed">
                  {reportText || "Ovdje će biti prikazan tekst nalaza koji korisnik unosi..."}
                </p>
              </div>
            </div>

            <div>
              <h3 className="font-bold text-base mb-3">Terapija i preporuke</h3>
              <div className="bg-gray-50 p-4 rounded-md border border-gray-100 min-h-[100px]">
                <p className="whitespace-pre-wrap leading-relaxed">
                  {therapyText || "Ovdje će biti prikazana terapija i preporuke..."}
                </p>
              </div>
            </div>
            
            {(showSignature || showStamp) && (
              <div className="mt-16 pt-8 text-right">
                <div className="flex justify-end items-end space-x-4">
                  {showSignature && (
                    <div className="text-center">
                      <div className="border-b border-black w-32 mb-1"></div>
                      <p className="text-xs text-gray-600">
                        {displayedDoctorName}
                      </p>
                    </div>
                  )}
                  
                  {showStamp && (
                    <div className="border-2 border-dashed border-gray-300 rounded-full w-24 h-24 flex items-center justify-center text-gray-400">
                      Pečat
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>
    );
  }
);

MedicalReportPreview.displayName = "MedicalReportPreview";

export default MedicalReportPreview;
