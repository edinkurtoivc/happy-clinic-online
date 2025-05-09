
import { forwardRef, useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
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
  reportCode?: string; // Added report code prop
}

const MedicalReportPreview = forwardRef<HTMLDivElement, MedicalReportPreviewProps>(
  ({ 
    patient, 
    reportText, 
    therapyText, 
    showSignature, 
    showStamp, 
    onPrint, 
    isSaved,
    verificationStatus = 'unverified',
    appointmentType,
    doctorName,
    reportCode, // Added report code parameter
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
        <div className="flex justify-between mb-4 print:hidden">
          <h2 className="text-xl font-semibold">Pregled uživo</h2>
        </div>
        
        <Card className="p-6 font-['Open_Sans'] text-sm flex-1 overflow-auto mx-auto max-w-[210mm] print:p-0 print:border-0 print:shadow-none print:max-w-full print:overflow-visible" ref={ref}>
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
            <div className="grid md:grid-cols-2 gap-4 print:grid-cols-2">
              <div>
                <p className="font-bold">Ime i Prezime: {patient ? patient.name : ""}</p>
                <p>Datum rođenja: {patient ? formatDate(patient.dob) : ""}</p>
                <p>Spol: {patient ? (patient.gender === "M" ? "Muški" : "Ženski") : ""}</p>
                <p>JMBG: {patient ? patient.jmbg : ""}</p>
                <p className="mt-2">Datum i vrijeme ispisa: {nowDateTime}</p>
                <p>Izdao: {displayedDoctorName}</p>
              </div>
              <div className="flex flex-col items-end justify-start">
                {reportCode && (
                  <p className="font-bold bg-gray-100 p-1 px-2 rounded border text-emerald-700 mb-2">
                    Broj nalaza: {reportCode}
                  </p>
                )}
                {appointmentType && (
                  <p className="font-medium text-emerald-700 text-right">
                    Vrsta pregleda: {appointmentType}
                  </p>
                )}
              </div>
            </div>
          </div>

          <Separator className="mb-6 mx-6" />

          <div className="space-y-6 px-6 leading-relaxed">
            <div>
              <h3 className="font-bold text-base mb-3">Nalaz</h3>
              <div className="bg-gray-50 p-4 rounded-md border border-gray-100 min-h-[100px] print:bg-transparent print:border-0 print:p-0">
                <p className="whitespace-pre-wrap leading-relaxed">
                  {reportText || "Ovdje će biti prikazan tekst nalaza koji korisnik unosi..."}
                </p>
              </div>
            </div>

            <div>
              <h3 className="font-bold text-base mb-3">Terapija i preporuke</h3>
              <div className="bg-gray-50 p-4 rounded-md border border-gray-100 min-h-[100px] print:bg-transparent print:border-0 print:p-0">
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
