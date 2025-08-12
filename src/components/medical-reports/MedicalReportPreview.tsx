
import { forwardRef, useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import { format } from "date-fns";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";
import { buildReportQR } from "@/utils/qrUtils";

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
  reportCode?: string;
  signatureImageUrl?: string;
  stampImageUrl?: string;
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
    verifiedBy,
    appointmentType,
    doctorName,
    reportCode, 
    signatureImageUrl,
    stampImageUrl,
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
    const [fontScale, setFontScale] = useState<number>(() => {
      const saved = localStorage.getItem('reportFontScale');
      const num = saved ? parseFloat(saved) : 1;
      return isNaN(num) ? 1 : num;
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

    // Listen for font scale changes from settings
    useEffect(() => {
      const onScale = (e: any) => {
        const val = e?.detail?.scale;
        if (typeof val === 'number') setFontScale(val);
      };
      window.addEventListener('reportFontScale:changed', onScale);
      return () => window.removeEventListener('reportFontScale:changed', onScale);
    }, []);

// Get the current user's full name for doctor signature and verification
    const currentUserName = user ? `${user.firstName} ${user.lastName}` : "";
    
    // Use current user's name if available, otherwise fall back to provided names or defaults
    const displayedDoctorName = currentUserName || doctorName || "potpis doktora";
    const displayedVerifierName = currentUserName || verifiedBy || "";

    const [qrDataUrl, setQrDataUrl] = useState<string>("");

    useEffect(() => {
      const buildQr = async () => {
        try {
          const clinicInfoRaw = localStorage.getItem('clinicInfo');
          const clinicName = clinicInfoRaw ? (JSON.parse(clinicInfoRaw).name || 'Spark Studio') : 'Spark Studio';
          const url = await buildReportQR({
            reportCode: reportCode || '',
            patient: patient ? { name: patient.name, jmbg: patient.jmbg } : undefined,
            type: appointmentType || '',
            doctor: displayedDoctorName,
            clinicName,
          });
          setQrDataUrl(url);
        } catch (e) {
          console.error('[MedicalReportPreview] QR generation failed', e);
          setQrDataUrl("");
        }
      };
      buildQr();
    }, [patient, reportText, therapyText, appointmentType, displayedDoctorName, reportCode]);

// (removed duplicate name derivations)

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

    const statusLabel = !isSaved
      ? "U uređivanju"
      : verificationStatus === 'verified'
      ? "Verificirano"
      : verificationStatus === 'pending'
      ? "Na verifikaciji"
      : "Nacrt";
    let badgeVariant: 'default' | 'secondary' | 'destructive' | 'outline' = !isSaved
      ? 'outline'
      : verificationStatus === 'verified'
      ? 'default'
      : verificationStatus === 'pending'
      ? 'secondary'
      : 'outline';

    return (
      <div className="flex flex-col h-full">
        <div className="flex justify-between mb-4 print:hidden">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-semibold">Pregled uživo</h2>
            <Badge variant={badgeVariant}>{statusLabel}</Badge>
          </div>
          <Button 
            onClick={onPrint} 
            disabled={!isSaved || verificationStatus !== 'verified'} 
            variant="outline"
            className="flex items-center gap-2"
          >
            <Printer className="h-4 w-4" />
            Print nalaza
          </Button>
        </div>
        
        <Card className="p-6 font-sans text-sm flex-1 overflow-auto mx-auto max-w-[210mm] print:p-0 print:border-0 print:shadow-none print:max-w-full print:overflow-visible" ref={ref}>
          <div className="flex justify-between items-start mb-4 px-6">
            <div className="flex-shrink-0">
              {clinicInfo.logo ? (
                <img 
                  src={clinicInfo.logo} 
                  alt={`${clinicInfo.name} Logo`} 
                  className="h-12 mb-2 object-contain"
                />
              ) : (
                <div className="h-12 mb-2 flex items-center justify-center bg-accent rounded-md px-4">
                  <span className="text-primary font-bold font-heading">{clinicInfo.name}</span>
                </div>
              )}
            </div>
            
            <div className="text-right">
              <h2 className="font-heading font-semibold text-base text-primary">{clinicInfo.name}</h2>
              <p className="text-muted-foreground text-xs">
                {clinicInfo.address}, {clinicInfo.city}<br />
                {clinicInfo.email}<br />
                {clinicInfo.phone}
              </p>
            </div>
          </div>

          <div className="mb-4 px-6">
            <div className="grid md:grid-cols-2 gap-4 print:grid-cols-2">
              <div>
                <p className="font-medium text-xs">Ime i Prezime: {patient ? patient.name : ""}</p>
                <p className="text-xs text-muted-foreground">Datum rođenja: {patient ? formatDate(patient.dob) : ""}</p>
                <p className="text-xs text-muted-foreground">Spol: {patient ? (patient.gender === "M" ? "Muški" : "Ženski") : ""}</p>
                <p className="text-xs text-muted-foreground">JMBG: {patient ? patient.jmbg : ""}</p>
                <p className="mt-1 text-xs text-muted-foreground">Datum i vrijeme ispisa: {nowDateTime}</p>
                <p className="text-xs text-muted-foreground">Izdao: {displayedDoctorName}</p>
              </div>
              <div className="flex flex-col items-end justify-start">
                {reportCode && (
                  <p className="font-medium text-sm bg-accent/40 p-2 px-3 rounded-md border border-border text-primary mb-2">
                    Broj nalaza: {reportCode}
                  </p>
                )}
                {qrDataUrl && (
                  <img src={qrDataUrl} alt="QR kod nalaza" className="w-24 h-24 mb-2" />
                )}
                {appointmentType && (
                  <div className="mt-1">
                    <p className="font-medium text-xs text-primary text-right">
                      Vrsta pregleda: <span className="font-normal text-foreground">{appointmentType}</span>
                    </p>
                    {verificationStatus === 'verified' && (
                      <div className="flex flex-col items-end mt-1">
                        <div className="flex items-center text-primary justify-end">
                          <div className="h-2 w-2 bg-primary rounded-full mr-1"></div>
                          <p className="text-xs">Verificirano</p>
                        </div>
                        {displayedVerifierName && (
                          <p className="text-xs text-muted-foreground mt-1">Verificirao: {displayedVerifierName}</p>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          <Separator className="mb-5 mx-6" />

          <div className="space-y-6 px-6 leading-relaxed">
            <div>
              <h3 className="font-heading font-semibold text-lg mb-3">Nalaz</h3>
              <div className="bg-accent/40 p-4 rounded-md border border-border min-h-[150px] print:bg-transparent print:border-0 print:p-0">
                <p className="whitespace-pre-wrap leading-relaxed" style={{ fontSize: `${(14 * fontScale).toFixed(2)}px` }}>
                  {reportText || "Ovdje će biti prikazan tekst nalaza koji korisnik unosi..."}
                </p>
              </div>
            </div>

            <div>
              <h3 className="font-heading font-semibold text-lg mb-3">Terapija i preporuke</h3>
              <div className="bg-accent/40 p-4 rounded-md border border-border min-h-[150px] print:bg-transparent print:border-0 print:p-0">
                <p className="whitespace-pre-wrap leading-relaxed" style={{ fontSize: `${(14 * fontScale).toFixed(2)}px` }}>
                  {therapyText || "Ovdje će biti prikazana terapija i preporuke..."}
                </p>
              </div>
            </div>
            
            {(showSignature || showStamp) && (
              <div className="mt-14 pt-8 text-right">
                <div className="flex justify-end items-end space-x-4">
                  {showSignature && (
                    <div className="text-center">
                      {signatureImageUrl ? (
                        <img src={signatureImageUrl} alt="Potpis doktora" className="h-16 object-contain mx-auto mb-1" />
                      ) : (
                        <div className="border-b border-black w-32 mb-1"></div>
                      )}
                      <p className="text-xs text-gray-600">
                        {displayedDoctorName}
                      </p>
                    </div>
                  )}
                  
                  {showStamp && (
                    stampImageUrl ? (
                      <img src={stampImageUrl} alt="Pečat" className="w-24 h-24 object-contain" />
                    ) : (
                      <div className="border-2 border-dashed border-gray-300 rounded-full w-24 h-24 flex items-center justify-center text-gray-400 print:border-gray-400">
                        Pečat
                      </div>
                    )
                  )}
                </div>
              </div>
            )}
          </div>
          
          {/* Footer - only visible in print */}
          <div className="hidden print:block mt-10 pt-8 border-t text-center text-xs text-gray-500 px-6">
            <p>{clinicInfo.name} - {clinicInfo.address}, {clinicInfo.city}</p>
            <p>{clinicInfo.phone} | {clinicInfo.email}</p>
          </div>
        </Card>
      </div>
    );
  }
);

MedicalReportPreview.displayName = "MedicalReportPreview";

export default MedicalReportPreview;
